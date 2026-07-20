'use client';
import { useState, useEffect, useRef } from 'react';
import { X, User, Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  inline?: boolean;
}

export default function AuthModal({ isOpen, onClose, inline = false }: AuthModalProps) {
  const [step, setStep] = useState<'phone' | 'otp' | 'profile'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<'guest' | 'host'>('guest');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  const otpInputsRef = useRef<HTMLInputElement[]>([]);

  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => setResendTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

  if (!isOpen && !inline) return null;

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.signInWithOtp({
        phone: `+91${cleanPhone}`,
      });

      if (err) {
        setError(err.message || 'Failed to send verification code. Please try again.');
        setLoading(false);
        return;
      }

      setStep('otp');
      setResendTimer(30);
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter the full 6-digit code');
      return;
    }

    setLoading(true);
    try {
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      const supabase = createClient();
      const { data, error: err } = await supabase.auth.verifyOtp({
        phone: `+91${cleanPhone}`,
        token: otpCode,
        type: 'sms',
      });

      if (err) throw err;

      if (data.session) {
        localStorage.setItem('flexi_access_token', data.session.access_token);

        // Check if user already has a profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, full_name, email, phone, role')
          .eq('id', data.user!.id)
          .single();

        if (profile && profile.full_name) {
          localStorage.setItem('flexi_user', JSON.stringify({
            id: data.user!.id,
            name: profile.full_name,
            email: profile.email,
            role: profile.role || 'guest',
            phone: profile.phone || cleanPhone
          }));

          setLoading(false);
          onClose();
          window.location.href = profile.role === 'host' ? '/host' : '/dashboard';
        } else {
          // New user — go to profile creation
          setStep('profile');
        }
      }
    } catch (err: any) {
      setError(err.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError('Please provide your full name');
      return;
    }

    setLoading(true);
    try {
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      const supabase = createClient();

      const { data, error: err } = await supabase.auth.updateUser({
        data: { full_name: fullName, phone: cleanPhone, role: selectedRole }
      });

      if (err) throw err;

      // Update the profiles table
      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: fullName,
        email: email || data.user.email || '',
        phone: cleanPhone,
        role: selectedRole
      });

      localStorage.setItem('flexi_user', JSON.stringify({
        id: data.user.id,
        name: fullName,
        email: email || data.user.email || '',
        role: selectedRole,
        phone: cleanPhone
      }));

      setLoading(false);
      onClose();
      window.location.href = selectedRole === 'host' ? '/host' : '/dashboard';
    } catch (err: any) {
      setError(err.message || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length > 0) {
      const newOtp = [...otp];
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtp(newOtp);
      const focusIndex = Math.min(pastedData.length, 5);
      otpInputsRef.current[focusIndex]?.focus();
    }
  };

  const resetModal = () => {
    setStep('phone');
    setPhoneNumber('');
    setOtp(Array(6).fill(''));
    setFullName('');
    setEmail('');
    setError('');
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <div className={inline ? 'auth-inline' : 'auth-backdrop'} onClick={inline ? undefined : handleClose}>
      <style>{`
        .auth-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.45);
          backdrop-filter: blur(4px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }
        .auth-card {
          width: 100%;
          max-width: 440px;
          background: white;
          border-radius: 24px;
          padding: 40px 32px;
          box-shadow: 0 10px 40px rgba(35, 31, 32, 0.1);
          border: 1.5px solid #e2e8f0;
          position: relative;
          text-align: left;
          animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .auth-inline .auth-card {
          margin: 40px auto;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .close-btn {
          position: absolute;
          right: 20px;
          top: 20px;
          border: none;
          background: none;
          cursor: pointer;
          color: #94a3b8;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          transition: all 0.15s ease;
        }
        .close-btn:hover {
          background: #f1f5f9;
          color: #231f20;
        }
        .back-btn {
          position: absolute;
          left: 20px;
          top: 20px;
          border: none;
          background: none;
          cursor: pointer;
          color: #94a3b8;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          transition: all 0.15s ease;
        }
        .back-btn:hover {
          background: #f1f5f9;
          color: #231f20;
        }
        
        .modal-title {
          font-size: 26px;
          font-weight: 900;
          color: #231f20;
          margin-bottom: 8px;
          letter-spacing: -0.03em;
        }
        .modal-desc {
          font-size: 15px;
          color: #5e5e5e;
          line-height: 1.5;
          margin-bottom: 32px;
        }
        .bold-phone {
          color: #231f20;
          font-weight: 700;
        }
        
        .modal-alert {
          background: #fff1f2;
          border: 1.5px solid #fecdd3;
          color: #e11d48;
          border-radius: 12px;
          padding: 12px 14px;
          margin-bottom: 24px;
          font-size: 13.5px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
        }
        
        .modal-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .modal-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .modal-label {
          font-size: 13.5px;
          font-weight: 700;
          color: #231f20;
        }
        .phone-input-row {
          display: flex;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .phone-input-row:focus-within {
          border-color: #5433b0;
          box-shadow: 0 0 0 3px rgba(84, 51, 176, 0.1);
        }
        .country-prefix {
          padding: 12px 16px;
          background: #f8fafc;
          border-right: 1.5px solid #e2e8f0;
          font-size: 15px;
          font-weight: 700;
          color: #231f20;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .phone-field {
          flex: 1;
          padding: 12px 16px;
          font-size: 15px;
          border: none;
          outline: none;
          color: #231f20;
          font-weight: 500;
          letter-spacing: 0.05em;
        }
        .phone-field::placeholder {
          color: #94a3b8;
          letter-spacing: normal;
        }
        
        .otp-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 10px;
          margin-bottom: 8px;
        }
        .otp-box {
          width: 100%;
          box-sizing: border-box;
          height: 48px;
          text-align: center;
          font-size: 20px;
          font-weight: 800;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          outline: none;
          color: #231f20;
          transition: all 0.2s ease;
        }
        .otp-box:focus {
          border-color: #5433b0;
          box-shadow: 0 0 0 3px rgba(84, 51, 176, 0.1);
          background: #faf9ff;
        }
        
        .resend-box {
          text-align: center;
          font-size: 13.5px;
          color: #5e5e5e;
          margin-top: 4px;
        }
        .resend-link {
          color: #5433b0;
          font-weight: 700;
          text-decoration: none;
          border: none;
          background: none;
          padding: 0;
          cursor: pointer;
        }
        .resend-link:hover {
          text-decoration: underline;
        }
        .resend-link:disabled {
          color: #94a3b8;
          cursor: not-allowed;
          text-decoration: none;
        }
        
        .profile-field-wrapper {
          position: relative;
        }
        .profile-input {
          width: 100%;
          padding: 12px 14px 12px 42px;
          font-size: 15px;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          outline: none;
          color: #231f20;
          font-weight: 500;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }
        .profile-input:focus {
          border-color: #5433b0;
          box-shadow: 0 0 0 3px rgba(84, 51, 176, 0.1);
        }
        .profile-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }
        
        .modal-submit {
          background: #5433b0;
          color: white;
          border-radius: 999px;
          padding: 14px 28px;
          font-size: 15px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s ease;
          width: 100%;
          margin-top: 8px;
        }
        .modal-submit:hover {
          background: #43229f;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(84, 51, 176, 0.25);
        }
        .modal-submit:disabled {
          background: #cbd5e1;
          color: #94a3b8;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
        
        .modal-terms {
          font-size: 12.5px;
          color: #5e5e5e;
          line-height: 1.5;
          text-align: center;
          margin-top: 8px;
        }
        .modal-terms-link {
          color: #5433b0;
          text-decoration: none;
          font-weight: 600;
        }
        .modal-terms-link:hover {
          text-decoration: underline;
        }
      `}</style>

      <div className="auth-card" onClick={e => e.stopPropagation()}>
        {!inline && (
          <button className="close-btn" onClick={handleClose} aria-label="Close modal">
            <X size={18} />
          </button>
        )}
        
        {step === 'otp' && (
          <button className="back-btn" onClick={() => setStep('phone')} aria-label="Go back">
            <ArrowLeft size={18} />
          </button>
        )}

        {step === 'profile' && (
          <button className="back-btn" onClick={() => setStep('otp')} aria-label="Go back">
            <ArrowLeft size={18} />
          </button>
        )}

        {step === 'phone' && (
          <>
            <h2 className="modal-title">Welcome to Flexi</h2>
            <p className="modal-desc">Enter your phone number to sign in or sign up instantly.</p>

            {error && (
              <div className="modal-alert">
                <span>⚠️</span> {error}
              </div>
            )}

            <form onSubmit={handleSendOTP} className="modal-form">
              <div className="modal-group">
                <label className="modal-label">Phone Number</label>
                <div className="phone-input-row">
                  <div className="country-prefix">
                    <span>🇮🇳</span>
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    className="phone-field"
                    placeholder="98765 43210"
                    maxLength={10}
                    required
                    value={phoneNumber}
                    onChange={e => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
              </div>

              <button type="submit" className="modal-submit" disabled={loading}>
                {loading ? 'Sending code...' : <>Continue <ArrowRight size={16} /></>}
              </button>

              <p className="modal-terms">
                By continuing, you agree to Flexi&apos;s <a href="/terms" className="modal-terms-link">Terms of Service</a> and <a href="/privacy" className="modal-terms-link">Privacy Policy</a>.
              </p>
            </form>
          </>
        )}

        {step === 'otp' && (
          <>
            <h2 className="modal-title">Enter OTP Code</h2>
            <p className="modal-desc">
              We sent a 6-digit verification code to <span className="bold-phone">+91 {phoneNumber}</span>.
            </p>

            {error && (
              <div className="modal-alert">
                <span>⚠️</span> {error}
              </div>
            )}

            <form onSubmit={handleVerifyOTP} className="modal-form">
              <div className="modal-group">
                <label className="modal-label">6-Digit Verification Code</label>
                <div className="otp-grid">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => { otpInputsRef.current[i] = el!; }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      className="otp-box"
                      value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      onPaste={i === 0 ? handleOtpPaste : undefined}
                      required
                    />
                  ))}
                </div>
              </div>

              <button type="submit" className="modal-submit" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>

              <div className="resend-box">
                Didn&apos;t receive code?{' '}
                <button
                  type="button"
                  className="resend-link"
                  disabled={resendTimer > 0}
                  onClick={() => {
                    setResendTimer(30);
                    setError('');
                    handleSendOTP(new Event('submit') as any);
                  }}
                >
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend code'}
                </button>
              </div>
            </form>
          </>
        )}

        {step === 'profile' && (
          <>
            <h2 className="modal-title">Complete Profile</h2>
            <p className="modal-desc">Welcome to Flexi! Tell us a bit about yourself to finish signing up.</p>

            {error && (
              <div className="modal-alert">
                <span>⚠️</span> {error}
              </div>
            )}

            <form onSubmit={handleCreateProfile} className="modal-form">
              <div className="modal-group">
                <label className="modal-label">Full Name</label>
                <div className="profile-field-wrapper">
                  <input
                    type="text"
                    className="profile-input"
                    placeholder="Your full name"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                  />
                  <User size={16} className="profile-icon" />
                </div>
              </div>

              <div className="modal-group">
                <label className="modal-label">Email Address (optional)</label>
                <div className="profile-field-wrapper">
                  <input
                    type="email"
                    className="profile-input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                  <Mail size={16} className="profile-icon" />
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label className="modal-label">I want to join as a</label>
                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  <button 
                    type="button"
                    onClick={() => setSelectedRole('guest')}
                    style={{ flex: 1, padding: '12px', borderRadius: 8, border: `2px solid ${selectedRole === 'guest' ? 'var(--primary)' : 'var(--border-light)'}`, background: selectedRole === 'guest' ? '#f0f9ff' : 'white', fontWeight: 600, color: selectedRole === 'guest' ? 'var(--primary)' : 'var(--text-secondary)' }}
                  >
                    Guest (Book Cars)
                  </button>
                  <button 
                    type="button"
                    onClick={() => setSelectedRole('host')}
                    style={{ flex: 1, padding: '12px', borderRadius: 8, border: `2px solid ${selectedRole === 'host' ? 'var(--primary)' : 'var(--border-light)'}`, background: selectedRole === 'host' ? '#f0f9ff' : 'white', fontWeight: 600, color: selectedRole === 'host' ? 'var(--primary)' : 'var(--text-secondary)' }}
                  >
                    Host (List Cars)
                  </button>
                </div>
              </div>

              <button type="submit" className="modal-submit" disabled={loading}>
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

'use client';
import { useState, useEffect } from 'react';
import { Shield, Upload, CheckCircle, AlertCircle } from 'lucide-react';

export default function HostKYCPage() {
  const [kycStatus, setKycStatus] = useState<'not_submitted' | 'pending' | 'verified' | 'rejected'>('not_submitted');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('flexi_host_kyc');
    if (stored) {
      setKycStatus(JSON.parse(stored).status);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      const newStatus = { status: 'pending', submittedAt: new Date().toISOString() };
      localStorage.setItem('flexi_host_kyc', JSON.stringify(newStatus));
      setKycStatus('pending');
      setIsSubmitting(false);
    }, 1500);
  };

  if (kycStatus === 'verified') {
    return (
      <div className="card" style={{ padding: 40, textAlign: 'center', maxWidth: 600, margin: '0 auto', marginTop: 40 }}>
        <CheckCircle size={64} color="#16a34a" style={{ margin: '0 auto 24px' }} />
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>You're Verified!</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Your identity and background checks are complete. You are fully approved to host vehicles on Flexi.</p>
      </div>
    );
  }

  if (kycStatus === 'pending') {
    return (
      <div className="card" style={{ padding: 40, textAlign: 'center', maxWidth: 600, margin: '0 auto', marginTop: 40 }}>
        <Shield size={64} color="var(--primary)" style={{ margin: '0 auto 24px' }} />
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>Verification in Progress</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>We are reviewing your documents. This usually takes 2-4 hours. We will notify you once you're approved.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Host Verification</h1>
        <p style={{ color: 'var(--text-secondary)' }}>To ensure community safety, all hosts must complete identity verification before listing cars.</p>
      </div>

      <form onSubmit={handleSubmit} className="card" style={{ padding: 32 }}>
        <div style={{ display: 'grid', gap: 24 }}>
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>Aadhar Card / Identity Proof</label>
            <div style={{ border: '2px dashed var(--border-light)', borderRadius: 12, padding: 32, textAlign: 'center', cursor: 'pointer', background: '#f8fafc' }}>
              <Upload size={24} color="var(--text-secondary)" style={{ margin: '0 auto 12px' }} />
              <div style={{ fontWeight: 600 }}>Click to upload front & back</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>JPG, PNG or PDF (Max 5MB)</div>
            </div>
          </div>
          
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>Driver's License (Optional for non-driving hosts)</label>
            <div style={{ border: '2px dashed var(--border-light)', borderRadius: 12, padding: 32, textAlign: 'center', cursor: 'pointer', background: '#f8fafc' }}>
              <Upload size={24} color="var(--text-secondary)" style={{ margin: '0 auto 12px' }} />
              <div style={{ fontWeight: 600 }}>Click to upload</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Required if you will be delivering the cars.</div>
            </div>
          </div>
          
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>Bank Details (For Payouts)</label>
            <input required type="text" placeholder="Account Holder Name" style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border-light)', borderRadius: 8, marginBottom: 12 }} />
            <input required type="text" placeholder="Account Number" style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border-light)', borderRadius: 8, marginBottom: 12 }} />
            <input required type="text" placeholder="IFSC Code" style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border-light)', borderRadius: 8 }} />
          </div>
        </div>

        <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--border-light)' }}>
          <button type="submit" className="btn btn-primary btn-full" disabled={isSubmitting} style={{ padding: 16, fontSize: 16 }}>
            {isSubmitting ? 'Submitting...' : 'Submit for Verification'}
          </button>
        </div>
      </form>
    </div>
  );
}

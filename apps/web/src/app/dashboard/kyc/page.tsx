'use client';
import { useState, useEffect } from 'react';
import { Upload, CheckCircle, Clock, XCircle, FileText, Camera, Shield, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase';

type KYCStatus = 'not_submitted' | 'pending' | 'verified' | 'rejected';

export default function KYCPage() {
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<KYCStatus>('not_submitted');
  const [uploads, setUploads] = useState({ dl_front: false, dl_back: false, id_proof: false, selfie: false });
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const userStr = localStorage.getItem('flexi_user');
      if (!userStr) return;

      const user = JSON.parse(userStr);
      setUserId(user.id);

      const { data } = await supabase.from('kyc_records').select('*').eq('user_id', user.id).maybeSingle();
      if (data) {
        setStatus(data.status as KYCStatus);
        if (data.status === 'pending' || data.status === 'verified') setStep(3);
        if (data.documents) {
          setUploads({
            dl_front: !!data.documents.dl_front,
            dl_back: !!data.documents.dl_back,
            id_proof: !!data.documents.id_proof,
            selfie: !!data.documents.selfie,
          });
        }
      }
    }
    load();
  }, []);

  const statusConfig = {
    not_submitted: { icon: <Shield size={24} color="#64748b" />, label: 'Not Submitted', color: '#64748b', bg: '#f8fafc', desc: 'Please submit your documents to get verified.' },
    pending: { icon: <Clock size={24} color="#d97706" />, label: 'Under Review', color: '#d97706', bg: '#fffbeb', desc: 'Your documents are being reviewed. This usually takes a few moments.' },
    verified: { icon: <CheckCircle size={24} color="#16a34a" />, label: 'Verified ✅', color: '#16a34a', bg: '#f0fdf4', desc: 'Your identity has been verified. You can now book cars on Flexi.' },
    rejected: { icon: <XCircle size={24} color="var(--accent)" />, label: 'Rejected', color: 'var(--accent)', bg: '#fff1f2', desc: 'Your documents were rejected. Please resubmit with clear, valid documents.' },
  };

  const cfg = statusConfig[status];
  const STEPS = ['Driving Licence', 'ID Proof', 'Selfie', 'Review'];

  const handleFileChange = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setUploads(prev => ({ ...prev, [key]: true }));
    }
  };

  const handleSubmitKYC = async () => {
    if (!userId) return;
    setSubmitting(true);

    const supabase = createClient();
    const docs = {
      dl_front: uploads.dl_front ? 'uploaded' : '',
      dl_back: uploads.dl_back ? 'uploaded' : '',
      id_proof: uploads.id_proof ? 'uploaded' : '',
      selfie: uploads.selfie ? 'uploaded' : '',
    };

    // Upsert KYC record
    const { error } = await supabase.from('kyc_records').upsert({
      user_id: userId,
      status: 'pending',
      documents: docs,
      submitted_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    if (error) {
      console.error('KYC submit error:', error);
      alert('Error submitting KYC: ' + error.message);
      setSubmitting(false);
      return;
    }

    setStatus('pending');
    setStep(3);

    // Auto-verify after 3 seconds (demo simulation)
    setTimeout(async () => {
      await supabase.from('kyc_records').update({
        status: 'verified',
        verified_at: new Date().toISOString(),
      }).eq('user_id', userId);
      setStatus('verified');
      setSubmitting(false);
    }, 3000);
  };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>KYC Verification</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Complete identity verification to book cars</p>
      </div>

      {/* Status Banner */}
      <div style={{ background: cfg.bg, border: `1px solid ${cfg.color}33`, borderRadius: 14, padding: '16px 20px', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 14 }}>
        {cfg.icon}
        <div>
          <div style={{ fontWeight: 700, color: cfg.color }}>{cfg.label}</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{cfg.desc}</div>
        </div>
        {submitting && <Loader2 size={20} className="spinner" style={{ marginLeft: 'auto' }} />}
      </div>

      {/* Step Progress */}
      {status !== 'verified' && (
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32 }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: i < step ? 'pointer' : 'default' }} onClick={() => i < step && setStep(i)}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, background: i <= step ? 'var(--primary)' : 'var(--border-light)', color: i <= step ? 'white' : 'var(--text-secondary)', transition: 'all 0.2s' }}>{i < step ? '✓' : i + 1}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: i === step ? 'var(--primary)' : 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{s}</div>
              </div>
              {i < STEPS.length - 1 && <div style={{ flex: 1, height: 2, background: i < step ? 'var(--primary)' : 'var(--border-light)', margin: '0 8px', marginBottom: 22, transition: 'background 0.2s' }} />}
            </div>
          ))}
        </div>
      )}

      {/* Step 0: Driving Licence */}
      {step === 0 && (
        <div className="card" style={{ padding: 28 }}>
          <h2 style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Driving Licence</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>Upload both sides of your valid Indian Driving Licence.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            {[{ key: 'dl_front', label: 'Front Side' }, { key: 'dl_back', label: 'Back Side' }].map(({ key, label }) => (
              <label key={key} style={{ border: `2px dashed ${uploads[key as keyof typeof uploads] ? 'var(--primary)' : 'var(--border-light)'}`, borderRadius: 12, padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, cursor: 'pointer', background: uploads[key as keyof typeof uploads] ? '#eff6ff' : 'white', transition: 'all 0.2s' }}>
                <input type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={handleFileChange(key)} />
                {uploads[key as keyof typeof uploads] ? <CheckCircle size={32} color="var(--primary)" /> : <Upload size={32} color="var(--text-secondary)" />}
                <span style={{ fontSize: 14, fontWeight: 600, color: uploads[key as keyof typeof uploads] ? 'var(--primary)' : 'var(--text-dark)' }}>{uploads[key as keyof typeof uploads] ? '✓ Uploaded' : label}</span>
              </label>
            ))}
          </div>
          <button onClick={() => setStep(1)} className="btn btn-primary" disabled={!uploads.dl_front || !uploads.dl_back}>Continue →</button>
        </div>
      )}

      {/* Step 1: ID Proof */}
      {step === 1 && (
        <div className="card" style={{ padding: 28 }}>
          <h2 style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Identity Proof</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>Upload your Aadhaar Card, Passport, or Voter ID.</p>
          <label style={{ border: `2px dashed ${uploads.id_proof ? 'var(--primary)' : 'var(--border-light)'}`, borderRadius: 12, padding: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, cursor: 'pointer', background: uploads.id_proof ? '#eff6ff' : 'white', marginBottom: 24 }}>
            <input type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={handleFileChange('id_proof')} />
            {uploads.id_proof ? <CheckCircle size={40} color="var(--primary)" /> : <FileText size={40} color="var(--text-secondary)" />}
            <span style={{ fontSize: 15, fontWeight: 600, color: uploads.id_proof ? 'var(--primary)' : 'var(--text-dark)' }}>{uploads.id_proof ? '✓ Document Uploaded' : 'Click to upload ID proof'}</span>
          </label>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => setStep(0)} className="btn btn-outline">← Back</button>
            <button onClick={() => setStep(2)} className="btn btn-primary" disabled={!uploads.id_proof}>Continue →</button>
          </div>
        </div>
      )}

      {/* Step 2: Selfie */}
      {step === 2 && (
        <div className="card" style={{ padding: 28 }}>
          <h2 style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Selfie Verification</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>Take a clear selfie holding your ID document for verification.</p>
          <label style={{ border: `2px dashed ${uploads.selfie ? 'var(--primary)' : 'var(--border-light)'}`, borderRadius: 12, padding: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, cursor: 'pointer', background: uploads.selfie ? '#eff6ff' : 'white', marginBottom: 24 }}>
            <input type="file" accept="image/*" capture="user" style={{ display: 'none' }} onChange={handleFileChange('selfie')} />
            {uploads.selfie ? <CheckCircle size={40} color="var(--primary)" /> : <Camera size={40} color="var(--text-secondary)" />}
            <span style={{ fontSize: 15, fontWeight: 600, color: uploads.selfie ? 'var(--primary)' : 'var(--text-dark)' }}>{uploads.selfie ? '✓ Selfie Uploaded' : 'Take a selfie'}</span>
          </label>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => setStep(1)} className="btn btn-outline">← Back</button>
            <button onClick={() => setStep(3)} className="btn btn-primary" disabled={!uploads.selfie}>Review & Submit →</button>
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div className="card" style={{ padding: 28 }}>
          <h2 style={{ fontWeight: 700, fontSize: 18, marginBottom: 20 }}>Review & Submit</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 28 }}>
            {[
              { key: 'dl_front', label: 'DL Front' },
              { key: 'dl_back', label: 'DL Back' },
              { key: 'id_proof', label: 'ID Proof' },
              { key: 'selfie', label: 'Selfie' },
            ].map(({ key, label }) => (
              <div key={key} style={{ padding: '14px 18px', border: '1px solid var(--border-light)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                {uploads[key as keyof typeof uploads] ? <CheckCircle size={20} color="#16a34a" /> : <XCircle size={20} color="var(--accent)" />}
                <span style={{ fontWeight: 600 }}>{label}</span>
                <span style={{ fontSize: 12, color: uploads[key as keyof typeof uploads] ? '#16a34a' : 'var(--accent)', marginLeft: 'auto' }}>{uploads[key as keyof typeof uploads] ? 'Ready' : 'Missing'}</span>
              </div>
            ))}
          </div>

          {status === 'verified' ? (
            <div style={{ textAlign: 'center', padding: 20 }}>
              <CheckCircle size={48} color="#16a34a" style={{ marginBottom: 12 }} />
              <div style={{ fontSize: 20, fontWeight: 800, color: '#16a34a' }}>Identity Verified!</div>
              <div style={{ color: 'var(--text-secondary)', marginTop: 8 }}>You are now eligible to book cars on Flexi.</div>
            </div>
          ) : status === 'pending' ? (
            <div style={{ textAlign: 'center', padding: 20 }}>
              <Loader2 size={40} className="spinner" color="#d97706" style={{ marginBottom: 12 }} />
              <div style={{ fontSize: 18, fontWeight: 700, color: '#d97706' }}>Verifying your documents...</div>
              <div style={{ color: 'var(--text-secondary)', marginTop: 8 }}>This usually takes a few moments.</div>
            </div>
          ) : (
            <button onClick={handleSubmitKYC} disabled={submitting || !uploads.dl_front || !uploads.dl_back || !uploads.id_proof || !uploads.selfie} className="btn btn-primary" style={{ width: '100%', padding: 16, fontSize: 16, fontWeight: 800 }}>
              {submitting ? <><Loader2 size={18} className="spinner" /> Submitting...</> : 'Submit for Verification'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

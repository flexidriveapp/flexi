'use client';
import { useState, useEffect } from 'react';
import { User, Mail, Phone, Shield, CheckCircle, Save } from 'lucide-react';
import { createClient } from '@/lib/supabase';

export default function ProfilePage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const userStr = localStorage.getItem('flexi_user');
      if (!userStr) { setLoading(false); return; }

      const user = JSON.parse(userStr);
      setUserId(user.id);

      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) {
        setName(data.full_name || '');
        setEmail(data.email || '');
        setPhone(data.phone || '');
        setRole(data.role || 'guest');
      }

      const { data: kycData } = await supabase.from('kyc_records').select('status').eq('user_id', user.id).eq('status', 'verified').maybeSingle();
      setIsVerified(!!kycData);

      setLoading(false);
    }
    load();
  }, []);

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from('profiles').update({ full_name: name, email }).eq('id', userId);
    
    if (error) {
      alert('Error saving profile: ' + error.message);
    } else {
      // Update localStorage name too
      const userStr = localStorage.getItem('flexi_user');
      if (userStr) {
        const u = JSON.parse(userStr);
        localStorage.setItem('flexi_user', JSON.stringify({ ...u, name }));
      }
      alert('Profile updated successfully!');
    }
    setSaving(false);
  };

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Loading profile...</div>;
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Profile Settings</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage your personal information and account details</p>
      </div>

      <div className="card" style={{ padding: 32, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 700 }}>
            {name ? name[0].toUpperCase() : 'U'}
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>{name || 'Guest User'}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span className="badge" style={{ background: 'var(--bg-secondary)', color: 'var(--text-dark)', textTransform: 'capitalize' }}>{role}</span>
              {isVerified ? (
                <span className="badge" style={{ background: '#f0fdf4', color: '#16a34a' }}><CheckCircle size={12} style={{ marginRight: 4 }} /> Identity Verified</span>
              ) : (
                <span className="badge" style={{ background: '#fff1f2', color: 'var(--accent)' }}><Shield size={12} style={{ marginRight: 4 }} /> Unverified</span>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: 'var(--text-dark)', marginBottom: 8 }}>
              <User size={16} color="var(--primary)" /> Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              style={{ width: '100%', padding: '12px 16px', border: '1.5px solid var(--border-light)', borderRadius: 10, fontSize: 15, outline: 'none' }}
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: 'var(--text-dark)', marginBottom: 8 }}>
              <Mail size={16} color="var(--primary)" /> Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ width: '100%', padding: '12px 16px', border: '1.5px solid var(--border-light)', borderRadius: 10, fontSize: 15, outline: 'none' }}
              placeholder="Enter your email address"
            />
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: 'var(--text-dark)', marginBottom: 8 }}>
              <Phone size={16} color="var(--primary)" /> Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              style={{ width: '100%', padding: '12px 16px', border: '1.5px solid var(--border-light)', borderRadius: 10, fontSize: 15, outline: 'none', background: '#f8fafc', color: 'var(--text-secondary)' }}
              placeholder="Phone number"
              disabled
              title="Contact support to change your phone number"
            />
          </div>

          <div style={{ paddingTop: 16, marginTop: 8, borderTop: '1px solid var(--border-light)' }}>
            <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 8 }}>
              {saving ? 'Saving...' : <><Save size={16} /> Save Changes</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

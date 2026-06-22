'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Lock, Mail, ArrowRight, ShieldAlert } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error: err } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (err) throw err;

      if (data.session && data.user) {
        // Fetch user profile to ensure they are an admin
        const { data: profile, error: profileErr } = await supabase
          .from('profiles')
          .select('role, full_name, phone')
          .eq('id', data.user.id)
          .single();

        if (profileErr) throw profileErr;

        if (profile.role !== 'admin') {
          // Log them out if they aren't an admin
          await supabase.auth.signOut();
          throw new Error('Unauthorized access. Admin privileges required.');
        }

        localStorage.setItem('flexi_access_token', data.session.access_token);
        localStorage.setItem('flexi_user', JSON.stringify({
          id: data.user.id,
          name: profile.full_name || 'Admin',
          email: data.user.email,
          role: profile.role,
          phone: profile.phone || ''
        }));

        window.location.href = '/admin';
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420, background: 'white', borderRadius: 24, padding: 40, boxShadow: '0 10px 40px rgba(35, 31, 32, 0.1)', border: '1px solid #e2e8f0' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, background: '#1e293b', color: 'white', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <ShieldAlert size={28} />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>Admin Portal</h1>
          <p style={{ color: '#64748b', fontSize: 15, margin: 0 }}>Sign in to access the control panel</p>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', padding: '12px 16px', borderRadius: 12, fontSize: 14, marginBottom: 24, display: 'flex', gap: 8, alignItems: 'center' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@flexi.com"
                style={{ width: '100%', padding: '12px 16px 12px 42px', fontSize: 15, border: '1px solid #cbd5e1', borderRadius: 12, outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = '#1e293b'}
                onBlur={e => e.target.style.borderColor = '#cbd5e1'}
              />
              <Mail size={18} color="#94a3b8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%', padding: '12px 16px 12px 42px', fontSize: 15, border: '1px solid #cbd5e1', borderRadius: 12, outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = '#1e293b'}
                onBlur={e => e.target.style.borderColor = '#cbd5e1'}
              />
              <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              marginTop: 8,
              background: '#1e293b', 
              color: 'white', 
              padding: '14px 24px', 
              borderRadius: 12, 
              fontSize: 15, 
              fontWeight: 600, 
              border: 'none', 
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Authenticating...' : <>Secure Login <ArrowRight size={18} /></>}
          </button>
        </form>
      </div>
    </div>
  );
}

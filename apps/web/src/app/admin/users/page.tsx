'use client';
import { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, Shield, CheckCircle, XCircle } from 'lucide-react';
import { getAllUsers, type AdminUser } from '@/lib/adminStore';

const KYC_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  verified: { label: 'Verified', color: '#16a34a', bg: '#f0fdf4' },
  pending: { label: 'Pending', color: '#d97706', bg: '#fffbeb' },
  rejected: { label: 'Rejected', color: 'var(--accent)', bg: '#fff1f2' },
  not_submitted: { label: 'No KYC', color: '#64748b', bg: '#f8fafc' },
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    // We combine global users, plus overrides for KYC
    const baseUsers = getAllUsers();
    const overrides = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('flexi_admin_kyc_overrides') || '{}') : {};
    
    const withOverrides = baseUsers.map(u => ({
      ...u,
      kycStatus: overrides[u.id] || overrides[u.email] || u.kycStatus
    }));
    
    setUsers(withOverrides);
  }, []);

  const filtered = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Manage Users</h1>
        <p style={{ color: 'var(--text-secondary)' }}>View and manage all registered users on the platform</p>
      </div>

      <div className="card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 280, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: 14, top: 13, color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '12px 14px 12px 40px', border: '1px solid var(--border-light)', borderRadius: 10, fontSize: 14, outline: 'none' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['all', 'guest', 'host', 'admin'] as const).map(role => (
              <button 
                key={role}
                onClick={() => setRoleFilter(role)}
                style={{ 
                  padding: '8px 16px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize',
                  background: roleFilter === role ? 'var(--primary)' : 'white',
                  color: roleFilter === role ? 'white' : 'var(--text-dark)',
                  border: `1px solid ${roleFilter === role ? 'var(--primary)' : 'var(--border-light)'}`
                }}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)', background: '#f8fafc' }}>
                {['User Details', 'Contact', 'Role', 'KYC Status', 'Joined', 'Status', ''].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => {
                const kyc = KYC_BADGE[u.kycStatus] || KYC_BADGE.not_submitted;
                return (
                  <tr key={u.id || u.email} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '16px', minWidth: 200 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                          {u.name[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{u.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>ID: {u.id || 'GUEST'}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: 13 }}>
                      <div>{u.email}</div>
                      <div>{u.phone}</div>
                    </td>
                    <td style={{ padding: '16px', textTransform: 'capitalize', fontWeight: 600 }}>{u.role}</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ background: kyc.bg, color: kyc.color, padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        {u.kycStatus === 'verified' && <CheckCircle size={12} />}
                        {u.kycStatus === 'rejected' && <XCircle size={12} />}
                        {kyc.label}
                      </span>
                    </td>
                    <td style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: 13 }}>
                      {new Date(u.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ color: u.status === 'active' ? '#16a34a' : 'var(--accent)', fontWeight: 600, fontSize: 13, textTransform: 'capitalize' }}>
                        {u.status || 'active'}
                      </span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No users found matching your search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

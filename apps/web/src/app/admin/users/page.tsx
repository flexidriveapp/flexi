'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, Filter, MoreVertical, Shield, CheckCircle, XCircle, UserX, UserCheck, ShieldAlert, Car, FileText } from 'lucide-react';
import { createClient } from '@/lib/supabase';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'guest' | 'host' | 'admin';
  createdAt: string;
  status: 'active' | 'suspended';
  kycStatus: string;
}

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
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const loadUsers = async () => {
    const supabase = createClient();
    const { data: profiles } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    const { data: kycRecords } = await supabase.from('kyc_records').select('user_id, status');

    const kycMap: Record<string, string> = {};
    (kycRecords || []).forEach((k: any) => { kycMap[k.user_id] = k.status; });

    setUsers((profiles || []).map((p: any) => ({
      id: p.id,
      name: p.full_name || 'Unknown',
      email: p.email || '',
      phone: p.phone || '',
      role: p.role || 'guest',
      createdAt: p.created_at,
      status: p.status || 'active', // Assuming you might have a status column later, defaulting to active
      kycStatus: kycMap[p.id] || 'not_submitted',
    })));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleUpdateStatus = async (userId: string, newStatus: 'active' | 'suspended') => {
    const supabase = createClient();
    
    // Optimistic update
    const previousUsers = [...users];
    setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    setActiveMenuId(null);

    const { error } = await supabase.from('profiles').update({ status: newStatus }).eq('id', userId);
    if (error) {
      alert('Failed to update status. Please make sure the database has the status column and RLS policies.');
      setUsers(previousUsers);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: 'guest' | 'host' | 'admin') => {
    const supabase = createClient();
    
    // Optimistic update
    const previousUsers = [...users];
    setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    setActiveMenuId(null);

    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
    if (error) {
      alert('Failed to update role. Please ensure you have Admin RLS permissions.');
      setUsers(previousUsers);
    }
  };

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

        <div style={{ overflowX: 'auto', minHeight: 400 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)', background: '#f8fafc' }}>
                {['User Details', 'Contact', 'Role', 'KYC Status', 'Joined', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => {
                const kyc = KYC_BADGE[u.kycStatus] || KYC_BADGE.not_submitted;
                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '16px', minWidth: 200 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                          {u.name[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{u.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>ID: {u.id.substring(0, 8)}...</div>
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
                      {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ color: u.status === 'active' ? '#16a34a' : 'var(--accent)', fontWeight: 600, fontSize: 13, textTransform: 'capitalize' }}>
                        {u.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ position: 'relative' }}>
                        <button 
                          onClick={() => setActiveMenuId(activeMenuId === u.id ? null : u.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px 8px', borderRadius: 4 }}
                        >
                          <MoreVertical size={18} />
                        </button>

                        {/* Dropdown Menu */}
                        {activeMenuId === u.id && (
                          <>
                            <div 
                              style={{ position: 'fixed', inset: 0, zIndex: 90 }} 
                              onClick={() => setActiveMenuId(null)} 
                            />
                            <div 
                              style={{ 
                                position: 'absolute', right: 0, top: 30, background: 'white', border: '1px solid var(--border-light)', 
                                borderRadius: 12, boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 100, minWidth: 200, padding: 8
                              }}
                            >
                              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', padding: '8px 12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Account Actions
                              </div>
                              
                              {u.status === 'active' ? (
                                <button onClick={() => handleUpdateStatus(u.id, 'suspended')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--accent)', fontSize: 14, fontWeight: 500, borderRadius: 6, textAlign: 'left' }} onMouseOver={e => e.currentTarget.style.background = '#fff1f2'} onMouseOut={e => e.currentTarget.style.background = 'none'}>
                                  <UserX size={16} /> Suspend User
                                </button>
                              ) : (
                                <button onClick={() => handleUpdateStatus(u.id, 'active')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: 'none', background: 'none', cursor: 'pointer', color: '#16a34a', fontSize: 14, fontWeight: 500, borderRadius: 6, textAlign: 'left' }} onMouseOver={e => e.currentTarget.style.background = '#f0fdf4'} onMouseOut={e => e.currentTarget.style.background = 'none'}>
                                  <UserCheck size={16} /> Activate User
                                </button>
                              )}

                              <div style={{ height: 1, background: 'var(--border-light)', margin: '4px 0' }} />

                              {u.role !== 'admin' && (
                                <button onClick={() => handleUpdateRole(u.id, 'admin')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-dark)', fontSize: 14, fontWeight: 500, borderRadius: 6, textAlign: 'left' }} onMouseOver={e => e.currentTarget.style.background = '#f8fafc'} onMouseOut={e => e.currentTarget.style.background = 'none'}>
                                  <ShieldAlert size={16} /> Promote to Admin
                                </button>
                              )}

                              {u.role !== 'guest' && (
                                <button onClick={() => handleUpdateRole(u.id, 'guest')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-dark)', fontSize: 14, fontWeight: 500, borderRadius: 6, textAlign: 'left' }} onMouseOver={e => e.currentTarget.style.background = '#f8fafc'} onMouseOut={e => e.currentTarget.style.background = 'none'}>
                                  <Shield size={16} /> Demote to Guest
                                </button>
                              )}

                              <div style={{ height: 1, background: 'var(--border-light)', margin: '4px 0' }} />

                              <Link href={`/admin/kyc?search=${encodeURIComponent(u.email)}`} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--primary)', fontSize: 14, fontWeight: 500, borderRadius: 6, textAlign: 'left', textDecoration: 'none' }} onMouseOver={e => e.currentTarget.style.background = '#eff6ff'} onMouseOut={e => e.currentTarget.style.background = 'none'}>
                                <FileText size={16} /> Review KYC
                              </Link>

                              {u.role === 'host' && (
                                <Link href="/admin/vehicles" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--primary)', fontSize: 14, fontWeight: 500, borderRadius: 6, textAlign: 'left', textDecoration: 'none' }} onMouseOver={e => e.currentTarget.style.background = '#eff6ff'} onMouseOut={e => e.currentTarget.style.background = 'none'}>
                                  <Car size={16} /> View Vehicles
                                </Link>
                              )}
                            </div>
                          </>
                        )}
                      </div>
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

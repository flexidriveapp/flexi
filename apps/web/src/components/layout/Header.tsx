'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, Car, Bell, User, ChevronDown, LogOut, Settings, LayoutDashboard } from 'lucide-react';
import AuthModal from '@/components/auth/AuthModal';

const NAV_LINKS = [
  { label: 'How it works', href: '/how-it-works' },
  { label: 'Become a host', href: '/become-a-host' },
  { label: 'Help', href: '/help' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    
    // Check auth from localStorage for demo
    const stored = localStorage.getItem('flexi_user');
    if (stored) setUser(JSON.parse(stored));
    
    // Listen for global event to open auth popup
    const handleOpenAuth = () => setIsAuthOpen(true);
    window.addEventListener('open-auth-modal', handleOpenAuth);
    
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('open-auth-modal', handleOpenAuth);
    };
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('flexi_user');
    setUser(null);
    setUserMenuOpen(false);
    window.location.href = '/';
  };

  return (
    <header className={`flexi-header${scrolled ? ' scrolled' : ''}`}>
      <style>{`
        .flexi-header {
          position: sticky; top: 0; z-index: 100;
          background: #ffffff;
          border-bottom: 1px solid var(--border-light);
          height: 72px; transition: all 0.3s ease;
        }
        .flexi-header.scrolled {
          border-bottom-color: var(--border-light);
          box-shadow: var(--shadow-sm);
        }
        .header-inner {
          max-width: 1280px; margin: 0 auto; padding: 0 24px;
          height: 100%; display: flex; align-items: center; justify-content: space-between;
          gap: 24px;
        }
        .logo {
          display: flex; align-items: center; gap: 8px;
          font-size: 24px; font-weight: 900; color: #121212;
          text-decoration: none; flex-shrink: 0;
          letter-spacing: -0.03em;
        }
        .header-search {
          flex: 1; max-width: 400px;
          display: flex; align-items: center;
          background: var(--bg-secondary); border-radius: 999px;
          padding: 10px 18px; gap: 10px; cursor: pointer;
          border: 1.5px solid transparent; transition: all 0.2s;
          text-decoration: none; color: var(--text-secondary); font-size: 14px;
        }
        .header-search:hover { border-color: var(--primary); background: white; }
        .header-nav { display: flex; align-items: center; gap: 4px; }
        .header-nav a {
          padding: 8px 14px; border-radius: 999px;
          font-size: 14px; font-weight: 500; color: var(--text-dark);
          transition: all 0.2s; text-decoration: none;
        }
        .header-nav a:hover { background: var(--bg-secondary); }
        .header-actions { display: flex; align-items: center; gap: 8px; }
        .btn-host {
          padding: 9px 18px; border-radius: 999px;
          border: 1.5px solid var(--border-light);
          font-size: 14px; font-weight: 600; color: var(--text-dark);
          background: white; cursor: pointer; transition: all 0.2s;
          text-decoration: none; display: flex; align-items: center;
        }
        .btn-host:hover { border-color: var(--primary); color: var(--primary); }
        .user-menu-wrapper { position: relative; }
        .user-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 6px 6px 6px 12px; border-radius: 999px;
          border: 1.5px solid var(--border-light);
          background: white; cursor: pointer;
          font-size: 14px; font-weight: 500; color: var(--text-dark);
          transition: all 0.2s;
        }
        .user-btn:hover { box-shadow: var(--shadow-md); }
        .user-avatar {
          width: 32px; height: 32px; border-radius: 50%;
          background: var(--primary); color: white;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 700;
        }
        .dropdown {
          position: absolute; right: 0; top: calc(100% + 8px);
          background: white; border-radius: 16px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.14);
          border: 1px solid var(--border-light);
          min-width: 220px; z-index: 200;
          animation: scaleIn 0.2s ease;
          transform-origin: top right;
          overflow: hidden;
        }
        .dropdown-item {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 16px; font-size: 14px; color: var(--text-dark);
          cursor: pointer; transition: all 0.15s; border: none; background: none;
          width: 100%; text-align: left; text-decoration: none;
        }
        .dropdown-item:hover { background: var(--bg-secondary); }
        .dropdown-item.danger { color: var(--accent); }
        .dropdown-divider { height: 1px; background: var(--border-light); margin: 4px 0; }
        .mobile-toggle {
          display: none; border: none; background: none; cursor: pointer;
          padding: 8px; border-radius: 8px; color: var(--text-dark);
        }
        @media (max-width: 768px) {
          .header-search, .header-nav { display: none; }
          .mobile-toggle { display: flex; }
        }
        .mobile-menu {
          position: fixed; top: 72px; left: 0; right: 0; bottom: 0;
          background: white; z-index: 99; padding: 24px;
          display: flex; flex-direction: column; gap: 8px;
          animation: fadeIn 0.2s ease;
        }
        .mobile-nav-item {
          display: block; padding: 14px 16px; border-radius: 12px;
          font-size: 16px; font-weight: 500; color: var(--text-dark);
          text-decoration: none; transition: all 0.2s;
        }
        .mobile-nav-item:hover { background: var(--bg-secondary); }
      `}</style>

      <div className="header-inner">
        <Link href="/" className="logo">
          Flexi
        </Link>

        <Link href="/search" className="header-search">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          Find your perfect car
        </Link>

        <nav className="header-nav">
          {NAV_LINKS.map(l => <Link key={l.href} href={l.href}>{l.label}</Link>)}
        </nav>

        <div className="header-actions">
          {user ? (
            <div className="user-menu-wrapper">
              <button className="user-btn" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                <div className="user-avatar">{user.name[0].toUpperCase()}</div>
                <span style={{ maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name.split(' ')[0]}</span>
                <ChevronDown size={14} />
              </button>
              {userMenuOpen && (
                <div className="dropdown">
                  <Link href="/dashboard" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                    <LayoutDashboard size={16} /> My Dashboard
                  </Link>
                  <Link href="/dashboard/trips" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                    <Car size={16} /> My Trips
                  </Link>
                  {(user.role === 'host' || user.role === 'admin') && (
                    <Link href="/host" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                      <Car size={16} /> Host Dashboard
                    </Link>
                  )}
                  {user.role === 'admin' && (
                    <Link href="/admin" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                      <Settings size={16} /> Admin Panel
                    </Link>
                  )}
                  <div className="dropdown-divider" />
                  <Link href="/dashboard/profile" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                    <User size={16} /> Profile
                  </Link>
                  <button className="dropdown-item danger" onClick={handleSignOut}>
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/become-a-host" className="btn-host">List your car</Link>
              <button onClick={() => setIsAuthOpen(true)} className="btn btn-primary btn-sm">Sign In</button>
            </>
          )}
          <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="mobile-menu">
          {NAV_LINKS.map(l => <Link key={l.href} href={l.href} className="mobile-nav-item" onClick={() => setMobileOpen(false)}>{l.label}</Link>)}
          <div style={{ height: 1, background: 'var(--border-light)', margin: '8px 0' }} />
          {user ? (
            <>
              <Link href="/dashboard" className="mobile-nav-item" onClick={() => setMobileOpen(false)}>My Dashboard</Link>
              <button className="mobile-nav-item" style={{ color: 'var(--accent)', textAlign: 'left', border: 'none', background: 'none', fontSize: 16, fontFamily: 'inherit', cursor: 'pointer', padding: '14px 16px', borderRadius: 12 }} onClick={handleSignOut}>Sign Out</button>
            </>
          ) : (
            <>
              <button className="mobile-nav-item" style={{ width: '100%', textAlign: 'left', border: 'none', background: 'none', fontFamily: 'inherit', fontSize: 16, cursor: 'pointer', padding: '14px 16px', borderRadius: 12 }} onClick={() => { setMobileOpen(false); setIsAuthOpen(true); }}>Sign In</button>
              <button className="mobile-nav-item" style={{ width: '100%', textAlign: 'left', border: 'none', background: 'none', fontFamily: 'inherit', fontSize: 16, cursor: 'pointer', padding: '14px 16px', borderRadius: 12, fontWeight: 600, color: 'var(--primary)' }} onClick={() => { setMobileOpen(false); setIsAuthOpen(true); }}>Sign Up Free</button>
            </>
          )}
        </div>
      )}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </header>
  );
}

import Link from 'next/link';

const FOOTER_LINKS = {
  Turo: [
    { label: 'About', href: '/about' },
    { label: 'Careers', href: '/careers' },
    { label: 'Press', href: '/press' },
    { label: 'Policies', href: '/policies' },
  ],
  Hosting: [
    { label: 'List your car', href: '/become-a-host' },
    { label: 'Carculator', href: '/become-a-host#calculator' },
    { label: 'Insurance & protection', href: '/insurance' },
    { label: 'Host FAQs', href: '/help/host' },
  ],
  Explore: [
    { label: 'Book a car', href: '/search' },
    { label: 'Travelogues', href: '/blog' },
    { label: 'Trust & safety', href: '/trust' },
    { label: 'Get help', href: '/help' },
  ],
  'Vehicle Types': [
    { label: 'SUVs', href: '/search?type=suv' },
    { label: 'Hatchbacks', href: '/search?type=hatchback' },
    { label: 'Electrics', href: '/search?type=electric' },
    { label: 'Luxury Premium', href: '/search?type=luxury' },
    { label: 'Vans', href: '/search?type=van' },
  ],
  'Top Cities': [
    { label: 'Mumbai', href: '/search?location=Mumbai' },
    { label: 'Delhi', href: '/search?location=Delhi' },
    { label: 'Bangalore', href: '/search?location=Bangalore' },
    { label: 'Pune', href: '/search?location=Pune' },
    { label: 'Hyderabad', href: '/search?location=Hyderabad' },
  ],
};

export default function Footer() {
  return (
    <footer>
      <style>{`
        footer {
          background: #f4f4f4; color: var(--text-secondary);
          padding: 64px 0 0;
          border-top: 1px solid var(--border-light);
        }
        .footer-inner {
          max-width: 1280px; margin: 0 auto; padding: 0 24px;
        }
        .footer-top {
          display: grid; grid-template-columns: 1.2fr repeat(5, 1fr); gap: 32px;
          padding-bottom: 48px;
        }
        .footer-brand .logo {
          display: flex; align-items: center; gap: 8px;
          font-size: 24px; font-weight: 900; color: var(--text-dark); margin-bottom: 16px;
          text-decoration: none;
          letter-spacing: -0.03em;
        }
        .footer-brand p {
          font-size: 13px; line-height: 1.6; color: var(--text-secondary); max-width: 240px; margin-bottom: 20px;
        }
        .social-links { display: flex; gap: 10px; }
        .social-btn {
          width: 38px; height: 38px; border-radius: 50%; border: 1px solid var(--border-light);
          display: flex; align-items: center; justify-content: center;
          color: var(--text-secondary); transition: all 0.2s; text-decoration: none; font-size: 16px;
        }
        .social-btn:hover { background: #ffffff; color: var(--primary); border-color: var(--primary); }
        .footer-col h4 { color: var(--text-dark); font-size: 13px; font-weight: 700; margin-bottom: 16px; letter-spacing: 0.03em; text-transform: uppercase; }
        .footer-col ul { list-style: none; display: flex; flex-direction: column; gap: 10px; }
        .footer-col a {
          font-size: 13px; color: var(--text-secondary); text-decoration: none; transition: color 0.2s;
        }
        .footer-col a:hover { color: var(--primary); }
        .footer-divider { border: none; border-top: 1px solid var(--border-light); margin: 0; }
        .footer-bottom {
          padding: 24px 0;
          display: flex; align-items: center; justify-content: space-between; gap: 16px;
          font-size: 13px; color: var(--text-secondary);
        }
        .footer-badges { display: flex; gap: 12px; }
        .app-badge {
          display: flex; align-items: center; gap: 8px;
          padding: 8px 14px; border-radius: 10px;
          border: 1px solid var(--border-light); color: var(--text-dark); text-decoration: none;
          transition: all 0.2s; font-size: 13px; background: #ffffff;
        }
        .app-badge:hover { background: var(--bg-secondary); border-color: var(--primary); }
        @media (max-width: 1024px) { .footer-top { grid-template-columns: repeat(3, 1fr); gap: 40px; } }
        @media (max-width: 640px) {
          .footer-top { grid-template-columns: 1fr; gap: 32px; }
          .footer-bottom { flex-direction: column; text-align: center; }
        }
      `}</style>

      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <Link href="/" className="logo">
              Flexi
            </Link>
            <p>India's most trusted self-drive car rental marketplace. Find the perfect car near you.</p>
            <div className="social-links">
              <a href="#" className="social-btn">𝕏</a>
              <a href="#" className="social-btn">f</a>
              <a href="#" className="social-btn">in</a>
              <a href="#" className="social-btn">📸</a>
            </div>
          </div>
          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section} className="footer-col">
              <h4>{section}</h4>
              <ul>
                {links.map(l => <li key={l.href}><Link href={l.href}>{l.label}</Link></li>)}
              </ul>
            </div>
          ))}
        </div>

        <hr className="footer-divider" />

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Flexi Car Rentals Pvt. Ltd. All rights reserved.</span>
          <div className="footer-badges">
            <a href="#" className="app-badge">🍎 App Store</a>
            <a href="#" className="app-badge">🤖 Google Play</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

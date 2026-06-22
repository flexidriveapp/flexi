'use client';
import { useState } from 'react';
import Link from 'next/link';
import { 
  Search, Shield, Key, Compass, Smartphone, Calendar, 
  CheckCircle, ChevronDown, ChevronUp, Car, Zap, MapPin,
  Clock, X, Check, FileText, PhoneCall, Plane, Users, Info
} from 'lucide-react';

export default function HowItWorksPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqList = [
    {
      q: 'What do I need to book a car on Flexi?',
      a: 'To book a car on Flexi, you must be at least 21 years old, have a valid driver\'s license, and pass our quick identity verification check (KYC) in the app. International drivers are welcome as long as they provide a valid passport and international driving permit.'
    },
    {
      q: 'How does insurance work?',
      a: 'Every trip on Flexi includes third-party liability insurance. We also offer several excess protection plan options (Basic, Standard, and Premium) that limit your liability for vehicle damage, which you can choose during checkout.'
    },
    {
      q: 'Can I add an additional driver?',
      a: 'Yes! You can add additional drivers to your trip free of charge. The additional driver must create a Flexi account and pass verification before the trip starts. You can send them an invite link directly from your trip details page.'
    },
    {
      q: 'How do I pay for fuel or charging?',
      a: 'You should return the car with the same fuel or charge level as when you picked it up. If you return it with less, your host will send a reimbursement request for the missing fuel or charge, plus a small convenience fee.'
    },
    {
      q: 'How does delivery work?',
      a: 'Hosts can deliver vehicles directly to airport terminals, train stations, hotels, or custom addresses. Delivery fees are shown upfront in the booking cost, and you can coordinate delivery locations directly with your host via app messaging.'
    },
    {
      q: 'What is the cancellation policy?',
      a: 'Flexi offers free cancellation up to 24 hours before your trip start time. If you cancel within 24 hours of pickup, a partial booking fee will apply depending on your trip duration.'
    },
    {
      q: 'Can I change or extend my trip?',
      a: 'Yes, you can request trip changes or extensions directly through the Flexi app. Extensions are subject to host approval and vehicle availability. If approved, the additional cost will be charged to your card on file.'
    },
    {
      q: 'What happens if I have an accident?',
      a: 'If you are in an accident, first make sure everyone is safe and contact emergency services if needed. Then, contact Flexi 24/7 Support and Roadside Assistance immediately. Document the incident, take photos of any damage, and exchange info with other drivers.'
    }
  ];

  const categories = [
    { name: 'Suvs', img: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=400&h=280&q=80' },
    { name: 'Automatics', img: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=400&h=280&q=80' },
    { name: 'Tesla & Luxury', img: 'https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?auto=format&fit=crop&w=400&h=280&q=80' },
    { name: 'Electric', img: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=400&h=280&q=80' },
    { name: 'Vans', img: 'https://images.unsplash.com/photo-1518983807204-7a32870c5e31?auto=format&fit=crop&w=400&h=280&q=80' }
  ];

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto', padding: '48px 20px 80px' }}>
      <style>{`
        .section-wrapper {
          margin-bottom: 96px;
        }
        
        /* Hero section */
        .hero-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 64px;
          align-items: center;
          margin-top: 24px;
        }
        .hero-img-box {
          height: 380px;
          border-radius: 20px;
          overflow: hidden;
          background: #e2e8f0;
          box-shadow: var(--shadow-sm);
        }
        .hero-img-box img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .hero-text-box {
          text-align: left;
        }
        .main-title {
          font-size: 52px;
          font-weight: 900;
          color: #231f20;
          margin-bottom: 20px;
          letter-spacing: -0.04em;
          line-height: 1.1;
        }
        .main-subtitle {
          font-size: 18px;
          color: #5e5e5e;
          line-height: 1.6;
          margin-bottom: 32px;
        }
        .turo-black-btn {
          background: #231f20;
          color: white;
          border-radius: 999px;
          padding: 16px 36px;
          font-size: 15px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          display: inline-block;
          text-align: center;
        }
        .turo-black-btn:hover {
          background: #3a3a3a;
          transform: translateY(-1px);
        }
        
        /* Why choose section */
        .why-choose-box {
          background: #f6f5f9;
          border-radius: 24px;
          padding: 64px 48px;
          text-align: center;
        }
        .why-choose-title {
          font-size: 36px;
          font-weight: 900;
          color: #231f20;
          margin-bottom: 48px;
          letter-spacing: -0.02em;
        }
        .why-choose-list {
          display: flex;
          flex-direction: column;
          gap: 36px;
          max-width: 720px;
          margin: 0 auto 48px;
          text-align: left;
        }
        .why-choose-item {
          display: flex;
          gap: 20px;
          align-items: flex-start;
        }
        .why-icon-box {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: white;
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: var(--shadow-sm);
        }
        .why-icon-box.purple { color: #5433b0; background: #eedcff; }
        .why-icon-box.green { color: #16a34a; background: #dcfce7; }
        .why-icon-box.blue { color: #2563eb; background: #dbeafe; }
        .why-item-title {
          font-size: 16px;
          font-weight: 800;
          color: #231f20;
          margin-bottom: 6px;
        }
        .why-item-desc {
          font-size: 14px;
          color: #5e5e5e;
          line-height: 1.6;
        }
        
        /* How to book section */
        .book-steps-title {
          font-size: 32px;
          font-weight: 900;
          color: #231f20;
          text-align: center;
          margin-bottom: 48px;
          letter-spacing: -0.02em;
        }
        .book-steps-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 40px;
          margin-bottom: 48px;
        }
        .book-step-card {
          text-align: left;
        }
        .book-step-illustration {
          background: white;
          border-radius: 16px;
          height: 160px;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1.5px solid var(--border-light);
          overflow: hidden;
        }
        .book-step-illustration img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .book-step-title {
          font-size: 16px;
          font-weight: 800;
          color: #231f20;
          margin-bottom: 12px;
        }
        .book-step-desc {
          font-size: 14px;
          color: #5e5e5e;
          line-height: 1.6;
        }
        .checkout-link {
          color: var(--primary);
          font-size: 14px;
          font-weight: 700;
          text-decoration: underline;
          margin-top: 12px;
          display: inline-block;
        }
        

        /* Pickup drop-off section */
        .pickup-title {
          font-size: 32px;
          font-weight: 900;
          color: #231f20;
          text-align: center;
          margin-bottom: 48px;
          letter-spacing: -0.02em;
        }
        .pickup-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 64px;
          align-items: center;
          margin-bottom: 64px;
        }
        .pickup-img-box {
          height: 280px;
          border-radius: 20px;
          overflow: hidden;
        }
        .pickup-img-box img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .pickup-rules-title {
          font-size: 20px;
          font-weight: 800;
          color: #231f20;
          margin-bottom: 20px;
        }
        .pickup-rules-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .pickup-rule-item {
          display: flex;
          gap: 12px;
          font-size: 15px;
          line-height: 1.6;
          color: #5e5e5e;
        }
        .pickup-rule-bullet {
          color: var(--primary);
          font-weight: 800;
          font-size: 16px;
        }
        
        .options-title {
          font-size: 20px;
          font-weight: 800;
          color: #231f20;
          text-align: center;
          margin-bottom: 32px;
        }
        .pickup-options-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
        }
        .pickup-option-card {
          text-align: left;
        }
        .pickup-option-illustration {
          background: white;
          border-radius: 16px;
          height: 140px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1.5px solid var(--border-light);
          overflow: hidden;
        }
        .pickup-option-illustration img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .pickup-option-title {
          font-size: 16px;
          font-weight: 800;
          color: #231f20;
          margin-bottom: 8px;
        }
        .pickup-option-desc {
          font-size: 14px;
          color: #5e5e5e;
          line-height: 1.6;
        }
        
        /* Protection section */
        .protected-box {
          text-align: center;
          border-top: 1px solid #e2e8f0;
          padding-top: 64px;
        }
        .protected-illustration {
          width: 240px;
          height: 160px;
          margin: 0 auto 32px;
          background: white;
          border: 1.5px solid var(--border-light);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .protected-illustration img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .protected-title {
          font-size: 32px;
          font-weight: 900;
          color: #231f20;
          margin-bottom: 48px;
          letter-spacing: -0.02em;
        }
        .protected-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
          text-align: left;
        }
        .protected-card-title {
          font-size: 16px;
          font-weight: 800;
          color: #231f20;
          margin-bottom: 8px;
        }
        .protected-card-desc {
          font-size: 14px;
          color: #5e5e5e;
          line-height: 1.6;
        }
        
        /* Browse category section */
        .cat-title {
          font-size: 24px;
          font-weight: 900;
          color: #231f20;
          margin-bottom: 24px;
          letter-spacing: -0.01em;
        }
        .cat-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
        }
        .cat-card {
          border-radius: 16px;
          overflow: hidden;
          background: #e2e8f0;
          height: 140px;
          position: relative;
          box-shadow: var(--shadow-sm);
          cursor: pointer;
        }
        .cat-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        .cat-card:hover img {
          transform: scale(1.05);
        }
        .cat-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.25);
          display: flex;
          align-items: flex-end;
          padding: 16px;
        }
        .cat-name {
          color: white;
          font-size: 15px;
          font-weight: 700;
        }
        
        /* FAQ Section */
        .faq-section {
          max-width: 720px;
          margin: 0 auto;
          text-align: left;
        }
        .faq-title {
          font-size: 32px;
          font-weight: 900;
          color: #231f20;
          text-align: center;
          margin-bottom: 40px;
          letter-spacing: -0.02em;
        }
        .faq-list {
          border-top: 1.5px solid #e2e8f0;
        }
        .faq-item {
          border-bottom: 1.5px solid #e2e8f0;
          overflow: hidden;
        }
        .faq-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 0;
          cursor: pointer;
          font-size: 18px;
          font-weight: 700;
          color: #231f20;
          user-select: none;
          transition: color 0.15s ease;
        }
        .faq-header:hover {
          color: #5433b0;
        }
        .faq-question-text {
          flex: 1;
          padding-right: 16px;
        }
        .faq-chevron {
          color: #231f20;
          transition: transform 0.2s ease, color 0.15s ease;
          flex-shrink: 0;
        }
        .faq-header:hover .faq-chevron {
          color: #5433b0;
        }
        .faq-answer {
          font-size: 15px;
          line-height: 1.6;
          color: #5e5e5e;
          padding-bottom: 24px;
          font-weight: 400;
          animation: slideDown 0.2s ease-out;
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @media (max-width: 820px) {
          .hero-row { grid-template-columns: 1fr; gap: 40px; }
          .hero-img-box { height: 260px; }
          .why-choose-box { padding: 48px 24px; }
          .book-steps-grid { grid-template-columns: 1fr; gap: 32px; }
          .pickup-row { grid-template-columns: 1fr; gap: 32px; }
          .pickup-options-grid { grid-template-columns: 1fr; gap: 24px; }
          .protected-grid { grid-template-columns: 1fr; gap: 24px; }
          .cat-grid { grid-template-columns: repeat(2, 1fr); }
          .faq-header { font-size: 16px; padding: 20px 0; }
          .faq-answer { font-size: 14px; }
        }
      `}</style>

      {/* Hero Section */}
      <div className="section-wrapper hero-row">
        <div className="hero-img-box">
          <img src="/images/how_it_works_hero.png" alt="Person holding phone next to car" />
        </div>
        <div className="hero-text-box">
          <h1 className="main-title">How Flexi works</h1>
          <p className="main-subtitle">
            Skip the rental counter. Book the perfect car for your next adventure.
          </p>
          <Link href="/search" className="turo-black-btn">
            Find the perfect car
          </Link>
        </div>
      </div>

      {/* Why Choose Flexi Section */}
      <div className="section-wrapper why-choose-box">
        <h2 className="why-choose-title">Why choose Flexi?</h2>
        <div className="why-choose-list">
          <div className="why-choose-item">
            <div className="why-icon-box purple">
              <Plane size={20} />
            </div>
            <div>
              <h3 className="why-item-title">Enjoy a smart, custom-made experience</h3>
              <p className="why-item-desc">Choose from a variety of makes and models that fit your style, not a generic class of car.</p>
            </div>
          </div>
          <div className="why-choose-item">
            <div className="why-icon-box green">
              <Users size={20} />
            </div>
            <div>
              <h3 className="why-item-title">Flexi hosts are everyday entrepreneurs who share cars in their communities</h3>
              <p className="why-item-desc">Explore a huge collection of vehicles listed by locals in your neighborhood.</p>
            </div>
          </div>
          <div className="why-choose-item">
            <div className="why-icon-box blue">
              <Shield size={20} />
            </div>
            <div>
              <h3 className="why-item-title">Drive with peace of mind. Get the support you need</h3>
              <p className="why-item-desc">Every trip is covered by physical damage protection plans. 24/7 customer support.</p>
            </div>
          </div>
        </div>
        <Link href="/search" className="turo-black-btn">
          Find the perfect car
        </Link>
      </div>

      {/* How to Book Section */}
      <div className="section-wrapper">
        <h2 className="book-steps-title">How to book a car</h2>
        <div className="book-steps-grid">
          <div className="book-step-card">
            <div className="book-step-illustration">
              <img src="/images/how_it_works_step1.png" alt="Find the perfect car" />
            </div>
            <h3 className="book-step-title">1. Find the perfect car</h3>
            <p className="book-step-desc">
              Enter your location and dates to browse thousands of cars. Filter by category, price, type, or specific makes like Tesla, Porsche, and Jeep.
            </p>
          </div>
          <div className="book-step-card">
            <div className="book-step-illustration">
              <img src="/images/how_it_works_step2.png" alt="Select a pickup location" />
            </div>
            <h3 className="book-step-title">2. Select a pickup location</h3>
            <p className="book-step-desc">
              Choose to pick up the car or have it delivered. Many hosts offer airport delivery, hotel drop-offs, or convenient neighborhood pickups.
            </p>
            <Link href="/help" className="checkout-link">Learn more about checkout</Link>
          </div>
          <div className="book-step-card">
            <div className="book-step-illustration">
              <img src="/images/how_it_works_step3.png" alt="Rent & hit the road" />
            </div>
            <h3 className="book-step-title">3. Rent & hit the road</h3>
            <p className="book-step-desc">
              Meet your host or pick up the keys contact-free. Snap pre-trip photos in the app, verify your license, and unlock the vehicle to start exploring.
            </p>
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Link href="/search" className="turo-black-btn">
            Book a car
          </Link>
        </div>
      </div>

      {/* Pickup & Drop-off Workings Section */}
      <div className="section-wrapper">
        <h2 className="pickup-title">How pickup & drop-off work</h2>
        <div className="pickup-row">
          <div className="pickup-img-box">
            <img src="/images/how_it_works_handoff.png" alt="Handoff keys next to car" />
          </div>
          <div>
            <h3 className="pickup-rules-title">Every time you rent a car on Flexi, you'll:</h3>
            <div className="pickup-rules-list">
              <div className="pickup-rule-item">
                <span className="pickup-rule-bullet">·</span>
                <span>Coordinate pickup time and location with the host.</span>
              </div>
              <div className="pickup-rule-item">
                <span className="pickup-rule-bullet">·</span>
                <span>Verify your driver's license with the host.</span>
              </div>
              <div className="pickup-rule-item">
                <span className="pickup-rule-bullet">·</span>
                <span>Check the car's fuel/charge level and condition.</span>
              </div>
            </div>
          </div>
        </div>

        <h3 className="options-title">Multiple pickup & drop-off options</h3>
        <div className="pickup-options-grid">
          <div className="pickup-option-card">
            <div className="pickup-option-illustration">
              <img src="/images/pickup_airport.png" alt="Airport delivery" />
            </div>
            <h4 className="pickup-option-title">Airport</h4>
            <p className="pickup-option-desc">Have the host meet you at the terminal, or pick it up from parking.</p>
          </div>
          <div className="pickup-option-card">
            <div className="pickup-option-illustration">
              <img src="/images/pickup_address.png" alt="Host's address" />
            </div>
            <h4 className="pickup-option-title">Host's address</h4>
            <p className="pickup-option-desc">Pick it up from the host's street or driveway.</p>
          </div>
          <div className="pickup-option-card">
            <div className="pickup-option-illustration">
              <img src="/images/pickup_custom.png" alt="Custom location" />
            </div>
            <h4 className="pickup-option-title">Custom location</h4>
            <p className="pickup-option-desc">Have the host deliver it to your hotel, office, or accommodation.</p>
          </div>
        </div>
      </div>

      {/* You're Protected Section */}
      <div className="section-wrapper protected-box">
        <div className="protected-illustration">
          <img src="/images/how_it_works_protection.png" alt="You're protected shield" />
        </div>
        <h2 className="protected-title">You're protected</h2>
        <div className="protected-grid">
          <div>
            <h3 className="protected-card-title">Physical damage protection</h3>
            <p className="protected-card-desc">All trips include physical damage cover with options to limit your liability excess.</p>
          </div>
          <div>
            <h3 className="protected-card-title">Third-party liability insurance</h3>
            <p className="protected-card-desc">Enjoy liability cover under policies managed by our insurance partners.</p>
          </div>
          <div>
            <h3 className="protected-card-title">24/7 support & roadside assistance</h3>
            <p className="protected-card-desc">Drive with peace of mind knowing support is just a call or tap away.</p>
          </div>
        </div>
      </div>

      {/* Browse by Category Gallery */}
      <div className="section-wrapper">
        <h2 className="cat-title">Browse by category</h2>
        <div className="cat-grid">
          {categories.map((cat, i) => (
            <Link key={i} href="/search" className="cat-card">
              <img src={cat.img} alt={cat.name} loading="lazy" />
              <div className="cat-overlay">
                <span className="cat-name">{cat.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="section-wrapper faq-section" style={{ borderTop: 'none', paddingTop: 64 }}>
        <h2 className="faq-title">Frequently asked questions</h2>
        <div className="faq-list">
          {faqList.map((faq, i) => (
            <div key={i} className="faq-item">
              <div className="faq-header" onClick={() => toggleFaq(i)}>
                <span className="faq-question-text">{faq.q}</span>
                {openFaq === i ? (
                  <ChevronUp size={18} className="faq-chevron" />
                ) : (
                  <ChevronDown size={18} className="faq-chevron" />
                )}
              </div>
              {openFaq === i && (
                <div className="faq-answer">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

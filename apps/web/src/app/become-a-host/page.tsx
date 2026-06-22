'use client';
import { useState, useEffect } from 'react';
import { 
  Shield, Key, Award, ArrowRight, Check, HelpCircle, 
  ChevronDown, ChevronUp, Plus, Minus, DollarSign, Percent, 
  MapPin, Car, Briefcase, Calendar, Info
} from 'lucide-react';

export default function BecomeAHostPage() {
  // Calculator States
  const [region, setRegion] = useState('mumbai');
  const [carClass, setCarClass] = useState('suv_ev');
  const [days, setDays] = useState(15);
  
  // Fleet States
  const [fleetSize, setFleetSize] = useState<1 | 3 | 5 | 7 | 9>(1);

  // FAQ State
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Check login state to determine CTA behavior
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsLoggedIn(!!localStorage.getItem('flexi_user'));
    }
  }, []);

  const handleCTAClick = () => {
    if (isLoggedIn) {
      window.location.href = '/host';
    } else {
      window.dispatchEvent(new Event('open-auth-modal'));
    }
  };

  // Calculator Parameters (in INR)
  const rates: Record<string, number> = {
    economy: 1500,  // ₹1,500/day
    sedan: 2500,    // ₹2,500/day
    suv_ev: 4500,   // ₹4,500/day
    luxury: 9000    // ₹9,000/day
  };

  const regionalModifiers: Record<string, number> = {
    mumbai: 1.25,
    delhi: 1.20,
    bengaluru: 1.15,
    hyderabad: 1.10,
    chennai: 1.05,
    pune: 1.00
  };

  const calculateEarnings = () => {
    const rate = rates[carClass] || 2500;
    const modifier = regionalModifiers[region] || 1.0;
    const hostShare = 0.75; // 75% host take-home share
    const annualEarnings = Math.round(days * rate * modifier * 12 * hostShare);
    return annualEarnings.toLocaleString('en-IN');
  };

  const calculateMonthly = () => {
    const rate = rates[carClass] || 2500;
    const modifier = regionalModifiers[region] || 1.0;
    const hostShare = 0.75;
    const monthlyEarnings = Math.round(days * rate * modifier * hostShare);
    return monthlyEarnings.toLocaleString('en-IN');
  };

  const getFleetEarnings = () => {
    // Average annual earnings for an Indian fleet car is approx ₹3,00,000
    const perCarAverage = 300000;
    return (fleetSize * perCarAverage).toLocaleString('en-IN');
  };

  const faqList = [
    {
      q: "How does insurance and protection work?",
      a: "All Flexi trips in India are covered by comprehensive vehicle insurance protection and robust third-party liability coverage. Depending on the protection package you choose, you will receive coverage for physical damage to your car up to its fair market value, minus any specific deductibles. Damage claims are resolved swiftly in-app."
    },
    {
      q: "What are the vehicle requirements in India?",
      a: "To list your car in India, it must be registered in the country (with valid private or commercial plates), be 8 years old or newer, and have fewer than 1,20,000 km on the odometer. It must also have a valid Registration Certificate (RC), valid comprehensive insurance, an active Pollution Under Control (PUC) certificate, and be in clean, roadworthy condition."
    },
    {
      q: "How do payouts work and when do I get paid?",
      a: "Flexi processes payouts via direct bank transfer (IMPS/NEFT) to your linked account. You will receive your earnings within three business days of each completed trip. For long-term rentals, payouts are processed weekly."
    },
    {
      q: "How does pickup and delivery work?",
      a: "You have complete customization. You can offer key pickup at your home or garage, or offer delivery to local airport terminals (like Chhatrapati Shivaji Maharaj International Airport or Kempegowda International Airport), railway stations, hotels, or custom addresses for a fee you set. You control when and where your car is available."
    },
    {
      q: "Who pays for fuel, cleaning, and tolls?",
      a: "Guests are required to return the vehicle with the same fuel or charge level as when the trip started, and in clean condition. If they do not, you can request a fuel or charging reimbursement plus a small convenience fee. Guests are also responsible for all highway tolls (Fastag charges), parking fees, and traffic violations incurred during their trip."
    }
  ];

  return (
    <div className="become-host-container">
      <style>{`
        .become-host-container {
          font-family: 'Inter', -apple-system, sans-serif;
          color: #231f20;
          background: #ffffff;
          line-height: 1.5;
        }

        /* Hero Section styling */
        .host-hero {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 64px;
          align-items: center;
          padding: 80px 24px;
          max-width: 1120px;
          margin: 0 auto;
        }
        @media (max-width: 900px) {
          .host-hero {
            grid-template-columns: 1fr;
            gap: 40px;
            padding: 48px 20px;
            text-align: center;
          }
        }
        
        .hero-left {
          text-align: left;
        }
        @media (max-width: 900px) {
          .hero-left {
            text-align: center;
          }
        }

        .host-pill {
          display: inline-block;
          background: #f1f0f7;
          color: #5433b0;
          font-weight: 700;
          font-size: 13px;
          padding: 6px 14px;
          border-radius: 999px;
          margin-bottom: 16px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .hero-title {
          font-size: 56px;
          font-weight: 900;
          letter-spacing: -0.04em;
          line-height: 1.05;
          margin-bottom: 20px;
          color: #231f20;
        }
        @media (max-width: 600px) {
          .hero-title {
            font-size: 38px;
          }
        }

        .hero-desc {
          font-size: 18px;
          color: #5e5e5e;
          line-height: 1.6;
          margin-bottom: 32px;
          max-width: 520px;
        }
        @media (max-width: 900px) {
          .hero-desc {
            margin-left: auto;
            margin-right: auto;
          }
        }

        .btn-pill-black {
          background: #231f20;
          color: white;
          border: none;
          padding: 16px 36px;
          font-size: 15px;
          font-weight: 700;
          border-radius: 999px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .btn-pill-black:hover {
          background: #3c3c3c;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        /* Calculator Widget */
        .calc-widget {
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: 24px;
          padding: 32px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.04);
          text-align: left;
        }
        
        .calc-title {
          font-size: 22px;
          font-weight: 800;
          margin-bottom: 24px;
          letter-spacing: -0.02em;
        }

        .calc-row {
          margin-bottom: 20px;
        }
        .calc-label {
          font-size: 13px;
          font-weight: 700;
          color: #231f20;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
          display: block;
        }
        
        .calc-select {
          width: 100%;
          padding: 12px 16px;
          border-radius: 12px;
          border: 1.5px solid #e2e8f0;
          font-size: 15px;
          color: #231f20;
          font-weight: 500;
          background: #ffffff;
          outline: none;
          cursor: pointer;
          transition: all 0.2s;
        }
        .calc-select:focus {
          border-color: #5433b0;
        }

        .slider-wrapper {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .slider-header {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          font-weight: 600;
        }
        .slider-header span {
          color: #5e5e5e;
        }
        .slider-header .days-highlight {
          color: #5433b0;
          font-weight: 700;
        }
        .slider-input {
          width: 100%;
          accent-color: #5433b0;
          cursor: pointer;
          height: 6px;
          border-radius: 999px;
        }

        .calc-divider {
          height: 1px;
          background: #e2e8f0;
          margin: 24px 0;
        }

        .earnings-box {
          background: #f8fafc;
          border-radius: 16px;
          padding: 24px;
          text-align: center;
          margin-bottom: 20px;
        }
        .earnings-amount {
          font-size: 40px;
          font-weight: 900;
          color: #231f20;
          letter-spacing: -0.04em;
          line-height: 1;
          margin-bottom: 4px;
        }
        .earnings-amount span {
          font-size: 20px;
          font-weight: 700;
          color: #5e5e5e;
        }
        .earnings-subtext {
          font-size: 13.5px;
          color: #5e5e5e;
        }
        .earnings-subtext strong {
          color: #231f20;
        }

        .calc-cta {
          width: 100%;
          background: #5433b0;
          color: white;
          border: none;
          padding: 14px;
          border-radius: 999px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: all 0.2s;
        }
        .calc-cta:hover {
          background: #43229f;
          transform: translateY(-1px);
        }

        .calc-disclaimer {
          font-size: 11px;
          color: #8c8c8c;
          text-align: center;
          margin-top: 12px;
          line-height: 1.4;
        }

        /* Peace of Mind / Why host Section */
        .peace-section {
          background: #f8fafc;
          padding: 96px 24px;
          text-align: center;
        }
        .section-inner {
          max-width: 1120px;
          margin: 0 auto;
        }
        .section-heading {
          font-size: 36px;
          font-weight: 900;
          letter-spacing: -0.03em;
          margin-bottom: 12px;
          color: #231f20;
        }
        .section-subtitle {
          font-size: 16px;
          color: #5e5e5e;
          margin-bottom: 56px;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }
        
        .benefits-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
        }
        @media (max-width: 800px) {
          .benefits-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }
        }

        .benefit-card {
          background: #ffffff;
          padding: 40px 32px;
          border-radius: 20px;
          border: 1.5px solid #e2e8f0;
          text-align: left;
          transition: all 0.2s;
        }
        .benefit-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.03);
        }
        .benefit-icon-box {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #f0ecf9;
          color: #5433b0;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
        }
        .benefit-title {
          font-size: 18px;
          font-weight: 800;
          margin-bottom: 12px;
          color: #231f20;
        }
        .benefit-desc {
          font-size: 14px;
          color: #5e5e5e;
          line-height: 1.6;
        }

        /* Fleet Tab Section */
        .fleet-section {
          padding: 96px 24px;
          text-align: center;
          max-width: 1120px;
          margin: 0 auto;
        }
        .fleet-tabs {
          display: inline-flex;
          background: #f1f5f9;
          padding: 6px;
          border-radius: 999px;
          margin-bottom: 40px;
          gap: 4px;
        }
        .fleet-tab-btn {
          border: none;
          background: none;
          padding: 10px 24px;
          border-radius: 999px;
          font-size: 14px;
          font-weight: 700;
          color: #5e5e5e;
          cursor: pointer;
          transition: all 0.15s;
        }
        .fleet-tab-btn.active {
          background: #ffffff;
          color: #231f20;
          box-shadow: var(--shadow-sm);
        }

        .fleet-card {
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: 24px;
          padding: 48px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          align-items: center;
          text-align: left;
        }
        @media (max-width: 800px) {
          .fleet-card {
            grid-template-columns: 1fr;
            padding: 32px;
            gap: 32px;
          }
        }
        .fleet-left-text {
          max-width: 440px;
        }
        .fleet-h3 {
          font-size: 28px;
          font-weight: 800;
          margin-bottom: 16px;
          letter-spacing: -0.02em;
        }
        .fleet-p {
          color: #5e5e5e;
          font-size: 15px;
          line-height: 1.6;
          margin-bottom: 24px;
        }
        
        .fleet-results-box {
          background: #fbfbfe;
          border: 1.5 dashed #eedcff;
          border-radius: 16px;
          padding: 32px;
          text-align: center;
        }
        .fleet-results-label {
          font-size: 13px;
          font-weight: 700;
          color: #5e5e5e;
          text-transform: uppercase;
          margin-bottom: 8px;
          letter-spacing: 0.05em;
        }
        .fleet-results-val {
          font-size: 52px;
          font-weight: 900;
          color: #5433b0;
          letter-spacing: -0.04em;
          margin-bottom: 8px;
        }
        .fleet-results-val span {
          font-size: 24px;
          color: #231f20;
        }
        .fleet-results-desc {
          font-size: 13px;
          color: #8c8c8c;
        }

        /* How it works section */
        .how-hosting-works {
          background: #ffffff;
          padding: 96px 24px;
          text-align: center;
          border-top: 1px solid #e2e8f0;
        }
        .steps-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 40px;
          max-width: 1120px;
          margin: 0 auto;
          text-align: left;
        }
        @media (max-width: 800px) {
          .steps-grid {
            grid-template-columns: 1fr;
            gap: 48px;
          }
        }
        
        .step-card {
          position: relative;
        }
        .step-number {
          font-size: 48px;
          font-weight: 900;
          color: #eedcff;
          line-height: 1;
          margin-bottom: 16px;
          font-family: serif;
        }
        .step-h4 {
          font-size: 18px;
          font-weight: 800;
          margin-bottom: 12px;
          color: #231f20;
        }
        .step-p {
          font-size: 14px;
          color: #5e5e5e;
          line-height: 1.6;
        }

        /* India Vehicle Eligibility requirements */
        .eligibility-section {
          background: #f8fafc;
          padding: 96px 24px;
          text-align: center;
        }
        .eligibility-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          max-width: 1120px;
          margin: 0 auto;
          text-align: left;
        }
        @media (max-width: 900px) {
          .eligibility-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 500px) {
          .eligibility-grid {
            grid-template-columns: 1fr;
          }
        }
        
        .eligibility-card {
          background: #ffffff;
          padding: 24px;
          border-radius: 16px;
          border: 1.5px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .eligibility-check {
          color: #16a34a;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: #dcfce7;
          border-radius: 50%;
        }
        .eligibility-h5 {
          font-size: 15px;
          font-weight: 800;
          color: #231f20;
        }
        .eligibility-p {
          font-size: 13px;
          color: #5e5e5e;
          line-height: 1.5;
        }

        /* Testimonials Section */
        .testimonials-section {
          padding: 96px 24px;
          background: #ffffff;
          text-align: center;
        }
        .testimonials-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          max-width: 1120px;
          margin: 0 auto;
          text-align: left;
        }
        @media (max-width: 800px) {
          .testimonials-grid {
            grid-template-columns: 1fr;
          }
        }
        
        .testimonial-card {
          background: #fbfbfd;
          border: 1.5px solid #e2e8f0;
          border-radius: 24px;
          padding: 40px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        
        .testimonial-text {
          font-size: 18px;
          font-weight: 500;
          color: #231f20;
          line-height: 1.6;
          margin-bottom: 32px;
          font-style: italic;
        }
        
        .testimonial-author {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .author-avatar {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: #e2e8f0;
          overflow: hidden;
        }
        .author-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .author-name {
          font-size: 15px;
          font-weight: 800;
          color: #231f20;
        }
        .author-meta {
          font-size: 12px;
          color: #5e5e5e;
        }

        /* FAQ Accordion Styling */
        .faq-section {
          padding: 96px 24px;
          background: #f8fafc;
          text-align: center;
        }
        .faq-container {
          max-width: 760px;
          margin: 0 auto;
          text-align: left;
        }
        .faq-item {
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: 16px;
          margin-bottom: 12px;
          overflow: hidden;
          transition: all 0.2s;
        }
        .faq-header {
          width: 100%;
          padding: 24px;
          background: none;
          border: none;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 16px;
          font-weight: 800;
          color: #231f20;
          cursor: pointer;
          text-align: left;
        }
        .faq-header:hover {
          color: #5433b0;
        }
        .faq-answer {
          padding: 0 24px 24px;
          font-size: 14.5px;
          color: #5e5e5e;
          line-height: 1.6;
          border-top: 1px solid transparent;
        }
        .faq-item.open {
          border-color: #5433b0;
          box-shadow: 0 4px 12px rgba(84, 51, 176, 0.04);
        }
        .faq-item.open .faq-header {
          color: #5433b0;
        }

        /* Bottom Conversion CTA Banner */
        .bottom-cta-banner {
          padding: 80px 24px;
          background: #231f20;
          color: white;
          text-align: center;
        }
        .banner-inner {
          max-width: 600px;
          margin: 0 auto;
        }
        .banner-title {
          font-size: 40px;
          font-weight: 900;
          letter-spacing: -0.03em;
          margin-bottom: 16px;
        }
        .banner-desc {
          font-size: 16px;
          color: #b3b3b3;
          margin-bottom: 32px;
          line-height: 1.6;
        }
        .btn-pill-purple {
          background: #5433b0;
          color: white;
          border: none;
          padding: 16px 36px;
          font-size: 15px;
          font-weight: 700;
          border-radius: 999px;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .btn-pill-purple:hover {
          background: #43229f;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(84, 51, 176, 0.3);
        }
      `}</style>

      {/* Hero / Top Section */}
      <section className="host-hero">
        <div className="hero-left">
          <div className="host-pill">Become a Flexi Host</div>
          <h1 className="hero-title">Share your car, start earning</h1>
          <p className="hero-desc">
            Join India's fastest growing peer-to-peer car sharing community. Offset your vehicle maintenance costs or launch a full-scale fleet rental business on Flexi.
          </p>
          <button className="btn-pill-black" onClick={handleCTAClick}>
            List your car now <ArrowRight size={16} />
          </button>
        </div>

        {/* Dynamic Calculator Widget */}
        <div className="hero-right">
          <div className="calc-widget">
            <h2 className="calc-title">Let’s calculate your earnings</h2>
            
            <div className="calc-row">
              <label className="calc-label">Where is your car located?</label>
              <select 
                className="calc-select" 
                value={region}
                onChange={e => setRegion(e.target.value)}
              >
                <option value="mumbai">Mumbai (MMR Area)</option>
                <option value="delhi">Delhi NCR Region</option>
                <option value="bengaluru">Bengaluru (Silicon Valley)</option>
                <option value="hyderabad">Hyderabad Metro Area</option>
                <option value="chennai">Chennai & Tamil Nadu</option>
                <option value="pune">Pune Area</option>
              </select>
            </div>

            <div className="calc-row">
              <label className="calc-label">What kind of car do you have?</label>
              <select 
                className="calc-select" 
                value={carClass}
                onChange={e => setCarClass(e.target.value)}
              >
                <option value="economy">Economy / Hatchback (value up to ₹8 Lakhs)</option>
                <option value="sedan">Saloon / Mid-Size Sedan (value up to ₹15 Lakhs)</option>
                <option value="suv_ev">Premium SUV / EV (value up to ₹30 Lakhs)</option>
                <option value="luxury">Luxury / Performance (value up to ₹70 Lakhs)</option>
              </select>
            </div>

            <div className="calc-row slider-wrapper">
              <div className="slider-header">
                <span>Days shared per month</span>
                <span className="days-highlight">{days} days</span>
              </div>
              <input 
                type="range" 
                min={1} 
                max={30} 
                className="slider-input"
                value={days}
                onChange={e => setDays(Number(e.target.value))}
              />
            </div>

            <div className="calc-divider" />

            <div className="earnings-box">
              <div className="earnings-amount">
                ₹{calculateEarnings()} <span>/ year</span>
              </div>
              <div className="earnings-subtext">
                That’s about <strong>₹{calculateMonthly()}</strong> per month on average.
              </div>
            </div>

            <button className="calc-cta" onClick={handleCTAClick}>
              Start Listing
            </button>

            <p className="calc-disclaimer">
              *Estimates are based on historical Indian market values. Actual payouts will depend on your pricing settings, regional demand, seasonality, and vehicle specifications.
            </p>
          </div>
        </div>
      </section>

      {/* Peace of Mind Section */}
      <section className="peace-section">
        <div className="section-inner">
          <h2 className="section-heading">Drive with complete peace of mind</h2>
          <p className="section-subtitle">
            We cover the bases so you can focus on building your hosting business.
          </p>

          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon-box">
                <Shield size={24} />
              </div>
              <h3 className="benefit-title">You're protected</h3>
              <p className="benefit-desc">
                Every trip is covered by comprehensive vehicle insurance protection and robust third-party liability coverage, ensuring absolute security for physical damages.
              </p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon-box">
                <Key size={24} />
              </div>
              <h3 className="benefit-title">You're in control</h3>
              <p className="benefit-desc">
                Set your daily prices, cap mileage limits, adjust pickup parameters, and choose house guidelines. Customize availability settings completely around your routine.
              </p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon-box">
                <Award size={24} />
              </div>
              <h3 className="benefit-title">You're supported</h3>
              <p className="benefit-desc">
                We pre-screen and verify every guest's driving credentials. Enjoy peace of mind with 24/7 client support and roadside assistance coverage for guests.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Scaling Fleet Tab Section */}
      <section className="fleet-section">
        <h2 className="section-heading">Scale your fleet, grow your business</h2>
        <p className="section-subtitle">
          From a single side-hustle to a commercial rental operation. See how annual earnings projection grows.
        </p>

        <div className="fleet-tabs">
          {[1, 3, 5, 7, 9].map(num => (
            <button
              key={num}
              className={`fleet-tab-btn ${fleetSize === num ? 'active' : ''}`}
              onClick={() => setFleetSize(num as any)}
            >
              {num} {num === 1 ? 'Car' : 'Cars'}
            </button>
          ))}
        </div>

        <div className="fleet-card">
          <div className="fleet-left-text">
            <h3 className="fleet-h3">
              {fleetSize === 1 
                ? 'Launch your hosting side hustle' 
                : `Operate a professional ${fleetSize}-vehicle fleet`}
            </h3>
            <p className="fleet-p">
              {fleetSize === 1 
                ? 'List your personal vehicle or a secondary car to offset ownership costs like financing, insurance, road taxes, and fuel bills.' 
                : `Build a highly scalable vehicle rental business on Flexi. Scale with diverse options, manage multiple bookings in-app, and utilize custom co-host configurations.`}
            </p>
            <button className="btn-pill-black" onClick={handleCTAClick}>
              Get Started <ArrowRight size={16} />
            </button>
          </div>

          <div className="fleet-results-box">
            <div className="fleet-results-label">Estimated annual earnings</div>
            <div className="fleet-results-val">
              ₹{getFleetEarnings()}
            </div>
            <p className="fleet-results-desc">
              *Based on average annual host returns of ₹3,00,000 per car in the Indian market.
            </p>
          </div>
        </div>
      </section>

      {/* How it works timeline section */}
      <section className="how-hosting-works">
        <div className="section-inner">
          <h2 className="section-heading">How hosting on Flexi works</h2>
          <p className="section-subtitle">Listing your vehicle is simple, structured, and takes less than 10 minutes.</p>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">01</div>
              <h3 className="step-h4">List your car for free</h3>
              <p className="step-p">
                Share details like license plate number, registration certificate (RC) data, and upload at least 10 high-quality photos showing exterior angles and interior cleanliness.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">02</div>
              <h3 className="step-h4">Set your preferences</h3>
              <p className="step-p">
                Select availability dates on the interactive calendar, configure delivery fees, adjust buffer times, and establish pickup guidelines.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">03</div>
              <h3 className="step-h4">Welcome guests & earn</h3>
              <p className="step-p">
                Verify guest physical license at drop-off (or use smart lockers for contactless pickup). Review the condition, hand over keys, and receive deposits within 3 days.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* India Vehicle Eligibility Section */}
      <section className="eligibility-section">
        <div className="section-inner">
          <h2 className="section-heading">India Vehicle Eligibility</h2>
          <p className="section-subtitle">To keep our car-sharing community safe and premium, all listings must meet these parameters.</p>

          <div className="eligibility-grid">
            <div className="eligibility-card">
              <div className="eligibility-check"><Check size={16} /></div>
              <h4 className="eligibility-h5">Age limit</h4>
              <p className="eligibility-p">Your vehicle must be 8 years old or less to ensure modern safety, compliance, and emission standards.</p>
            </div>

            <div className="eligibility-card">
              <div className="eligibility-check"><Check size={16} /></div>
              <h4 className="eligibility-h5">Mileage capacity</h4>
              <p className="eligibility-p">Must have fewer than 1,20,000 kilometers on the odometer at the time of listing.</p>
            </div>

            <div className="eligibility-card">
              <div className="eligibility-check"><Check size={16} /></div>
              <h4 className="eligibility-h5">Market value</h4>
              <p className="eligibility-p">Must have a fair market value no greater than ₹70 Lakhs. Valid GPS tracker required for luxury segment.</p>
            </div>

            <div className="eligibility-card">
              <div className="eligibility-check"><Check size={16} /></div>
              <h4 className="eligibility-h5">Legal compliance</h4>
              <p className="eligibility-p">Must have a valid Registration Certificate (RC), active insurance, Pollution Under Control (PUC) certificate, and no police record.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Host Testimonials Section */}
      <section className="testimonials-section">
        <div className="section-inner">
          <h2 className="section-heading">Hear from our hosts</h2>
          <p className="section-subtitle">Read what successful car share hosts in India say about their experience.</p>

          <div className="testimonials-grid">
            <div className="testimonial-card">
              <p className="testimonial-text">
                "Listing my electric SUV on Flexi pays for my car EMI, insurance, and charging costs. It's a completely self-funding asset now, and managing customer pickups is extremely simple."
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">
                  <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&h=120&q=80" alt="Amit" />
                </div>
                <div>
                  <div className="author-name">Amit S.</div>
                  <div className="author-meta">Mumbai • Host since 2024 • 1 SUV</div>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <p className="testimonial-text">
                "I started with one sedan to offset my monthly EMI. Within 8 months, I scaled to a 3-car fleet. Flexi's host support and robust insurance protection gave me the confidence to expand."
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80" alt="Priya" />
                </div>
                <div>
                  <div className="author-name">Priya R.</div>
                  <div className="author-meta">Bengaluru • Host since 2025 • 3 Cars</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <div className="faq-container">
          <h2 className="section-heading" style={{ textAlign: 'center', marginBottom: '40px' }}>Frequently asked questions</h2>
          
          {faqList.map((faq, i) => (
            <div 
              key={i} 
              className={`faq-item ${openFaq === i ? 'open' : ''}`}
            >
              <button 
                className="faq-header"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span>{faq.q}</span>
                {openFaq === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              {openFaq === i && (
                <div className="faq-answer">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Conversion CTA Banner */}
      <section className="bottom-cta-banner">
        <div className="banner-inner">
          <h2 className="banner-title">Start your hosting business today</h2>
          <p className="banner-desc">
            Sign up and list your first vehicle in just 10 minutes. There are no sign-up fees or monthly subscriptions.
          </p>
          <button className="btn-pill-purple" onClick={handleCTAClick}>
            List your car <ArrowRight size={16} />
          </button>
        </div>
      </section>
    </div>
  );
}

import { Link } from 'react-router-dom'
import { Leaf, Heart, Users, ArrowRight, Star, Zap, Shield } from 'lucide-react'
import Navbar from '../components/Navbar'

const stats = [
  { value: '2,400+', label: 'Meals Shared' },
  { value: '380+', label: 'Active Donors' },
  { value: '1,100+', label: 'Families Helped' },
  { value: '12 Tons', label: 'Food Saved' },
]

const features = [
  { icon: <Leaf size={22} />, title: 'Post Surplus Food', desc: 'Donors list food they can\'t use — homemade meals, restaurant surplus, grocery items — in seconds.' },
  { icon: <Heart size={22} />, title: 'Claim & Connect', desc: 'Recipients browse nearby listings, claim what they need, and coordinate pickup directly.' },
  { icon: <Shield size={22} />, title: 'Safe & Verified', desc: 'Every listing is monitored. Admins keep the platform trustworthy and clean.' },
  { icon: <Zap size={22} />, title: 'Instant Alerts', desc: 'Email notifications the moment a request is made or approved. Never miss a connection.' },
]

const categories = ['Vegetables', 'Fruits', 'Grains', 'Cooked Meals', 'Dairy', 'Bakery', 'Beverages', 'Snacks']

export default function Landing() {
  return (
    <div className="page-wrapper">
      <Navbar />

      {/* Hero */}
      <section style={{ minHeight: '88vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Background decoration */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          background: 'radial-gradient(ellipse 80% 60% at 60% 40%, rgba(232,146,58,0.07) 0%, transparent 70%), radial-gradient(ellipse 50% 50% at 20% 80%, rgba(196,97,58,0.06) 0%, transparent 60%)',
        }} />
        <div style={{
          position: 'absolute', top: -80, right: -80, width: 480, height: 480, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(232,146,58,0.06) 0%, transparent 70%)',
          zIndex: 0,
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1, paddingTop: 80, paddingBottom: 80 }}>
          {/* ✅ Fixed: added hero-grid class so the media query works */}
          <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
            {/* Left */}
            <div className="fade-in">
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(232,146,58,0.1)', border: '1px solid rgba(232,146,58,0.2)', borderRadius: 20, padding: '6px 14px', marginBottom: 24 }}>
                <Star size={13} color="var(--amber)" fill="var(--amber)" />
                <span style={{ fontSize: 13, color: 'var(--amber)', fontWeight: 500 }}>Community-powered food sharing</span>
              </div>

              <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 3.6rem)', marginBottom: 20, lineHeight: 1.1 }}>
                Share Food,<br />
                <span style={{ color: 'var(--amber)' }}>Nourish Lives</span>
              </h1>

              <p style={{ fontSize: 16, color: 'var(--muted2)', lineHeight: 1.8, marginBottom: 36, maxWidth: 460 }}>
                Connect surplus food with people who need it most. A free platform where donors and recipients come together to reduce waste and fight hunger — one meal at a time.
              </p>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link to="/register" className="btn btn-primary" style={{ fontSize: 15, padding: '13px 28px' }}>
                  Get Started Free <ArrowRight size={16} />
                </Link>
                <Link to="/browse" className="btn btn-secondary" style={{ fontSize: 15, padding: '13px 28px' }}>
                  Browse Food
                </Link>
              </div>

              {/* Mini stats */}
              <div style={{ display: 'flex', gap: 32, marginTop: 48, paddingTop: 32, borderTop: '1px solid var(--border)' }}>
                {stats.slice(0, 3).map(s => (
                  <div key={s.label}>
                    <div style={{ fontSize: 22, fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--amber)' }}>{s.value}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — visual card stack */}
            <div style={{ position: 'relative', height: 440 }} className="fade-in">
              {/* Background card */}
              <div style={{
                position: 'absolute', top: 40, right: 0, width: '85%', height: 340,
                background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 16,
                transform: 'rotate(3deg)',
              }} />
              {/* Mid card */}
              <div style={{
                position: 'absolute', top: 20, right: 16, width: '85%', height: 340,
                background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16,
                transform: 'rotate(1deg)',
              }} />
              {/* Main card */}
              <div className="card" style={{ position: 'absolute', top: 0, right: 32, width: '85%', padding: 24 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, var(--amber), var(--terra))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    🍱
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 2 }}>Fresh Home Cooked Meals</div>
                    <div style={{ fontSize: 13, color: 'var(--muted)' }}>Posted 2 mins ago · Hyderabad</div>
                  </div>
                  <span className="badge badge-green" style={{ marginLeft: 'auto', flexShrink: 0 }}>Available</span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--muted2)', marginBottom: 16, lineHeight: 1.7 }}>
                  Rice, dal, sabzi and roti — freshly made today. Enough for 4-5 people. Pickup from Banjara Hills.
                </p>
                <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                  {['Cooked Meal', 'Serves 5', 'Expires Today'].map(t => (
                    <span key={t} style={{ fontSize: 11, background: 'var(--bg3)', color: 'var(--muted2)', padding: '4px 10px', borderRadius: 20, border: '1px solid var(--border)' }}>{t}</span>
                  ))}
                </div>
                <button className="btn btn-primary" style={{ width: '100%' }}>Claim This Food</button>
              </div>

              {/* Floating notification */}
              <div style={{
                position: 'absolute', bottom: 20, left: 0, zIndex: 10,
                background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10,
                padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10,
                boxShadow: 'var(--shadow)', animation: 'float 3s ease-in-out infinite',
              }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(90,154,106,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  ✅
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>Request Approved!</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>Riya's request confirmed</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
          @media (max-width: 768px) {
            .hero-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </section>

      {/* Stats bar */}
      <section style={{ background: 'var(--bg2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '32px 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, textAlign: 'center' }}>
            {stats.map(s => (
              <div key={s.label}>
                <div style={{ fontSize: 28, fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--amber)' }}>{s.value}</div>
                <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '96px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', marginBottom: 16 }}>How It Works</h2>
            <p style={{ color: 'var(--muted2)', maxWidth: 480, margin: '0 auto', fontSize: 16 }}>Simple, fast, and completely free for everyone involved</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }} className="stagger">
            {features.map((f) => (
              <div key={f.title} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(232,146,58,0.1)', border: '1px solid rgba(232,146,58,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--amber)' }}>
                  {f.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: 17, fontFamily: 'var(--font-display)', marginBottom: 8 }}>{f.title}</h3>
                  <p style={{ fontSize: 14, color: 'var(--muted2)', lineHeight: 1.7 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section style={{ padding: '64px 0', background: 'var(--bg2)', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)', marginBottom: 40 }}>What's Being Shared</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
            {categories.map((c, i) => (
              <Link to={`/browse?category=${c}`} key={c} style={{
                padding: '10px 20px', borderRadius: 24,
                background: i % 3 === 0 ? 'rgba(232,146,58,0.1)' : i % 3 === 1 ? 'rgba(196,97,58,0.1)' : 'var(--bg3)',
                border: `1px solid ${i % 3 === 0 ? 'rgba(232,146,58,0.25)' : i % 3 === 1 ? 'rgba(196,97,58,0.25)' : 'var(--border)'}`,
                color: i % 3 === 0 ? 'var(--amber)' : i % 3 === 1 ? 'var(--terra2)' : 'var(--muted2)',
                fontSize: 14, fontWeight: 500, transition: 'all 0.2s',
              }}>{c}</Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '96px 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{ maxWidth: 560, margin: '0 auto' }}>
            <div style={{ fontSize: 40, marginBottom: 20 }}>🤝</div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', marginBottom: 16 }}>Ready to Make a Difference?</h2>
            <p style={{ color: 'var(--muted2)', marginBottom: 36, fontSize: 16, lineHeight: 1.8 }}>
              Whether you have food to give or need a meal today — you belong here. Join thousands of neighbours sharing kindness.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register?role=donor" className="btn btn-primary" style={{ padding: '13px 28px', fontSize: 15 }}>
                I Want to Donate <ArrowRight size={16} />
              </Link>
              <Link to="/register?role=recipient" className="btn btn-secondary" style={{ padding: '13px 28px', fontSize: 15 }}>
                I Need Food
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: 'var(--bg2)', borderTop: '1px solid var(--border)', padding: '32px 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-display)', fontWeight: 700 }}>
            <Leaf size={16} color="var(--amber)" /> FoodShare
          </div>
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>Built with ♥ to fight hunger. Free forever.</div>
          <div style={{ display: 'flex', gap: 16 }}>
            <Link to="/browse" style={{ fontSize: 13, color: 'var(--muted)' }}>Browse</Link>
            <Link to="/register" style={{ fontSize: 13, color: 'var(--muted)' }}>Join</Link>
            <Link to="/login" style={{ fontSize: 13, color: 'var(--muted)' }}>Login</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Menu, X, Leaf, Bell, LogOut, User } from 'lucide-react'

export default function Navbar() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const dashboardLink = () => {
    if (!profile) return '/login'
    if (profile.role === 'donor') return '/donor'
    if (profile.role === 'recipient') return '/recipient'
    if (profile.role === 'admin') return '/admin'
    return '/'
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(26,20,16,0.92)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
      padding: '0 24px',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--cream)', fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, var(--amber), var(--terra))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Leaf size={18} color="#1a1410" />
          </div>
          FoodShare
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} className="desktop-nav">
          {!user ? (
            <>
              <Link to="/browse" className="btn btn-secondary btn-sm" style={isActive('/browse') ? { borderColor: 'var(--amber)', color: 'var(--amber)' } : {}}>Browse Food</Link>
              <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Join Free</Link>
            </>
          ) : (
            <>
              <Link to="/browse" className="btn btn-secondary btn-sm" style={isActive('/browse') ? { borderColor: 'var(--amber)', color: 'var(--amber)' } : {}}>Browse</Link>
              <Link to={dashboardLink()} className="btn btn-secondary btn-sm" style={isActive(dashboardLink()) ? { borderColor: 'var(--amber)', color: 'var(--amber)' } : {}}>Dashboard</Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 8, paddingLeft: 12, borderLeft: '1px solid var(--border)' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{profile?.name || 'User'}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'capitalize' }}>{profile?.role}</div>
                </div>
                <button onClick={handleSignOut} className="btn btn-secondary btn-sm" style={{ padding: '6px 10px' }}>
                  <LogOut size={14} />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setOpen(!open)} style={{ background: 'none', border: 'none', color: 'var(--cream)', display: 'none' }} className="mobile-menu-btn">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '16px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Link to="/browse" className="btn btn-secondary" onClick={() => setOpen(false)}>Browse Food</Link>
          {!user ? (
            <>
              <Link to="/login" className="btn btn-secondary" onClick={() => setOpen(false)}>Login</Link>
              <Link to="/register" className="btn btn-primary" onClick={() => setOpen(false)}>Join Free</Link>
            </>
          ) : (
            <>
              <Link to={dashboardLink()} className="btn btn-secondary" onClick={() => setOpen(false)}>Dashboard</Link>
              <button onClick={() => { handleSignOut(); setOpen(false) }} className="btn btn-secondary">Sign Out</button>
            </>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </nav>
  )
}
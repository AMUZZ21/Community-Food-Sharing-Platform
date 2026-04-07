import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Leaf, Eye, EyeOff, UserPlus, Heart, Utensils } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Register() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const initialRole = params.get('role') || 'recipient'

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '', role: initialRole })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true)
    try {
      await signUp(form.email, form.password, form.name, form.phone, form.role)
      localStorage.setItem('fs_role', form.role)
      toast.success('Account created! Check your email to verify.')
      navigate('/login')
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const roles = [
    { value: 'donor', icon: <Utensils size={18} />, label: 'Donor', desc: 'I want to share food' },
    { value: 'recipient', icon: <Heart size={18} />, label: 'Recipient', desc: 'I need food' },
  ]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 24 }}>
      <div style={{ position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, background: 'radial-gradient(ellipse, rgba(196,97,58,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div className="fade-in" style={{ width: '100%', maxWidth: 460 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--cream)', fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, justifyContent: 'center', marginBottom: 36 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, var(--amber), var(--terra))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Leaf size={18} color="#1a1410" />
          </div>
          FoodShare
        </Link>

        <div className="card" style={{ padding: 36 }}>
          <h2 style={{ fontSize: 24, textAlign: 'center', marginBottom: 6 }}>Create your account</h2>
          <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 14, marginBottom: 28 }}>Free forever. No credit card needed.</p>

          {error && (
            <div style={{ background: 'rgba(196,74,74,0.1)', border: '1px solid rgba(196,74,74,0.25)', borderRadius: 8, padding: '10px 14px', color: '#e07a7a', fontSize: 13, marginBottom: 20 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Role selector */}
            <div className="form-group">
              <label>I am joining as</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {roles.map(r => (
                  <button key={r.value} type="button" onClick={() => setForm({ ...form, role: r.value })}
                    style={{
                      padding: '12px 16px', borderRadius: 10, cursor: 'pointer',
                      background: form.role === r.value ? 'rgba(232,146,58,0.1)' : 'var(--bg3)',
                      border: `1.5px solid ${form.role === r.value ? 'var(--amber)' : 'var(--border)'}`,
                      color: form.role === r.value ? 'var(--amber)' : 'var(--muted2)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                      transition: 'all 0.2s',
                    }}>
                    {r.icon}
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{r.label}</span>
                    <span style={{ fontSize: 12, opacity: 0.8 }}>{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Full name</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Amrutha Venkata" required />
            </div>

            <div className="form-group">
              <label>Email address</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
            </div>

            <div className="form-group">
              <label>Phone number <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optional)</span></label>
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" />
            </div>

            <div className="form-group">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPass ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} placeholder="Min. 6 characters" required style={{ paddingRight: 42 }} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Confirm password</label>
              <input type="password" name="confirm" value={form.confirm} onChange={handleChange} placeholder="Re-enter password" required />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: 4 }}>
              {loading ? 'Creating account...' : <><UserPlus size={16} /> Create Account</>}
            </button>
          </form>

          <div className="divider" />
          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--amber)', fontWeight: 500 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

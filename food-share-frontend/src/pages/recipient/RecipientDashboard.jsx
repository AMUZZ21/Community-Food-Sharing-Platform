import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import Navbar from '../../components/Navbar'
import { Link } from 'react-router-dom'
import { Package, Clock, CheckCircle, XCircle, Search, Bell } from 'lucide-react'

export default function RecipientDashboard() {
  const { profile } = useAuth()
  const [requests, setRequests] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('requests')
  const [filter, setFilter] = useState('all')

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    const { data: reqs } = await supabase
      .from('requests')
      .select('*, food_listings(title, location, category, donor_id, users:donor_id(name, phone))')
      .eq('recipient_id', profile?.id)
      .order('created_at', { ascending: false })

    const { data: notifs } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', profile?.id)
      .order('created_at', { ascending: false })
      .limit(20)

    setRequests(reqs || [])
    setNotifications(notifs || [])
    setLoading(false)

    // Mark notifications read
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', profile?.id).eq('is_read', false)
  }

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter)
  const unreadCount = notifications.filter(n => !n.is_read).length

  const statusIcon = (status) => {
    if (status === 'approved') return <CheckCircle size={16} color="var(--success)" />
    if (status === 'rejected') return <XCircle size={16} color="#e07a7a" />
    return <Clock size={16} color="var(--amber)" />
  }

  const statusBadge = (status) => {
    const map = { pending: 'badge-amber', approved: 'badge-green', rejected: 'badge-red', completed: 'badge-blue' }
    return <span className={`badge ${map[status] || 'badge-gray'}`} style={{ textTransform: 'capitalize' }}>{status}</span>
  }

  const stats = [
    { label: 'Total Requests', value: requests.length, color: 'var(--amber)' },
    { label: 'Approved', value: requests.filter(r => r.status === 'approved').length, color: 'var(--success)' },
    { label: 'Pending', value: requests.filter(r => r.status === 'pending').length, color: 'var(--terra2)' },
  ]

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="container" style={{ padding: '40px 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 26, fontFamily: 'var(--font-display)', marginBottom: 6 }}>My Dashboard</h1>
            <p style={{ color: 'var(--muted)', fontSize: 14 }}>Welcome back, {profile?.name} 👋</p>
          </div>
          <Link to="/browse" className="btn btn-primary">
            <Search size={16} /> Browse Food
          </Link>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16, marginBottom: 32 }}>
          {stats.map(s => (
            <div key={s.label} className="card" style={{ padding: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontFamily: 'var(--font-display)', fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, background: 'var(--bg2)', padding: 4, borderRadius: 10, marginBottom: 24, width: 'fit-content', border: '1px solid var(--border)' }}>
          {[{ id: 'requests', label: 'My Requests', icon: <Package size={15} /> }, { id: 'notifications', label: 'Notifications', icon: <Bell size={15} />, badge: unreadCount }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', background: tab === t.id ? 'var(--card)' : 'transparent', color: tab === t.id ? 'var(--amber)' : 'var(--muted)', fontSize: 14, fontWeight: tab === t.id ? 500 : 400, transition: 'all 0.2s' }}>
              {t.icon} {t.label}
              {t.badge > 0 && <span style={{ background: 'var(--terra)', color: 'white', borderRadius: 10, fontSize: 11, padding: '1px 7px' }}>{t.badge}</span>}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--muted)' }}>
            <div style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--amber)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            Loading...
          </div>
        ) : tab === 'requests' ? (
          <div className="fade-in">
            {/* Filter */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              {['all', 'pending', 'approved', 'rejected'].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ textTransform: 'capitalize' }}>{f}</button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: 60 }}>
                <Package size={40} color="var(--muted)" style={{ margin: '0 auto 16px' }} />
                <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 8 }}>No requests yet</h3>
                <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 20 }}>Browse available food and send your first request</p>
                <Link to="/browse" className="btn btn-primary" style={{ display: 'inline-flex' }}>Browse Food</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }} className="stagger">
                {filtered.map(r => (
                  <div key={r.id} className="card" style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        {statusIcon(r.status)}
                        <h3 style={{ fontSize: 15, fontFamily: 'var(--font-display)' }}>{r.food_listings?.title}</h3>
                        {statusBadge(r.status)}
                      </div>
                      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13, color: 'var(--muted)' }}>
                        <span>📍 {r.food_listings?.location}</span>
                        <span>🍽️ {r.quantity_requested} serving(s)</span>
                        <span>👤 Donor: {r.food_listings?.users?.name}</span>
                      </div>
                      {r.status === 'approved' && r.food_listings?.users?.phone && (
                        <div style={{ marginTop: 10, padding: '8px 12px', background: 'rgba(90,154,106,0.1)', border: '1px solid rgba(90,154,106,0.2)', borderRadius: 8, fontSize: 13, color: '#7ec98a' }}>
                          ✅ Approved! Contact donor: 📞 {r.food_listings.users.phone}
                        </div>
                      )}
                      {r.message && <div style={{ marginTop: 8, fontSize: 13, color: 'var(--muted2)', fontStyle: 'italic' }}>Your note: "{r.message}"</div>}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                      {new Date(r.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="fade-in">
            {notifications.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: 60 }}>
                <Bell size={40} color="var(--muted)" style={{ margin: '0 auto 16px' }} />
                <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 8 }}>No notifications yet</h3>
                <p style={{ color: 'var(--muted)', fontSize: 14 }}>You'll be notified when your requests are updated</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }} className="stagger">
                {notifications.map(n => (
                  <div key={n.id} className="card" style={{ padding: '16px 20px', display: 'flex', gap: 14, alignItems: 'flex-start', borderLeft: `3px solid ${n.type === 'request_approved' ? 'var(--success)' : n.type === 'request_rejected' ? 'var(--danger)' : 'var(--amber)'}` }}>
                    <div style={{ fontSize: 20 }}>{n.type === 'request_approved' ? '✅' : n.type === 'request_rejected' ? '❌' : '🔔'}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 3 }}>{n.title}</div>
                      <div style={{ fontSize: 13, color: 'var(--muted2)' }}>{n.message}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>{new Date(n.created_at).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
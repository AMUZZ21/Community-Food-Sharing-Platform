import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import Navbar from '../../components/Navbar'
import { Users, Package, Inbox, BarChart2, Trash2, CheckCircle, XCircle, Shield } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminDashboard() {
  const [tab, setTab] = useState('overview')
  const [stats, setStats] = useState({ users: 0, listings: 0, requests: 0, donors: 0, recipients: 0 })
  const [users, setUsers] = useState([])
  const [listings, setListings] = useState([])
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchAll() }, [tab])

  const fetchAll = async () => {
    setLoading(true)
    const [{ data: u }, { data: l }, { data: r }] = await Promise.all([
      supabase.from('users').select('*').order('created_at', { ascending: false }),
      supabase.from('food_listings').select('*, users:donor_id(name)').order('created_at', { ascending: false }),
      supabase.from('requests').select('*, food_listings(title), users:recipient_id(name)').order('created_at', { ascending: false }),
    ])
    setUsers(u || [])
    setListings(l || [])
    setRequests(r || [])
    setStats({
      users: u?.length || 0,
      listings: l?.length || 0,
      requests: r?.length || 0,
      donors: u?.filter(x => x.role === 'donor').length || 0,
      recipients: u?.filter(x => x.role === 'recipient').length || 0,
    })
    setLoading(false)
  }

  const deleteUser = async (id) => {
    if (!confirm('Delete this user? This cannot be undone.')) return
    await supabase.from('users').delete().eq('id', id)
    toast.success('User deleted')
    fetchAll()
  }

  const deleteListing = async (id) => {
    if (!confirm('Delete this listing?')) return
    await supabase.from('food_listings').delete().eq('id', id)
    toast.success('Listing deleted')
    fetchAll()
  }

  const toggleUserActive = async (id, current) => {
    await supabase.from('users').update({ is_active: !current }).eq('id', id)
    toast.success(current ? 'User deactivated' : 'User activated')
    fetchAll()
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart2 size={15} /> },
    { id: 'users', label: 'Users', icon: <Users size={15} /> },
    { id: 'listings', label: 'Listings', icon: <Package size={15} /> },
    { id: 'requests', label: 'Requests', icon: <Inbox size={15} /> },
  ]

  const statCards = [
    { label: 'Total Users', value: stats.users, color: 'var(--amber)', sub: `${stats.donors} donors · ${stats.recipients} recipients` },
    { label: 'Food Listings', value: stats.listings, color: '#7ec98a', sub: 'Total posted' },
    { label: 'Requests', value: stats.requests, color: '#7aaee0', sub: 'Total requests' },
  ]

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="container" style={{ padding: '40px 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(196,97,58,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={20} color="var(--terra2)" />
          </div>
          <div>
            <h1 style={{ fontSize: 26, fontFamily: 'var(--font-display)' }}>Admin Dashboard</h1>
            <p style={{ color: 'var(--muted)', fontSize: 13 }}>Platform management & monitoring</p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, background: 'var(--bg2)', padding: 4, borderRadius: 10, marginBottom: 28, width: 'fit-content', border: '1px solid var(--border)', flexWrap: 'wrap' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', background: tab === t.id ? 'var(--card)' : 'transparent', color: tab === t.id ? 'var(--amber)' : 'var(--muted)', fontSize: 14, fontWeight: tab === t.id ? 500 : 400, transition: 'all 0.2s' }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--muted)' }}>
            <div style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--amber)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            Loading...
          </div>
        ) : (
          <div className="fade-in">

            {/* Overview */}
            {tab === 'overview' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 32 }}>
                  {statCards.map(s => (
                    <div key={s.label} className="card" style={{ padding: 24 }}>
                      <div style={{ fontSize: 36, fontFamily: 'var(--font-display)', fontWeight: 700, color: s.color, marginBottom: 4 }}>{s.value}</div>
                      <div style={{ fontWeight: 500, marginBottom: 4 }}>{s.label}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{s.sub}</div>
                    </div>
                  ))}
                </div>

                {/* Recent activity */}
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 16 }}>Recent Listings</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {listings.slice(0, 5).map(l => (
                    <div key={l.id} className="card" style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: 14 }}>{l.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--muted)' }}>by {l.users?.name} · {l.category} · {l.location}</div>
                      </div>
                      <span className={`badge ${l.status === 'available' ? 'badge-green' : l.status === 'claimed' ? 'badge-blue' : 'badge-gray'}`} style={{ textTransform: 'capitalize' }}>{l.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Users */}
            {tab === 'users' && (
              <div>
                <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 16 }}>{users.length} registered users</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {users.map(u => (
                    <div key={u.id} className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: u.role === 'donor' ? 'rgba(232,146,58,0.15)' : u.role === 'admin' ? 'rgba(196,97,58,0.15)' : 'rgba(74,122,181,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                          {u.role === 'donor' ? '🌿' : u.role === 'admin' ? '🛡️' : '🙏'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: 14 }}>{u.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{u.email} · <span style={{ textTransform: 'capitalize' }}>{u.role}</span></div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span className={`badge ${u.is_active ? 'badge-green' : 'badge-gray'}`}>{u.is_active ? 'Active' : 'Inactive'}</span>
                        {u.role !== 'admin' && (
                          <>
                            <button onClick={() => toggleUserActive(u.id, u.is_active)} className="btn btn-secondary btn-sm">
                              {u.is_active ? <XCircle size={13} /> : <CheckCircle size={13} />}
                              {u.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                            <button onClick={() => deleteUser(u.id)} className="btn btn-danger btn-sm" style={{ padding: '6px 10px' }}>
                              <Trash2 size={13} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Listings */}
            {tab === 'listings' && (
              <div>
                <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 16 }}>{listings.length} total listings</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {listings.map(l => (
                    <div key={l.id} className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: 14 }}>{l.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                          {l.category} · {l.location} · by {l.users?.name} · {l.quantity_remaining}/{l.quantity} left
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span className={`badge ${l.status === 'available' ? 'badge-green' : l.status === 'claimed' ? 'badge-blue' : 'badge-gray'}`} style={{ textTransform: 'capitalize' }}>{l.status}</span>
                        <button onClick={() => deleteListing(l.id)} className="btn btn-danger btn-sm" style={{ padding: '6px 10px' }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Requests */}
            {tab === 'requests' && (
              <div>
                <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 16 }}>{requests.length} total requests</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {requests.map(r => (
                    <div key={r.id} className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: 14 }}>{r.food_listings?.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                          Requested by {r.users?.name} · {r.quantity_requested} serving(s) · {new Date(r.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <span className={`badge ${r.status === 'pending' ? 'badge-amber' : r.status === 'approved' ? 'badge-green' : 'badge-red'}`} style={{ textTransform: 'capitalize' }}>{r.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  )
}
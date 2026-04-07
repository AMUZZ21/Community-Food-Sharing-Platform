import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/Navbar'
import PostFoodModal from './PostFoodModal'
import RequestsPanel from './RequestsPanel'
import { Plus, Package, Clock, CheckCircle, TrendingUp, Trash2, Leaf } from 'lucide-react'
import toast from 'react-hot-toast'

export default function DonorDashboard() {
  const { profile } = useAuth()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [activeTab, setActiveTab] = useState('listings')
  const [requestCount, setRequestCount] = useState(0)

  useEffect(() => { fetchListings() }, [profile])

  const fetchListings = async () => {
    if (!profile) return
    setLoading(true)

    const { data } = await supabase
      .from('food_listings')
      .select('*')
      .eq('donor_id', profile.id)
      .order('created_at', { ascending: false })

    setListings(data || [])

    if (data && data.length > 0) {
      const { count } = await supabase
        .from('requests')
        .select('id', { count: 'exact' })
        .in('listing_id', data.map(l => l.id))
        .eq('status', 'pending')
      setRequestCount(count || 0)
    } else {
      setRequestCount(0)
    }

    setLoading(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this listing?')) return
    const { error } = await supabase.from('food_listings').delete().eq('id', id)
    if (error) { toast.error('Failed to delete'); return }
    toast.success('Listing deleted')
    fetchListings()
  }

  const handleStatusToggle = async (listing) => {
    const newStatus = listing.status === 'available' ? 'expired' : 'available'
    await supabase.from('food_listings').update({ status: newStatus }).eq('id', listing.id)
    toast.success(`Marked as ${newStatus}`)
    fetchListings()
  }

  const categoryEmoji = (cat) => {
    const map = { Vegetables: '🥦', Fruits: '🍎', Grains: '🌾', 'Cooked Meals': '🍱', Dairy: '🥛', Bakery: '🍞', Beverages: '🥤', Snacks: '🍿' }
    return map[cat] || '🍽️'
  }

  const stats = [
    { label: 'Total Posted', value: listings.length, icon: '📦', color: 'var(--amber)' },
    { label: 'Available', value: listings.filter(l => l.status === 'available').length, icon: '✅', color: '#5a9a6a' },
    { label: 'Pending Requests', value: requestCount, icon: '📬', color: '#7aaee0' },
    { label: 'Claimed', value: listings.filter(l => l.status === 'claimed').length, icon: '🤝', color: 'var(--muted2)' },
  ]

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, var(--amber), var(--terra))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Leaf size={20} color="#1a1410" />
            </div>
            <div>
              <h1 style={{ fontSize: 26, fontFamily: 'var(--font-display)' }}>Donor Dashboard</h1>
              <p style={{ color: 'var(--muted)', fontSize: 14 }}>Welcome back, <span style={{ color: 'var(--amber)' }}>{profile?.name}</span> 👋</p>
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Post Food
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginBottom: 32 }}>
          {stats.map(s => (
            <div key={s.label} className="card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ fontSize: 28 }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: 26, fontFamily: 'var(--font-display)', fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--bg2)', padding: 4, borderRadius: 10, width: 'fit-content', border: '1px solid var(--border)' }}>
          <button onClick={() => setActiveTab('listings')}
            style={{ padding: '8px 20px', borderRadius: 8, fontSize: 14, fontWeight: 500, border: 'none', cursor: 'pointer', background: activeTab === 'listings' ? 'var(--card)' : 'transparent', color: activeTab === 'listings' ? 'var(--amber)' : 'var(--muted)', transition: 'all 0.2s' }}>
            My Listings
          </button>
          <button onClick={() => setActiveTab('requests')}
            style={{ padding: '8px 20px', borderRadius: 8, fontSize: 14, fontWeight: 500, border: 'none', cursor: 'pointer', background: activeTab === 'requests' ? 'var(--card)' : 'transparent', color: activeTab === 'requests' ? 'var(--amber)' : 'var(--muted)', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8 }}>
            Requests
            {requestCount > 0 && (
              <span style={{ background: 'var(--terra)', color: 'white', borderRadius: 10, fontSize: 11, padding: '2px 8px', fontWeight: 700 }}>
                {requestCount}
              </span>
            )}
          </button>
        </div>

        {/* MY LISTINGS TAB */}
        {activeTab === 'listings' && (
          loading ? (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--muted)' }}>
              <div style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--amber)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              Loading...
            </div>
          ) : listings.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 60 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🍱</div>
              <h3 style={{ marginBottom: 8, fontFamily: 'var(--font-display)' }}>No listings yet</h3>
              <p style={{ color: 'var(--muted)', marginBottom: 24, fontSize: 14 }}>Post your first food listing and help someone today</p>
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                <Plus size={16} /> Post Food
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }} className="stagger">
              {listings.map(listing => (
                <div key={listing.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(232,146,58,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                        {categoryEmoji(listing.category)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{listing.title}</div>
                        <span style={{ fontSize: 12, background: 'var(--bg3)', color: 'var(--muted2)', padding: '2px 10px', borderRadius: 20, border: '1px solid var(--border)' }}>
                          {listing.category}
                        </span>
                      </div>
                    </div>
                    <span className={`badge ${listing.status === 'available' ? 'badge-green' : listing.status === 'claimed' ? 'badge-blue' : 'badge-gray'}`}>
                      {listing.status}
                    </span>
                  </div>

                  {listing.description && (
                    <p style={{ fontSize: 13, color: 'var(--muted2)', lineHeight: 1.6 }}>{listing.description}</p>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <div style={{ fontSize: 13, color: 'var(--muted)' }}>📍 {listing.location}</div>
                    <div style={{ fontSize: 13, color: 'var(--muted)' }}>🍽️ {listing.quantity_remaining}/{listing.quantity} servings left</div>
                    {listing.expires_at && (
                      <div style={{ fontSize: 13, color: new Date(listing.expires_at) < new Date() ? '#e07a7a' : 'var(--muted)' }}>
                        ⏰ Expires {new Date(listing.expires_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: 8, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                    <button onClick={() => handleStatusToggle(listing)} className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                      {listing.status === 'available' ? 'Mark Expired' : 'Mark Available'}
                    </button>
                    <button onClick={() => handleDelete(listing.id)} className="btn btn-danger btn-sm" style={{ padding: '6px 12px' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* REQUESTS TAB */}
        {activeTab === 'requests' && (
          <div className="fade-in">
            <RequestsPanel onUpdate={fetchListings} />
          </div>
        )}

      </div>

      {showModal && (
        <PostFoodModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false)
            toast.success('Food posted! 🎉')
            fetchListings()
          }}
        />
      )}
    </div>
  )
}
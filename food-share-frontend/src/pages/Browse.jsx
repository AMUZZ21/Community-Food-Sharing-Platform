import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import ClaimModal from './recipient/ClaimModal'
import { Search, MapPin, Package, Clock, Filter } from 'lucide-react'

const categories = ['All', 'Vegetables', 'Fruits', 'Grains', 'Cooked Meals', 'Dairy', 'Bakery', 'Beverages', 'Snacks', 'Other']

export default function Browse() {
  const { user } = useAuth()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [selected, setSelected] = useState(null)

  useEffect(() => { fetchListings() }, [search, category])

  const fetchListings = async () => {
    setLoading(true)
    let query = supabase
      .from('food_listings')
      .select('*, users:donor_id(name, phone)')
      .eq('status', 'available')
      .order('created_at', { ascending: false })

    if (category !== 'All') query = query.eq('category', category)
    if (search) query = query.ilike('title', `%${search}%`)

    const { data, error } = await query
    if (!error) setListings(data || [])
    setLoading(false)
  }

  const categoryEmoji = (cat) => {
    const map = { Vegetables: '🥦', Fruits: '🍎', Grains: '🌾', 'Cooked Meals': '🍱', Dairy: '🥛', Bakery: '🍞', Beverages: '🥤', Snacks: '🍿', Other: '📦' }
    return map[cat] || '🍽️'
  }

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="container" style={{ padding: '40px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', fontFamily: 'var(--font-display)', marginBottom: 10 }}>
            Available <span style={{ color: 'var(--amber)' }}>Food Near You</span>
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 15 }}>Browse food shared by generous donors in your community</p>
        </div>

        {/* Search + Filter */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search food..." style={{ paddingLeft: 36 }} />
          </div>
          <select value={category} onChange={e => setCategory(e.target.value)} style={{ width: 'auto', minWidth: 160 }}>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Category pills */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
          {categories.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              style={{
                padding: '6px 14px', borderRadius: 20, border: `1px solid ${category === c ? 'var(--amber)' : 'var(--border)'}`,
                background: category === c ? 'rgba(232,146,58,0.1)' : 'transparent',
                color: category === c ? 'var(--amber)' : 'var(--muted2)', fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
              }}>
              {c !== 'All' ? categoryEmoji(c) + ' ' : ''}{c}
            </button>
          ))}
        </div>

        {/* Results count */}
        {!loading && (
          <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 20 }}>
            {listings.length} listing{listings.length !== 1 ? 's' : ''} available
          </p>
        )}

        {/* Listings grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 80, color: 'var(--muted)' }}>
            <div style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--amber)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            Loading food listings...
          </div>
        ) : listings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80 }} className="card">
            <div style={{ fontSize: 48, marginBottom: 16 }}>🍽️</div>
            <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 8 }}>No listings found</h3>
            <p style={{ color: 'var(--muted)', fontSize: 14 }}>Try a different search or category</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }} className="stagger">
            {listings.map(l => (
              <div key={l.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14, cursor: 'pointer' }}
                onClick={() => user ? setSelected(l) : window.location.href = '/login'}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(232,146,58,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                    {categoryEmoji(l.category)}
                  </div>
                  <span className="badge badge-green">Available</span>
                </div>

                <div>
                  <h3 style={{ fontSize: 16, fontFamily: 'var(--font-display)', marginBottom: 4 }}>{l.title}</h3>
                  <span style={{ fontSize: 12, background: 'var(--bg3)', color: 'var(--muted2)', padding: '2px 10px', borderRadius: 20, border: '1px solid var(--border)' }}>{l.category}</span>
                </div>

                {l.description && <p style={{ fontSize: 13, color: 'var(--muted2)', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{l.description}</p>}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--muted)' }}>
                    <MapPin size={13} /> {l.location}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--muted)' }}>
                    <Package size={13} /> {l.quantity_remaining} serving(s) left
                  </div>
                  {l.expires_at && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: new Date(l.expires_at) < new Date() ? '#e07a7a' : 'var(--muted)' }}>
                      <Clock size={13} /> Expires {new Date(l.expires_at).toLocaleDateString()}
                    </div>
                  )}
                </div>

                <div style={{ paddingTop: 8, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>By <span style={{ color: 'var(--cream)', fontWeight: 500 }}>{l.users?.name}</span></div>
                  <button className="btn btn-primary btn-sm" onClick={e => { e.stopPropagation(); user ? setSelected(l) : window.location.href = '/login' }}>
                    Claim
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && <ClaimModal listing={selected} onClose={() => setSelected(null)} onSuccess={() => { setSelected(null); fetchListings() }} />}
    </div>
  )
}
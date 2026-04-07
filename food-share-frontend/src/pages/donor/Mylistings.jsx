import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { MapPin, Clock, Trash2, Package } from 'lucide-react'
import toast from 'react-hot-toast'

export default function MyListings({ refresh, onRefresh }) {
  const { profile } = useAuth()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchListings() }, [refresh])

  const fetchListings = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('food_listings')
      .select('*')
      .eq('donor_id', profile?.id)
      .order('created_at', { ascending: false })
    if (!error) setListings(data || [])
    setLoading(false)
  }

  const deleteListing = async (id) => {
    if (!confirm('Delete this listing?')) return
    const { error } = await supabase.from('food_listings').delete().eq('id', id)
    if (!error) { toast.success('Listing deleted'); onRefresh() }
    else toast.error('Failed to delete')
  }

  const markExpired = async (id) => {
    const { error } = await supabase.from('food_listings').update({ status: 'expired' }).eq('id', id)
    if (!error) { toast.success('Marked as expired'); onRefresh() }
  }

  const statusBadge = (status) => {
    const map = { available: 'badge-green', claimed: 'badge-blue', expired: 'badge-gray' }
    return <span className={`badge ${map[status] || 'badge-gray'}`}>{status}</span>
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 60, color: 'var(--muted)' }}>
      <div style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--amber)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      Loading listings...
    </div>
  )

  if (listings.length === 0) return (
    <div style={{ textAlign: 'center', padding: 60 }} className="card">
      <Package size={40} color="var(--muted)" style={{ margin: '0 auto 16px' }} />
      <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 8 }}>No listings yet</h3>
      <p style={{ color: 'var(--muted)', fontSize: 14 }}>Click "Post Food" above to share your first listing</p>
    </div>
  )

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }} className="stagger">
      {listings.map(l => (
        <div key={l.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: 16, fontFamily: 'var(--font-display)', marginBottom: 4 }}>{l.title}</h3>
              <span style={{ fontSize: 12, background: 'var(--bg3)', color: 'var(--muted2)', padding: '2px 10px', borderRadius: 20, border: '1px solid var(--border)' }}>{l.category}</span>
            </div>
            {statusBadge(l.status)}
          </div>

          {l.description && <p style={{ fontSize: 13, color: 'var(--muted2)', lineHeight: 1.6 }}>{l.description}</p>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--muted)' }}>
              <MapPin size={13} /> {l.location}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--muted)' }}>
              <Package size={13} /> {l.quantity_remaining} / {l.quantity} servings remaining
            </div>
            {l.expires_at && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: new Date(l.expires_at) < new Date() ? '#e07a7a' : 'var(--muted)' }}>
                <Clock size={13} /> Expires {new Date(l.expires_at).toLocaleDateString()}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
            {l.status === 'available' && (
              <button onClick={() => markExpired(l.id)} className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                Mark Expired
              </button>
            )}
            <button onClick={() => deleteListing(l.id)} className="btn btn-danger btn-sm" style={{ padding: '6px 12px' }}>
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
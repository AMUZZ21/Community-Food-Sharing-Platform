import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { Check, X, Inbox, User, Package } from 'lucide-react'
import toast from 'react-hot-toast'

export default function IncomingRequests({ refresh, onRefresh }) {
  const { profile } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')

  useEffect(() => { fetchRequests() }, [refresh, filter])

  const fetchRequests = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('requests')
      .select(`*, food_listings!inner(title, location, donor_id), users:recipient_id(name, email, phone)`)
      .eq('food_listings.donor_id', profile?.id)
      .eq('status', filter)
      .order('created_at', { ascending: false })
    if (!error) setRequests(data || [])
    setLoading(false)
  }

  const updateStatus = async (id, status, listingId, qty) => {
    const { error } = await supabase.from('requests').update({ status, updated_at: new Date().toISOString() }).eq('id', id)
    if (error) { toast.error('Failed to update'); return }

    if (status === 'approved') {
      await supabase.rpc('decrement_quantity', { listing_id: listingId, amount: qty }).catch(() => null)
      await supabase.from('notifications').insert({
        user_id: requests.find(r => r.id === id)?.recipient_id,
        type: 'request_approved',
        title: 'Your request was approved!',
        message: `Your food request has been approved. Contact the donor to arrange pickup.`,
        related_id: id,
      })
      toast.success('Request approved!')
    } else {
      toast.success('Request rejected')
    }
    onRefresh()
  }

  const filters = ['pending', 'approved', 'rejected']

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 60, color: 'var(--muted)' }}>
      <div style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--amber)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      Loading requests...
    </div>
  )

  return (
    <div>
      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
            style={{ textTransform: 'capitalize' }}>
            {f}
          </button>
        ))}
      </div>

      {requests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60 }} className="card">
          <Inbox size={40} color="var(--muted)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 8 }}>No {filter} requests</h3>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>Requests from recipients will appear here</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} className="stagger">
          {requests.map(r => (
            <div key={r.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(232,146,58,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <User size={15} color="var(--amber)" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 15 }}>{r.users?.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{r.users?.email}</div>
                    </div>
                  </div>
                </div>
                <span className={`badge ${r.status === 'pending' ? 'badge-amber' : r.status === 'approved' ? 'badge-green' : 'badge-red'}`} style={{ textTransform: 'capitalize' }}>
                  {r.status}
                </span>
              </div>

              <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: '10px 14px', display: 'flex', gap: 12, alignItems: 'center' }}>
                <Package size={14} color="var(--amber)" />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{r.food_listings?.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>Requesting {r.quantity_requested} serving(s)</div>
                </div>
              </div>

              {r.message && (
                <div style={{ fontSize: 13, color: 'var(--muted2)', fontStyle: 'italic', padding: '8px 12px', background: 'var(--bg2)', borderRadius: 8, borderLeft: '3px solid var(--border2)' }}>
                  "{r.message}"
                </div>
              )}

              {r.users?.phone && (
                <div style={{ fontSize: 13, color: 'var(--muted)' }}>📞 {r.users.phone}</div>
              )}

              <div style={{ fontSize: 12, color: 'var(--muted)', paddingTop: 4, borderTop: '1px solid var(--border)' }}>
                Requested {new Date(r.created_at).toLocaleString()}
              </div>

              {r.status === 'pending' && (
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => updateStatus(r.id, 'approved', r.listing_id, r.quantity_requested)}
                    className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center', background: 'var(--success)' }}>
                    <Check size={14} /> Approve
                  </button>
                  <button onClick={() => updateStatus(r.id, 'rejected', r.listing_id, r.quantity_requested)}
                    className="btn btn-danger btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                    <X size={14} /> Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
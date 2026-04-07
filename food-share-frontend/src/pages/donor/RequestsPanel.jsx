import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { sendApprovalNotificationToRecipient } from '../../lib/email'
import { Check, X, Inbox, User, Package } from 'lucide-react'
import toast from 'react-hot-toast'

export default function RequestsPanel({ onUpdate }) {
  const { profile } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')

  useEffect(() => { fetchRequests() }, [filter])

  const fetchRequests = async () => {
  setLoading(true)

  // First get donor's listing IDs
  const { data: myListings } = await supabase
    .from('food_listings')
    .select('id')
    .eq('donor_id', profile?.id)

  if (!myListings || myListings.length === 0) {
    setRequests([])
    setLoading(false)
    return
  }

  const listingIds = myListings.map(l => l.id)

  // Then get requests for those listings
  const { data, error } = await supabase
    .from('requests')
    .select(`
      *,
      food_listings(title, location),
      users:recipient_id(name, email, phone)
    `)
    .in('listing_id', listingIds)
    .eq('status', filter)
    .order('created_at', { ascending: false })

  if (!error) setRequests(data || [])
  setLoading(false)
}

  const updateStatus = async (id, status) => {
    const { error } = await supabase
      .from('requests')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) { toast.error('Failed to update'); return }

    const req = requests.find(r => r.id === id)

    // Notify recipient
    await supabase.from('notifications').insert({
      user_id: req?.recipient_id,
      type: status === 'approved' ? 'request_approved' : 'request_rejected',
      title: status === 'approved' ? 'Your request was approved! 🎉' : 'Request update',
      message: status === 'approved'
        ? `Your request for "${req?.food_listings?.title}" was approved! Contact the donor to arrange pickup.`
        : `Your request for "${req?.food_listings?.title}" was not approved this time.`,
      related_id: id,
    })
    // Send email to recipient
    try {
     const { data: recipientData } = await supabase
     .from('users')
     .select('email, name')
     .eq('id', req?.recipient_id)
     .single()

     const { data: listingData } = await supabase
     .from('food_listings')
     .select('title, location')
     .eq('id', req?.listing_id)
     .single()

      if (recipientData && listingData) {
        await sendApprovalNotificationToRecipient({
        recipientEmail: recipientData.email,
        recipientName: recipientData.name,
        foodTitle: listingData.title,
        status,
        location: listingData.location,
        donorName: profile.name,
        donorPhone: profile.phone,
        })
      }
    }
    catch (emailErr) {
      console.log('Email failed (non-critical):', emailErr)
   }

    toast.success(status === 'approved' ? 'Request approved!' : 'Request rejected')
    fetchRequests()
    if (onUpdate) onUpdate()
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 60, color: 'var(--muted)' }}>
      <div style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--amber)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      Loading requests...
    </div>
  )

  return (
    <div>
      {/* Filter buttons */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['pending', 'approved', 'rejected'].map(f => (
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
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>
            {filter === 'pending' ? 'New requests from recipients will appear here' : `No ${filter} requests yet`}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }} className="stagger">
          {requests.map(r => (
            <div key={r.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

              {/* Recipient info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(232,146,58,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={16} color="var(--amber)" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{r.users?.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{r.users?.email}</div>
                  </div>
                </div>
                <span className={`badge ${r.status === 'pending' ? 'badge-amber' : r.status === 'approved' ? 'badge-green' : 'badge-red'}`}
                  style={{ textTransform: 'capitalize' }}>
                  {r.status}
                </span>
              </div>

              {/* Food listing info */}
              <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: '10px 14px', display: 'flex', gap: 10, alignItems: 'center' }}>
                <Package size={15} color="var(--amber)" />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{r.food_listings?.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                    Requesting {r.quantity_requested} serving(s) · 📍 {r.food_listings?.location}
                  </div>
                </div>
              </div>

              {/* Message */}
              {r.message && (
                <div style={{ fontSize: 13, color: 'var(--muted2)', fontStyle: 'italic', padding: '8px 12px', background: 'var(--bg2)', borderRadius: 8, borderLeft: '3px solid var(--border2)' }}>
                  "{r.message}"
                </div>
              )}

              {/* Phone */}
              {r.users?.phone && (
                <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                  📞 {r.users.phone}
                </div>
              )}

              {/* Timestamp */}
              <div style={{ fontSize: 12, color: 'var(--muted)', paddingTop: 6, borderTop: '1px solid var(--border)' }}>
                Requested on {new Date(r.created_at).toLocaleString()}
              </div>

              {/* Action buttons — only for pending */}
              {r.status === 'pending' && (
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={() => updateStatus(r.id, 'approved')}
                    className="btn btn-sm"
                    style={{ flex: 1, justifyContent: 'center', background: 'var(--success)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Check size={14} /> Approve
                  </button>
                  <button
                    onClick={() => updateStatus(r.id, 'rejected')}
                    className="btn btn-danger btn-sm"
                    style={{ flex: 1, justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 6 }}>
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
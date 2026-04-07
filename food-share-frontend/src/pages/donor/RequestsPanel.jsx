import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { sendApprovalNotificationToRecipient } from '../../lib/email'
import { Check, X, Inbox, User, Package, Phone, Mail, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'

export default function RequestsPanel({ onUpdate }) {
  const { profile } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')

  useEffect(() => { fetchRequests() }, [filter, profile])

  const fetchRequests = async () => {
    if (!profile) return
    setLoading(true)

    // Step 1: get donor's listing IDs
    const { data: myListings } = await supabase
      .from('food_listings')
      .select('id')
      .eq('donor_id', profile.id)

    if (!myListings || myListings.length === 0) {
      setRequests([])
      setLoading(false)
      return
    }

    const listingIds = myListings.map(l => l.id)

    // Step 2: get requests for those listings
    const { data, error } = await supabase
      .from('requests')
      .select(`
        *,
        food_listings(id, title, location, quantity_remaining),
        users:recipient_id(id, name, email, phone)
      `)
      .in('listing_id', listingIds)
      .eq('status', filter)
      .order('created_at', { ascending: false })

    if (!error) setRequests(data || [])
    setLoading(false)
  }

  const updateStatus = async (req, status) => {
    // Update request status
    const { error } = await supabase
      .from('requests')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', req.id)

    if (error) { toast.error('Failed to update: ' + error.message); return }

    // If approved — subtract quantity
    if (status === 'approved') {
      const { error: rpcError } = await supabase.rpc('decrement_quantity', {
        listing_id: req.listing_id,
        amount: req.quantity_requested,
      })
      if (rpcError) console.error('Quantity update error:', rpcError)
    }

    // Notify recipient in DB
    await supabase.from('notifications').insert({
      user_id: req.recipient_id,
      type: status === 'approved' ? 'request_approved' : 'request_rejected',
      title: status === 'approved' ? 'Your request was approved! 🎉' : 'Request update',
      message: status === 'approved'
        ? `Your request for "${req.food_listings?.title}" was approved! Contact the donor to arrange pickup.`
        : `Your request for "${req.food_listings?.title}" was not approved this time.`,
      related_id: req.id,
    })

    // Send email to recipient
    try {
      if (req.users?.email) {
        await sendApprovalNotificationToRecipient({
          recipientEmail: req.users.email,
          recipientName: req.users.name,
          foodTitle: req.food_listings?.title,
          status,
          location: req.food_listings?.location,
          donorName: profile.name,
          donorPhone: profile.phone || 'Contact via platform',
        })
      }
    } catch (emailErr) {
      console.log('Email failed (non-critical):', emailErr)
    }

    toast.success(status === 'approved' ? '✅ Request approved!' : 'Request rejected')
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
      {/* Filter */}
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} className="stagger">
          {requests.map(r => (
            <div key={r.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(232,146,58,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={16} color="var(--amber)" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{r.users?.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>Recipient</div>
                  </div>
                </div>
                <span className={`badge ${r.status === 'pending' ? 'badge-amber' : r.status === 'approved' ? 'badge-green' : 'badge-red'}`}
                  style={{ textTransform: 'capitalize' }}>{r.status}</span>
              </div>

              {/* Recipient contact info — always visible */}
              <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 12, color: 'var(--amber)', fontWeight: 600, marginBottom: 4 }}>RECIPIENT CONTACT</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--cream)' }}>
                  <Mail size={13} color="var(--muted)" /> {r.users?.email}
                </div>
                {r.users?.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--cream)' }}>
                    <Phone size={13} color="var(--muted)" /> {r.users.phone}
                  </div>
                )}
              </div>

              {/* Food listing info */}
              <div style={{ background: 'rgba(232,146,58,0.06)', border: '1px solid rgba(232,146,58,0.15)', borderRadius: 10, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontSize: 12, color: 'var(--amber)', fontWeight: 600, marginBottom: 4 }}>FOOD LISTING</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                  <Package size={13} color="var(--amber)" />
                  <span style={{ fontWeight: 500 }}>{r.food_listings?.title}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--muted)' }}>
                  <MapPin size={13} /> {r.food_listings?.location}
                </div>
                <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                  Requesting <strong style={{ color: 'var(--cream)' }}>{r.quantity_requested} serving(s)</strong>
                  {r.food_listings?.quantity_remaining !== undefined && (
                    <span style={{ color: 'var(--muted)' }}> · {r.food_listings.quantity_remaining} remaining</span>
                  )}
                </div>
              </div>

              {/* Recipient message */}
              {r.message && (
                <div style={{ fontSize: 13, color: 'var(--muted2)', fontStyle: 'italic', padding: '10px 14px', background: 'var(--bg2)', borderRadius: 8, borderLeft: '3px solid var(--border2)' }}>
                  "{r.message}"
                </div>
              )}

              {/* Timestamp */}
              <div style={{ fontSize: 12, color: 'var(--muted)', paddingTop: 6, borderTop: '1px solid var(--border)' }}>
                Requested on {new Date(r.created_at).toLocaleString()}
              </div>

              {/* Approve / Reject buttons */}
              {r.status === 'pending' && (
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => updateStatus(r, 'approved')}
                    className="btn btn-sm"
                    style={{ flex: 1, justifyContent: 'center', background: 'var(--success)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Check size={14} /> Approve
                  </button>
                  <button onClick={() => updateStatus(r, 'rejected')}
                    className="btn btn-danger btn-sm"
                    style={{ flex: 1, justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <X size={14} /> Reject
                  </button>
                </div>
              )}

              {/* After approval — show donor's own contact for reference */}
              {r.status === 'approved' && (
                <div style={{ background: 'rgba(90,154,106,0.08)', border: '1px solid rgba(90,154,106,0.2)', borderRadius: 10, padding: '12px 16px' }}>
                  <div style={{ fontSize: 12, color: '#7ec98a', fontWeight: 600, marginBottom: 8 }}>✅ APPROVED — recipient has your contact details</div>
                  <div style={{ fontSize: 13, color: 'var(--muted2)' }}>They will reach out to arrange pickup. Your phone: <strong style={{ color: 'var(--cream)' }}>{profile.phone || 'Not set'}</strong></div>
                </div>
              )}

            </div>
          ))}
        </div>
      )}
    </div>
  )
}
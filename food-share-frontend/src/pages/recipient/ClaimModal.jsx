import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { sendRequestNotificationToDonor } from '../../lib/email'
import { X, MapPin, Package, User } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ClaimModal({ listing, onClose, onSuccess }) {
  const { profile } = useAuth()
  const [form, setForm] = useState({ quantity_requested: 1, message: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    if (form.quantity_requested > listing.quantity_remaining) {
      setError(`Only ${listing.quantity_remaining} serving(s) available.`)
      return
    }
    setLoading(true)
    try {
      const { error: err } = await supabase.from('requests').insert({
        listing_id: listing.id,
        recipient_id: profile.id,
        quantity_requested: parseInt(form.quantity_requested),
        message: form.message,
        status: 'pending',
      })
      if (err) throw err

      // Notify donor
      await supabase.from('notifications').insert({
        user_id: listing.donor_id,
        type: 'request_received',
        title: 'New food request!',
        message: `${profile.name} has requested ${form.quantity_requested} serving(s) of "${listing.title}".`,
        related_id: listing.id,
      })
      // Send email to donor
    try {
      const { data: donorData } = await supabase
     .from('users')
     .select('email, name, phone')
     .eq('id', listing.donor_id)
     .single()

      if (donorData) {
       await sendRequestNotificationToDonor({
      donorEmail: donorData.email,
      donorName: donorData.name,
      recipientName: profile.name,
      foodTitle: listing.title,
      quantity: form.quantity_requested,
      message: form.message,
      location: listing.location,
       })
      }
    } 
    catch (emailErr) {
      console.log('Email failed (non-critical):', emailErr)
    }


      toast.success('Request sent! The donor will contact you.')
      onSuccess()
    } catch (err) {
      setError(err.message || 'Failed to send request.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="card fade-in" style={{ width: '100%', maxWidth: 460, padding: 32, position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}>
          <X size={20} />
        </button>

        <h2 style={{ fontSize: 22, fontFamily: 'var(--font-display)', marginBottom: 20 }}>Request Food</h2>

        {/* Listing summary */}
        <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: 16, marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontWeight: 600, fontSize: 15 }}>{listing.title}</div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--muted)' }}>
              <User size={12} /> {listing.users?.name}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--muted)' }}>
              <MapPin size={12} /> {listing.location}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--muted)' }}>
              <Package size={12} /> {listing.quantity_remaining} available
            </div>
          </div>
        </div>

        {error && (
          <div style={{ background: 'rgba(196,74,74,0.1)', border: '1px solid rgba(196,74,74,0.25)', borderRadius: 8, padding: '10px 14px', color: '#e07a7a', fontSize: 13, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label>How many servings do you need? *</label>
            <input type="number" value={form.quantity_requested} onChange={e => setForm({ ...form, quantity_requested: e.target.value })}
              min="1" max={listing.quantity_remaining} required />
          </div>
          <div className="form-group">
            <label>Message to donor <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optional)</span></label>
            <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
              placeholder="Introduce yourself, mention pickup preference..." rows={3} style={{ resize: 'vertical' }} />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1, justifyContent: 'center' }}>
              {loading ? 'Sending...' : 'Send Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { X, Upload } from 'lucide-react'

const categories = ['Vegetables', 'Fruits', 'Grains', 'Cooked Meals', 'Dairy', 'Bakery', 'Beverages', 'Snacks', 'Other']

export default function PostFoodModal({ onClose, onSuccess }) {
  const { profile } = useAuth()
  const [form, setForm] = useState({
    title: '', category: '', quantity: '', location: '', description: '', expires_at: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { error: err } = await supabase.from('food_listings').insert({
        donor_id: profile.id,
        title: form.title,
        category: form.category,
        quantity: parseInt(form.quantity),
        quantity_remaining: parseInt(form.quantity),
        location: form.location,
        description: form.description,
        expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
        status: 'available',
      })
      if (err) throw err
      onSuccess()
    } catch (err) {
      setError(err.message || 'Failed to post food. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="card fade-in" style={{ width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', padding: 32, position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}>
          <X size={20} />
        </button>

        <h2 style={{ fontSize: 22, fontFamily: 'var(--font-display)', marginBottom: 6 }}>Post Food</h2>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 24 }}>Fill in the details about the food you want to share</p>

        {error && (
          <div style={{ background: 'rgba(196,74,74,0.1)', border: '1px solid rgba(196,74,74,0.25)', borderRadius: 8, padding: '10px 14px', color: '#e07a7a', fontSize: 13, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label>Food title *</label>
            <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Fresh home cooked rice and dal" required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label>Category *</label>
              <select name="category" value={form.category} onChange={handleChange} required>
                <option value="">Select category</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Quantity (servings) *</label>
              <input type="number" name="quantity" value={form.quantity} onChange={handleChange} placeholder="e.g. 5" min="1" required />
            </div>
          </div>

          <div className="form-group">
            <label>Pickup location *</label>
            <input name="location" value={form.location} onChange={handleChange} placeholder="e.g. Banjara Hills, Hyderabad" required />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Describe the food, any dietary info, pickup instructions..." rows={3} style={{ resize: 'vertical' }} />
          </div>

          <div className="form-group">
            <label>Expires on <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optional)</span></label>
            <input type="datetime-local" name="expires_at" value={form.expires_at} onChange={handleChange} />
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1, justifyContent: 'center' }}>
              {loading ? 'Posting...' : 'Post Food'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

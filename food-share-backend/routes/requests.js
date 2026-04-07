const express = require('express')
const router = express.Router()
const { authenticate, requireRole, supabase } = require('../middleware/authMiddleware')
const { sendRequestEmail, sendApprovalEmail } = require('../utils/email')

// POST create request (recipients only)
router.post('/', authenticate, requireRole('recipient'), async (req, res) => {
  try {
    const { listing_id, quantity_requested, message } = req.body

    if (!listing_id || !quantity_requested) {
      return res.status(400).json({ error: 'listing_id and quantity_requested are required' })
    }

    // Check listing exists and has enough quantity
    const { data: listing } = await supabase
      .from('food_listings')
      .select('*, users:donor_id(name, email)')
      .eq('id', listing_id)
      .single()

    if (!listing) return res.status(404).json({ error: 'Listing not found' })
    if (listing.status !== 'available') return res.status(400).json({ error: 'This listing is no longer available' })
    if (listing.quantity_remaining < quantity_requested) {
      return res.status(400).json({ error: `Only ${listing.quantity_remaining} serving(s) available` })
    }

    // Check no duplicate pending request
    const { data: existing } = await supabase
      .from('requests')
      .select('id')
      .eq('listing_id', listing_id)
      .eq('recipient_id', req.user.id)
      .eq('status', 'pending')
      .single()

    if (existing) return res.status(400).json({ error: 'You already have a pending request for this listing' })

    // Create request
    const { data: request, error } = await supabase
      .from('requests')
      .insert({
        listing_id,
        recipient_id: req.user.id,
        quantity_requested: parseInt(quantity_requested),
        message: message || null,
        status: 'pending',
      })
      .select()
      .single()

    if (error) throw error

    // Notify donor in DB
    await supabase.from('notifications').insert({
      user_id: listing.donor_id,
      type: 'request_received',
      title: 'New food request!',
      message: `${req.profile.name} requested ${quantity_requested} serving(s) of "${listing.title}"`,
      related_id: request.id,
    })

    // Send email to donor
    try {
      await sendRequestEmail({
        donorEmail: listing.users.email,
        donorName: listing.users.name,
        recipientName: req.profile.name,
        foodTitle: listing.title,
        quantity: quantity_requested,
        message: message || '',
        location: listing.location,
      })
    } catch (emailErr) {
      console.log('Email send failed (non-critical):', emailErr.message)
    }

    res.status(201).json({ request, message: 'Request sent successfully' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET recipient's own requests
router.get('/mine', authenticate, requireRole('recipient'), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('requests')
      .select('*, food_listings(title, location, category, donor_id, users:donor_id(name, phone))')
      .eq('recipient_id', req.user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    res.json({ requests: data })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET requests for donor's listings
router.get('/incoming', authenticate, requireRole('donor'), async (req, res) => {
  try {
    const { status = 'pending' } = req.query

    const { data, error } = await supabase
      .from('requests')
      .select('*, food_listings!inner(title, location, donor_id), users:recipient_id(name, email, phone)')
      .eq('food_listings.donor_id', req.user.id)
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    res.json({ requests: data })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PUT approve or reject a request (donor only)
router.put('/:id/status', authenticate, requireRole('donor'), async (req, res) => {
  try {
    const { status } = req.body
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be approved or rejected' })
    }

    // Verify donor owns the listing
    const { data: request } = await supabase
      .from('requests')
      .select('*, food_listings!inner(title, donor_id, location), users:recipient_id(name, email)')
      .eq('id', req.params.id)
      .single()

    if (!request) return res.status(404).json({ error: 'Request not found' })
    if (request.food_listings.donor_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' })
    }

    // Update request status
    const { data: updated, error } = await supabase
      .from('requests')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single()

    if (error) throw error

    // If approved, reduce quantity
    if (status === 'approved') {
      await supabase.rpc('decrement_quantity', {
        listing_id: request.listing_id,
        amount: request.quantity_requested,
      }).catch(() => null)
    }

    // Notify recipient
    await supabase.from('notifications').insert({
      user_id: request.recipient_id,
      type: status === 'approved' ? 'request_approved' : 'request_rejected',
      title: status === 'approved' ? 'Your request was approved! 🎉' : 'Request update',
      message: status === 'approved'
        ? `Your request for "${request.food_listings.title}" was approved! Contact the donor to arrange pickup.`
        : `Your request for "${request.food_listings.title}" was not approved this time.`,
      related_id: request.id,
    })

    // Send email
    try {
      await sendApprovalEmail({
        recipientEmail: request.users.email,
        recipientName: request.users.name,
        foodTitle: request.food_listings.title,
        status,
        location: request.food_listings.location,
        donorName: req.profile.name,
        donorPhone: req.profile.phone || 'Contact via platform',
      })
    } catch (emailErr) {
      console.log('Email send failed (non-critical):', emailErr.message)
    }

    res.json({ request: updated, message: `Request ${status} successfully` })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
const express = require('express')
const router = express.Router()
const { authenticate, supabase } = require('../middleware/authMiddleware')

// Get current user profile
router.get('/me', authenticate, async (req, res) => {
  try {
    res.json({ user: req.user, profile: req.profile })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Update profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, phone } = req.body
    const { data, error } = await supabase
      .from('users')
      .update({ name, phone })
      .eq('id', req.user.id)
      .select()
      .single()

    if (error) throw error
    res.json({ profile: data })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Get user stats
router.get('/stats', authenticate, async (req, res) => {
  try {
    const userId = req.user.id
    const profile = req.profile

    if (profile.role === 'donor') {
      const { data: listings } = await supabase
        .from('food_listings')
        .select('id, status')
        .eq('donor_id', userId)

      const listingIds = listings?.map(l => l.id) || []
      const { count: pendingRequests } = await supabase
        .from('requests')
        .select('id', { count: 'exact' })
        .in('listing_id', listingIds)
        .eq('status', 'pending')

      return res.json({
        total: listings?.length || 0,
        available: listings?.filter(l => l.status === 'available').length || 0,
        claimed: listings?.filter(l => l.status === 'claimed').length || 0,
        pendingRequests: pendingRequests || 0,
      })
    }

    if (profile.role === 'recipient') {
      const { data: requests } = await supabase
        .from('requests')
        .select('id, status')
        .eq('recipient_id', userId)

      return res.json({
        total: requests?.length || 0,
        pending: requests?.filter(r => r.status === 'pending').length || 0,
        approved: requests?.filter(r => r.status === 'approved').length || 0,
      })
    }

    res.json({})
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
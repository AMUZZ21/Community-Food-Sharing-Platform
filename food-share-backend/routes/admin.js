const express = require('express')
const router = express.Router()
const { authenticate, requireRole, supabase } = require('../middleware/authMiddleware')

// All admin routes require authentication + admin role
router.use(authenticate, requireRole('admin'))

// GET platform stats
router.get('/stats', async (req, res) => {
  try {
    const [
      { count: totalUsers },
      { count: totalListings },
      { count: totalRequests },
      { count: pendingRequests },
      { count: donors },
      { count: recipients },
    ] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact' }),
      supabase.from('food_listings').select('id', { count: 'exact' }),
      supabase.from('requests').select('id', { count: 'exact' }),
      supabase.from('requests').select('id', { count: 'exact' }).eq('status', 'pending'),
      supabase.from('users').select('id', { count: 'exact' }).eq('role', 'donor'),
      supabase.from('users').select('id', { count: 'exact' }).eq('role', 'recipient'),
    ])

    res.json({ totalUsers, totalListings, totalRequests, pendingRequests, donors, recipients })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET all users
router.get('/users', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    res.json({ users: data })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PUT toggle user active status
router.put('/users/:id/toggle', async (req, res) => {
  try {
    const { data: user } = await supabase.from('users').select('is_active, role').eq('id', req.params.id).single()
    if (!user) return res.status(404).json({ error: 'User not found' })
    if (user.role === 'admin') return res.status(403).json({ error: 'Cannot deactivate admin' })

    const { data, error } = await supabase
      .from('users')
      .update({ is_active: !user.is_active })
      .eq('id', req.params.id)
      .select()
      .single()

    if (error) throw error

    // Log action
    await supabase.from('admin_logs').insert({
      admin_id: req.user.id,
      action: user.is_active ? 'deactivate_user' : 'activate_user',
      target_type: 'user',
      target_id: req.params.id,
    })

    res.json({ user: data })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE user
router.delete('/users/:id', async (req, res) => {
  try {
    const { data: user } = await supabase.from('users').select('role').eq('id', req.params.id).single()
    if (user?.role === 'admin') return res.status(403).json({ error: 'Cannot delete admin' })

    await supabase.from('users').delete().eq('id', req.params.id)

    await supabase.from('admin_logs').insert({
      admin_id: req.user.id,
      action: 'delete_user',
      target_type: 'user',
      target_id: req.params.id,
    })

    res.json({ message: 'User deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET all listings
router.get('/listings', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('food_listings')
      .select('*, users:donor_id(name)')
      .order('created_at', { ascending: false })
    if (error) throw error
    res.json({ listings: data })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE listing
router.delete('/listings/:id', async (req, res) => {
  try {
    await supabase.from('food_listings').delete().eq('id', req.params.id)
    await supabase.from('admin_logs').insert({
      admin_id: req.user.id,
      action: 'delete_listing',
      target_type: 'food_listing',
      target_id: req.params.id,
    })
    res.json({ message: 'Listing deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET all requests
router.get('/requests', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('requests')
      .select('*, food_listings(title), users:recipient_id(name)')
      .order('created_at', { ascending: false })
    if (error) throw error
    res.json({ requests: data })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET admin logs
router.get('/logs', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('admin_logs')
      .select('*, users:admin_id(name)')
      .order('created_at', { ascending: false })
      .limit(50)
    if (error) throw error
    res.json({ logs: data })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
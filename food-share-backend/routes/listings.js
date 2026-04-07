const express = require('express')
const router = express.Router()
const { authenticate, requireRole, supabase } = require('../middleware/authMiddleware')

// GET all available listings (public)
router.get('/', async (req, res) => {
  try {
    const { category, search, limit = 20, offset = 0 } = req.query

    let query = supabase
      .from('food_listings')
      .select('*, users:donor_id(name, phone)')
      .eq('status', 'available')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (category && category !== 'All') query = query.eq('category', category)
    if (search) query = query.ilike('title', `%${search}%`)

    const { data, error } = await query
    if (error) throw error
    res.json({ listings: data })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET single listing
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('food_listings')
      .select('*, users:donor_id(name, phone, email)')
      .eq('id', req.params.id)
      .single()

    if (error) throw error
    if (!data) return res.status(404).json({ error: 'Listing not found' })
    res.json({ listing: data })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST create listing (donors only)
router.post('/', authenticate, requireRole('donor'), async (req, res) => {
  try {
    const { title, category, quantity, location, description, expires_at } = req.body

    if (!title || !category || !quantity || !location) {
      return res.status(400).json({ error: 'Title, category, quantity, and location are required' })
    }

    const { data, error } = await supabase
      .from('food_listings')
      .insert({
        donor_id: req.user.id,
        title, category, location, description,
        quantity: parseInt(quantity),
        quantity_remaining: parseInt(quantity),
        expires_at: expires_at || null,
        status: 'available',
      })
      .select()
      .single()

    if (error) throw error
    res.status(201).json({ listing: data, message: 'Food listing created successfully' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PUT update listing (donor owns it)
router.put('/:id', authenticate, requireRole('donor'), async (req, res) => {
  try {
    const { title, category, quantity, location, description, expires_at, status } = req.body

    const { data: existing } = await supabase
      .from('food_listings')
      .select('donor_id')
      .eq('id', req.params.id)
      .single()

    if (!existing || existing.donor_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this listing' })
    }

    const { data, error } = await supabase
      .from('food_listings')
      .update({ title, category, location, description, expires_at, status })
      .eq('id', req.params.id)
      .select()
      .single()

    if (error) throw error
    res.json({ listing: data })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE listing (donor owns it)
router.delete('/:id', authenticate, requireRole('donor'), async (req, res) => {
  try {
    const { data: existing } = await supabase
      .from('food_listings')
      .select('donor_id')
      .eq('id', req.params.id)
      .single()

    if (!existing || existing.donor_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this listing' })
    }

    const { error } = await supabase
      .from('food_listings')
      .delete()
      .eq('id', req.params.id)

    if (error) throw error
    res.json({ message: 'Listing deleted successfully' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET donor's own listings
router.get('/donor/mine', authenticate, requireRole('donor'), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('food_listings')
      .select('*')
      .eq('donor_id', req.user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    res.json({ listings: data })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
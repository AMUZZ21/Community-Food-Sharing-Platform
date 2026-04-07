require('dotenv').config()
const express = require('express')
const cors = require('cors')

const authRoutes = require('./routes/auth')
const listingRoutes = require('./routes/listings')
const requestRoutes = require('./routes/requests')
const adminRoutes = require('./routes/admin')
const emailRoutes = require('./routes/email')

const app = express()

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())

// Health check
app.get('/', (req, res) => res.json({ status: 'FoodShare API running ✅', version: '1.0.0' }))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/listings', listingRoutes)
app.use('/api/requests', requestRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/email', emailRoutes)

// 404 handler
app.use((req, res) => res.status(404).json({ error: 'Route not found' }))

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Internal server error', message: err.message })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))
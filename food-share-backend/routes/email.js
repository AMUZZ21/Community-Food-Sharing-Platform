const express = require('express')
const router = express.Router()
const { authenticate } = require('../middleware/authMiddleware')
const { sendWelcomeEmail } = require('../utils/email')

// Send welcome email after registration
router.post('/welcome', authenticate, async (req, res) => {
  try {
    await sendWelcomeEmail({
      email: req.profile.email,
      name: req.profile.name,
      role: req.profile.role,
    })
    res.json({ message: 'Welcome email sent' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
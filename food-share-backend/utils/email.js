const { Resend } = require('resend')

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev'
const APP_NAME = 'FoodShare'
const APP_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

// Email when a recipient requests food
const sendRequestEmail = async ({ donorEmail, donorName, recipientName, foodTitle, quantity, message, location }) => {
  await resend.emails.send({
    from: FROM_EMAIL,
    to: donorEmail,
    subject: `🍽️ New food request for "${foodTitle}"`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: 'DM Sans', Arial, sans-serif; background: #1a1410; color: #f5ede0; margin: 0; padding: 0;">
        <div style="max-width: 560px; margin: 40px auto; background: #2e2519; border: 1px solid #3d3025; border-radius: 16px; overflow: hidden;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #e8923a, #c4613a); padding: 32px; text-align: center;">
            <div style="font-size: 32px; margin-bottom: 8px;">🌿</div>
            <h1 style="margin: 0; font-size: 22px; color: #1a1410; font-weight: 700;">${APP_NAME}</h1>
          </div>

          <!-- Body -->
          <div style="padding: 32px;">
            <h2 style="margin: 0 0 8px; font-size: 20px; color: #f5ede0;">New Food Request!</h2>
            <p style="color: #a08870; margin: 0 0 24px;">Hi ${donorName}, someone wants your food listing.</p>

            <!-- Listing card -->
            <div style="background: #221c16; border: 1px solid #3d3025; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
              <div style="font-size: 13px; color: #a08870; margin-bottom: 4px;">Food listing</div>
              <div style="font-size: 17px; font-weight: 600; margin-bottom: 8px;">${foodTitle}</div>
              <div style="font-size: 13px; color: #a08870;">📍 ${location}</div>
            </div>

            <!-- Request details -->
            <div style="background: rgba(232,146,58,0.08); border: 1px solid rgba(232,146,58,0.2); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
              <div style="margin-bottom: 10px;"><strong style="color: #e8923a;">From:</strong> <span>${recipientName}</span></div>
              <div style="margin-bottom: 10px;"><strong style="color: #e8923a;">Quantity:</strong> <span>${quantity} serving(s)</span></div>
              ${message ? `<div><strong style="color: #e8923a;">Message:</strong> <span style="color: #a08870; font-style: italic;">"${message}"</span></div>` : ''}
            </div>

            <p style="color: #a08870; font-size: 14px; margin-bottom: 24px;">Log in to your dashboard to approve or reject this request.</p>

            <a href="${APP_URL}/donor" style="display: inline-block; background: #e8923a; color: #1a1410; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
              View Request →
            </a>
          </div>

          <!-- Footer -->
          <div style="padding: 20px 32px; border-top: 1px solid #3d3025; text-align: center;">
            <p style="margin: 0; font-size: 12px; color: #8a7560;">${APP_NAME} · Fighting food waste, one meal at a time 🌱</p>
          </div>
        </div>
      </body>
      </html>
    `,
  })
}

// Email when donor approves/rejects a request
const sendApprovalEmail = async ({ recipientEmail, recipientName, foodTitle, status, location, donorName, donorPhone }) => {
  const isApproved = status === 'approved'

  await resend.emails.send({
    from: FROM_EMAIL,
    to: recipientEmail,
    subject: isApproved ? `✅ Your food request was approved!` : `Update on your food request`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: 'DM Sans', Arial, sans-serif; background: #1a1410; color: #f5ede0; margin: 0; padding: 0;">
        <div style="max-width: 560px; margin: 40px auto; background: #2e2519; border: 1px solid #3d3025; border-radius: 16px; overflow: hidden;">

          <!-- Header -->
          <div style="background: ${isApproved ? 'linear-gradient(135deg, #5a9a6a, #3a7a4a)' : 'linear-gradient(135deg, #6a4a4a, #4a3030)'}; padding: 32px; text-align: center;">
            <div style="font-size: 40px; margin-bottom: 8px;">${isApproved ? '✅' : '😔'}</div>
            <h1 style="margin: 0; font-size: 22px; color: #fff; font-weight: 700;">
              ${isApproved ? 'Request Approved!' : 'Request Update'}
            </h1>
          </div>

          <!-- Body -->
          <div style="padding: 32px;">
            <p style="color: #a08870; margin: 0 0 24px; font-size: 15px;">Hi ${recipientName},</p>

            ${isApproved ? `
              <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.7;">
                Great news! Your request for <strong style="color: #e8923a;">"${foodTitle}"</strong> has been approved by ${donorName}. 🎉
              </p>

              <!-- Pickup info -->
              <div style="background: rgba(90,154,106,0.1); border: 1px solid rgba(90,154,106,0.25); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <div style="font-size: 13px; color: #7ec98a; font-weight: 600; margin-bottom: 12px;">PICKUP DETAILS</div>
                <div style="margin-bottom: 8px;">📍 <strong>Location:</strong> ${location}</div>
                <div style="margin-bottom: 8px;">👤 <strong>Donor:</strong> ${donorName}</div>
                <div>📞 <strong>Contact:</strong> ${donorPhone}</div>
              </div>

              <p style="color: #a08870; font-size: 14px; margin-bottom: 24px;">Please contact the donor directly to arrange the pickup time.</p>

              <a href="${APP_URL}/recipient" style="display: inline-block; background: #5a9a6a; color: #fff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
                View My Requests →
              </a>
            ` : `
              <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.7; color: #a08870;">
                Unfortunately, your request for <strong style="color: #e8923a;">"${foodTitle}"</strong> was not approved this time.
              </p>
              <p style="margin: 0 0 24px; font-size: 14px; color: #a08870;">Don't be discouraged — there are plenty of other listings available. Browse and request again!</p>

              <a href="${APP_URL}/browse" style="display: inline-block; background: #e8923a; color: #1a1410; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
                Browse Food →
              </a>
            `}
          </div>

          <!-- Footer -->
          <div style="padding: 20px 32px; border-top: 1px solid #3d3025; text-align: center;">
            <p style="margin: 0; font-size: 12px; color: #8a7560;">${APP_NAME} · Fighting food waste, one meal at a time 🌱</p>
          </div>
        </div>
      </body>
      </html>
    `,
  })
}

// Welcome email on registration
const sendWelcomeEmail = async ({ email, name, role }) => {
  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Welcome to ${APP_NAME}! 🌿`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; background: #1a1410; color: #f5ede0; margin: 0; padding: 0;">
        <div style="max-width: 560px; margin: 40px auto; background: #2e2519; border: 1px solid #3d3025; border-radius: 16px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #e8923a, #c4613a); padding: 32px; text-align: center;">
            <div style="font-size: 40px; margin-bottom: 8px;">🌿</div>
            <h1 style="margin: 0; font-size: 24px; color: #1a1410;">Welcome to ${APP_NAME}!</h1>
          </div>
          <div style="padding: 32px;">
            <p style="font-size: 16px; margin: 0 0 16px;">Hi ${name}! 👋</p>
            <p style="color: #a08870; margin: 0 0 24px; line-height: 1.7;">
              You've joined as a <strong style="color: #e8923a; text-transform: capitalize;">${role}</strong>. 
              ${role === 'donor' ? 'Start posting food to help your community reduce waste and fight hunger.' : 'Browse available food listings and request what you need.'}
            </p>
            <a href="${APP_URL}/${role}" style="display: inline-block; background: #e8923a; color: #1a1410; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              Go to Dashboard →
            </a>
          </div>
          <div style="padding: 20px 32px; border-top: 1px solid #3d3025; text-align: center;">
            <p style="margin: 0; font-size: 12px; color: #8a7560;">${APP_NAME} · Free forever 🌱</p>
          </div>
        </div>
      </body>
      </html>
    `,
  })
}

module.exports = { sendRequestEmail, sendApprovalEmail, sendWelcomeEmail }
const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY
const APP_NAME = 'FoodShare'
const APP_URL = 'http://localhost:5173'

const sendEmail = async ({ to, subject, html }) => {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to,
        subject,
        html,
      }),
    })
    const data = await res.json()
    if (!res.ok) console.error('Email error:', data)
    return data
  } catch (err) {
    console.error('Email send failed:', err)
  }
}

// Email to DONOR when recipient sends a request
export const sendRequestNotificationToDonor = async ({
  donorEmail, donorName, recipientName, foodTitle, quantity, message, location
}) => {
  await sendEmail({
    to: donorEmail,
    subject: `🍽️ New food request for "${foodTitle}"`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#2e2519;border-radius:16px;overflow:hidden;border:1px solid #3d3025">
        <div style="background:linear-gradient(135deg,#e8923a,#c4613a);padding:32px;text-align:center">
          <div style="font-size:36px;margin-bottom:8px">🌿</div>
          <h1 style="margin:0;color:#1a1410;font-size:22px">${APP_NAME}</h1>
        </div>
        <div style="padding:32px;color:#f5ede0">
          <h2 style="margin:0 0 8px;font-size:20px">New Food Request!</h2>
          <p style="color:#a08870;margin:0 0 24px">Hi ${donorName}, someone wants your food listing.</p>
          <div style="background:#221c16;border:1px solid #3d3025;border-radius:12px;padding:20px;margin-bottom:20px">
            <div style="font-size:13px;color:#a08870;margin-bottom:4px">Food listing</div>
            <div style="font-size:17px;font-weight:600;margin-bottom:6px">${foodTitle}</div>
            <div style="font-size:13px;color:#a08870">📍 ${location}</div>
          </div>
          <div style="background:rgba(232,146,58,0.08);border:1px solid rgba(232,146,58,0.2);border-radius:12px;padding:20px;margin-bottom:20px">
            <div style="margin-bottom:8px"><strong style="color:#e8923a">From:</strong> <span style="color:#f5ede0">${recipientName}</span></div>
            <div style="margin-bottom:8px"><strong style="color:#e8923a">Quantity:</strong> <span style="color:#f5ede0">${quantity} serving(s)</span></div>
            ${message ? `<div><strong style="color:#e8923a">Message:</strong> <span style="color:#a08870;font-style:italic">"${message}"</span></div>` : ''}
          </div>
          <p style="color:#a08870;font-size:14px;margin-bottom:20px">Log in to approve or reject this request.</p>
          <a href="${APP_URL}/donor" style="display:inline-block;background:#e8923a;color:#1a1410;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600">View Request →</a>
        </div>
        <div style="padding:20px 32px;border-top:1px solid #3d3025;text-align:center">
          <p style="margin:0;font-size:12px;color:#8a7560">${APP_NAME} · Fighting food waste 🌱</p>
        </div>
      </div>
    `
  })
}

// Email to RECIPIENT when donor approves or rejects
export const sendApprovalNotificationToRecipient = async ({
  recipientEmail, recipientName, foodTitle, status, location, donorName, donorPhone
}) => {
  const approved = status === 'approved'
  await sendEmail({
    to: recipientEmail,
    subject: approved ? `✅ Your food request was approved!` : `Update on your food request`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#2e2519;border-radius:16px;overflow:hidden;border:1px solid #3d3025">
        <div style="background:${approved ? 'linear-gradient(135deg,#5a9a6a,#3a7a4a)' : 'linear-gradient(135deg,#6a4a4a,#4a3030)'};padding:32px;text-align:center">
          <div style="font-size:40px;margin-bottom:8px">${approved ? '✅' : '😔'}</div>
          <h1 style="margin:0;color:#fff;font-size:22px">${approved ? 'Request Approved!' : 'Request Update'}</h1>
        </div>
        <div style="padding:32px;color:#f5ede0">
          <p style="color:#a08870;margin:0 0 16px">Hi ${recipientName},</p>
          ${approved ? `
            <p style="margin:0 0 20px;line-height:1.7">Your request for <strong style="color:#e8923a">"${foodTitle}"</strong> has been approved by ${donorName}! 🎉</p>
            <div style="background:rgba(90,154,106,0.1);border:1px solid rgba(90,154,106,0.25);border-radius:12px;padding:20px;margin-bottom:20px">
              <div style="font-size:13px;color:#7ec98a;font-weight:600;margin-bottom:12px">PICKUP DETAILS</div>
              <div style="margin-bottom:8px;color:#f5ede0">📍 <strong>Location:</strong> ${location}</div>
              <div style="margin-bottom:8px;color:#f5ede0">👤 <strong>Donor:</strong> ${donorName}</div>
              <div style="color:#f5ede0">📞 <strong>Contact:</strong> ${donorPhone || 'Contact via platform'}</div>
            </div>
            <p style="color:#a08870;font-size:14px;margin-bottom:20px">Please contact the donor directly to arrange pickup.</p>
            <a href="${APP_URL}/recipient" style="display:inline-block;background:#5a9a6a;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600">View My Requests →</a>
          ` : `
            <p style="margin:0 0 20px;color:#a08870;line-height:1.7">Unfortunately your request for <strong style="color:#e8923a">"${foodTitle}"</strong> was not approved this time.</p>
            <p style="margin:0 0 20px;font-size:14px;color:#a08870">Don't be discouraged — browse other listings and try again!</p>
            <a href="${APP_URL}/browse" style="display:inline-block;background:#e8923a;color:#1a1410;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600">Browse Food →</a>
          `}
        </div>
        <div style="padding:20px 32px;border-top:1px solid #3d3025;text-align:center">
          <p style="margin:0;font-size:12px;color:#8a7560">${APP_NAME} · Fighting food waste 🌱</p>
        </div>
      </div>
    `
  })
}
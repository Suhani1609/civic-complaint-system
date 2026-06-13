import nodemailer from 'nodemailer';

// Create transporter — works with Gmail, Resend, or any SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST   || 'smtp.gmail.com',
    port:   parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Base HTML email template
const emailTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; margin: 0; padding: 0; }
    .container { max-width: 560px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; }
    .header { background: #7c3aed; padding: 32px 40px; text-align: center; }
    .header h1 { color: white; font-size: 20px; margin: 0; font-weight: 700; }
    .header p  { color: #ede9fe; font-size: 13px; margin: 6px 0 0; }
    .body { padding: 32px 40px; }
    .body p { color: #475569; font-size: 14px; line-height: 1.7; margin: 0 0 16px; }
    .highlight { background: #f5f3ff; border-left: 3px solid #7c3aed; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 16px 0; }
    .highlight p { color: #5b21b6; margin: 0; font-weight: 500; }
    .btn { display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 14px; margin: 8px 0; }
    .footer { padding: 20px 40px; background: #f8fafc; border-top: 1px solid #e2e8f0; }
    .footer p { color: #94a3b8; font-size: 12px; margin: 0; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏛️ CivicApp</h1>
      <p>Municipal Complaint Management</p>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} CivicApp · You're receiving this because you have an account with us.</p>
    </div>
  </div>
</body>
</html>
`;

// Send a generic email
export const sendEmail = async ({ to, subject, html }) => {
  // Skip if no SMTP config
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[Email skipped — no SMTP config] To: ${to} | Subject: ${subject}`);
    return;
  }

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from:    `"CivicApp" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html:    emailTemplate(html),
    });
    console.log(`✓ Email sent to ${to}`);
  } catch (err) {
    // Never crash the app if email fails
    console.error('Email send failed:', err.message);
  }
};

// Pre-built email templates
export const sendStatusUpdateEmail = async ({ to, name, complaintTitle, newStatus, complaintId }) => {
  const statusLabel = newStatus.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  await sendEmail({
    to,
    subject: `Your complaint status changed to ${statusLabel}`,
    html: `
      <p>Hi <strong>${name}</strong>,</p>
      <p>Your complaint has been updated:</p>
      <div class="highlight">
        <p>${complaintTitle}</p>
      </div>
      <p>New status: <strong>${statusLabel}</strong></p>
      <p>
        <a href="${process.env.CLIENT_URL}/complaints/${complaintId}" class="btn">
          View Complaint
        </a>
      </p>
      <p>You can track all updates in your dashboard.</p>
    `,
  });
};

export const sendWelcomeEmail = async ({ to, name }) => {
  await sendEmail({
    to,
    subject: 'Welcome to CivicApp!',
    html: `
      <p>Hi <strong>${name}</strong>,</p>
      <p>Welcome to CivicApp — your platform for reporting and tracking civic issues in your city.</p>
      <p>You can now:</p>
      <ul style="color: #475569; font-size: 14px; line-height: 2;">
        <li>File complaints about civic issues in your ward</li>
        <li>Upload photos and share your GPS location</li>
        <li>Track real-time status updates</li>
        <li>Rate the resolution quality</li>
      </ul>
      <p>
        <a href="${process.env.CLIENT_URL}/dashboard" class="btn">
          Go to Dashboard
        </a>
      </p>
    `,
  });
};
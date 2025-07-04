import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

// ✅ Use SMTP pool + keepalive
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SENDER_EMAIL,
    pass: process.env.EMAIL_PASS,
  },
  pool: true,            // ✅ use connection pool
  maxConnections: 5,     // max parallel connections
  maxMessages: 100,      // max messages per connection
  rateDelta: 1000,       // 1 second between messages (optional)
  rateLimit: 5,          // no more than 5 messages/second
});

const sendEmail = async ({ to, subject, html }: EmailOptions): Promise<void> => {
  const mailOptions = {
    from: process.env.SENDER_EMAIL,
    to,
    subject,
    html,
  };

  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    try {
      await transporter.sendMail(mailOptions);
      console.log(`✅ Email sent to ${to}`);
      return;
    } catch (error: any) {
      attempts++;
      console.error(`❌ Attempt ${attempts} failed:`, error?.message);

      // If auth error → break immediately
      if (error && error.responseCode === 535) {
        console.error('❌ Authentication failed. Check EMAIL_PASS.');
        throw new Error('Authentication failed.');
      }

      // If max attempts → throw
      if (attempts >= maxAttempts) {
        throw new Error('Failed to send email after retries.');
      }

      // Wait 1 second before retry
      await new Promise((res) => setTimeout(res, 1000));
    }
  }
};

export const sendVerificationEmail = async (
  email: string,
  token: string,
  purpose: string,
): Promise<void> => {
  const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5001';
  const link =
    purpose === 'register'
      ? `${API_BASE_URL}/api/auth/verify-email/${token}`
      : `${API_BASE_URL}/api/auth/verify-forgot-email/${token}`;

  const html = `
  <h2>Email Verification</h2>
  <p>Click the button below to verify your email:</p>
  <a href="${link}">
    <button style="padding:10px 20px;background-color:#007BFF;color:white;border:none;border-radius:4px;">Verify Email</button>
  </a>
  `;

  console.log('📧 Sending to:', email);
  await sendEmail({
    to: email,
    subject: 'Verify Your Email',
    html,
  });
};

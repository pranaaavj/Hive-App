import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SENDER_EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, html }: EmailOptions): Promise<void> => {
  const mailOptions = {
    from: process.env.SENDER_EMAIL,
    to,
    subject,
    html,
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Failed to send email:', error);
    throw new Error('Failed to send email');
  }
};

export const sendVerificationEmail = async (
  email: string,
  token: string,
  purpose: string,
): Promise<void> => {
  const link =
    purpose == 'register'
      ? `http://localhost:5001/api/user/verify-email/${token}`
      : `http://localhost:5001/api/user/verify-forgot-email/${token}`;
  const html = `
  <h2>Email Verification</h2>
  <p>Click the button below to verify your email:</p>
  <a href="${link}">
    <button style="padding:10px 20px;background-color:#007BFF;color:white;border:none;border-radius:4px;">Verify Email</button>
  </a>
`;

  console.log(email, token);
  await sendEmail({
    to: email,
    subject: 'Verify Your Email',
    html,
  });
};

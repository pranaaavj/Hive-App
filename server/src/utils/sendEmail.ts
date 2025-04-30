import sgmail from '@sendgrid/mail';

sgmail.setApiKey(process.env.SENDGRID_API_KEY as string);

interface EmailOptions {
  email: string;
  token: string;
  verificationUrl: string;
  type?: 'verify' | 'reset';
}

export const sendEmail = async ({ email, verificationUrl, type = 'verify' }: EmailOptions) => {
  const isReset = type === 'reset';

  const msg = {
    to: email,
    from: process.env.SENDER_EMAIL as string,
    subject: isReset ? 'Reset Your Password' : 'Verify Your Email',
    html: `
      <h2>${isReset ? 'Password Reset' : 'Email Verification'}</h2>
      <p>Click the link below to ${isReset ? 'reset your password' : 'verify your email'}:</p>
      <a href="${verificationUrl}">${verificationUrl}</a>
      <p>This link will expire in ${isReset ? '1 hour' : '3 minutes'}.</p>
    `,
  };

  try {
    await sgmail.send(msg);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

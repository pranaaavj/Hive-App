import sgmail from '@sendgrid/mail';

sgmail.setApiKey(process.env.SENDGRID_API_KEY as string);

interface EmailOptions {
  email: string;
  token: string;
}
export const sendEmail = async ({ email, token }: EmailOptions) => {
  const verificationLink = `${process.env.CLIENT_URL}/verify-email/${token}`;
  const msg = {
    to: email,
    from: process.env.SENDER_EMAIL as string,
    subject: 'Verify Your Email' ,
    html: `
      <h2>Email Verification</h2>
      <p>Click below to verify your email:</p>
      <a href="${verificationLink}">${verificationLink}</a>
    `,
  };

  try {
    await sgmail.send(msg);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

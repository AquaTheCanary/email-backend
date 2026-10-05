import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({ status: "Vercel API is live and ready!" });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email } = req.body || {};

  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, error: "Invalid email address." });
  }

  const appPassword = process.env.GMAIL_APP_PASSWORD;
  if (!appPassword) {
    return res.status(500).json({ success: false, error: "Missing GMAIL_APP_PASSWORD in Vercel Environment Variables." });
  }

  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'aquathecanary@gmail.com',
      pass: appPassword,
    },
  });

  try {
    await transporter.sendMail({
      from: '"Archie Sneddon" <aquathecanary@gmail.com>',
      to: email,
      subject: 'Your Setup Verification Code',
      text: `Hello,\n\nWelcome to the platform!\n\nTo verify your email, please enter the code below:\n${verificationCode}\n\nThank you for registering!\n\nKind regards,\nArchie Sneddon`,
    });

    return res.status(200).json({
      success: true,
      message: "Email sent successfully!",
      code: verificationCode,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: `SMTP Error: ${error.message}` });
  }
}

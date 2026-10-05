import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // 1. ALWAYS set CORS headers first so the browser never throws 'Failed to fetch'
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 2. Handle Browser Preflight (OPTIONS)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 3. Handle GET request health check
  if (req.method === 'GET') {
    return res.status(200).json({ status: "Vercel API is live and ready!" });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Safely parse body
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { email } = body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, error: "Invalid email address." });
    }

    const appPassword = process.env.GMAIL_APP_PASSWORD;
    if (!appPassword) {
      return res.status(500).json({ success: false, error: "Missing GMAIL_APP_PASSWORD environment variable in Vercel." });
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'aquathecanary@gmail.com',
        pass: appPassword,
      },
    });

    await transporter.sendMail({
      from: '"Archie Sneddon" <aquathecanary@gmail.com>',
      to: email,
      subject: 'Your Setup Verification Code',
      text: `Hello,\n\nWelcome to the platform!\n\nTo verify your email, enter this code: ${verificationCode}\n\nKind regards,\nArchie Sneddon`,
    });

    return res.status(200).json({
      success: true,
      message: "Email sent successfully!",
      code: verificationCode,
    });
  } catch (error) {
    // Return explicit JSON on failure so fetch() handles it gracefully
    return res.status(500).json({ success: false, error: `Server Error: ${error.message}` });
  }
}

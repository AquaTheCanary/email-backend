const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
    // Set CORS headers for GitHub Pages domain
    res.setHeader('Access-Control-Allow-Origin', 'https://aquathecanary.github.io');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle CORS preflight options check
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Friendly message if accessed via GET in browser
    if (req.method === 'GET') {
        return res.status(200).json({ status: "API Online", endpoint: "/api/send" });
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { email, code } = req.body;

    if (!email) {
        return res.status(400).json({ error: "Email is required" });
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD
        }
    });

    const passcode = code || Math.floor(100000 + Math.random() * 900000).toString();

    const mailOptions = {
        from: `"Platform Security" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: "Your Platform Verification Code",
        html: `
            <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 30px; border-radius: 12px; max-width: 480px; margin: auto;">
                <h2 style="color: #6366f1; margin-bottom: 12px;">Platform Security</h2>
                <p style="color: #94a3b8; font-size: 14px;">Your single-use verification code is:</p>
                <div style="font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #ffffff; background-color: #1e293b; padding: 16px; border-radius: 8px; text-align: center; margin: 20px 0;">
                    ${passcode}
                </div>
                <p style="color: #64748b; font-size: 12px;">If you did not request this email, you can safely ignore it.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return res.status(200).json({ success: true, message: "Verification code sent successfully" });
    } catch (error) {
        console.error("Nodemailer Error:", error);
        return res.status(500).json({ error: "Failed to send email", details: error.message });
    }
};

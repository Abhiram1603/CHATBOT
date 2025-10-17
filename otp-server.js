
import express from 'express';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
}));
app.use(express.json());

// MongoDB setup
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('OTP Server MongoDB connected'))
  .catch(err => console.error('OTP Server MongoDB error:', err));

// OTP Schema
const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: { expires: '5m' } } // Auto-delete after 5 mins
});
const Otp = mongoose.model('Otp', otpSchema);

// Mail setup
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: (process.env.SMTP_PORT === '465'), // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Generate OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// Send OTP
app.post('/api/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ success: false, message: "Email is required."});
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min

    await Otp.deleteMany({ email }); // Clear old OTPs for this email
    await Otp.create({ email, code: otp, expiresAt });

    await transporter.sendMail({
      from: `"VSAI App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your VSAI Verification Code",
      text: `Your one-time verification code is: ${otp}. It will expire in 5 minutes.`,
      html: `<b>Your one-time verification code is: ${otp}</b>. It will expire in 5 minutes.`
    });

    res.json({ success: true, message: "OTP sent successfully." });
  } catch (err) {
      console.error("Error sending OTP:", err);
      res.status(500).json({ success: false, message: "Failed to send OTP." });
  }
});

// Verify OTP
app.post('/api/verify-otp', async (req, res) => {
    try {
        const { email, code } = req.body;
        if (!email || !code) {
            return res.status(400).json({ success: false, message: "Email and OTP code are required." });
        }
        const record = await Otp.findOne({ email, code });

        if (!record) {
            return res.status(400).json({ success: false, message: "Invalid OTP code." });
        }
        
        if (record.expiresAt < new Date()) {
            return res.status(400).json({ success: false, message: "OTP has expired." });
        }

        await Otp.deleteMany({ email }); // Clean up the used OTP
        res.json({ success: true, message: "OTP verified successfully." });
    } catch (err) {
        console.error("Error verifying OTP:", err);
        res.status(500).json({ success: false, message: "Failed to verify OTP." });
    }
});

// Start server
const OTP_PORT = process.env.OTP_PORT || 5001;
app.listen(OTP_PORT, () => {
  console.log(`OTP Server running on port ${OTP_PORT}`);
});

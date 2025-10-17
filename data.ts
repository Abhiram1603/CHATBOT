// Run with: ts-node vsai-app.ts
// Requires: express, mongoose, nodemailer, cors, jsonwebtoken, dotenv, body-parser, fs

import express from 'express';
import mongoose, { Schema, Document } from 'mongoose';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import bodyParser from 'body-parser';

dotenv.config();
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Load metadata.json
const metadata = JSON.parse(fs.readFileSync('./metadata.json', 'utf-8'));

// MongoDB setup
const MONGO_URI = process.env.MONGO_URI || '';
mongoose.connect(MONGO_URI).then(() => console.log('✅ MongoDB connected'));

// Chat schema
interface IChat extends Document {
  email: string;
  message: string;
  response: string;
}
const ChatSchema = new Schema<IChat>(
  {
    email: { type: String, required: true },
    message: { type: String, required: true },
    response: { type: String, required: true },
  },
  { timestamps: true }
);
const Chat = mongoose.model<IChat>('Chat', ChatSchema);

// OTP store
interface OTPRecord {
  otp: string;
  expires: number;
}
const otpStore = new Map<string, OTPRecord>();

// Routes
app.get('/', (_, res) => {
  res.send(`
    <html>
      <head><title>${metadata.name}</title></head>
      <body>
        <h1>${metadata.name}</h1>
        <p>${metadata.description}</p>
        <textarea id="msg" rows="4" cols="50" placeholder="Ask something..."></textarea><br/>
        <button onclick="send()">Send</button>
        ${metadata.requestFramePermissions.includes('microphone') ? '<button onclick="startVoice()">🎤 Voice</button>' : ''}
        <div id="res"></div>
        <script>
          async function send() {
            const msg = document.getElementById('msg').value;
            const res = await fetch('/api/gemini', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ inputType: 'text', payload: { prompt: msg } })
            });
            const data = await res.json();
            document.getElementById('res').innerText = data.output || 'No response';
          }
          function startVoice() {
            const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
            recognition.onresult = (e) => {
              document.getElementById('msg').value = e.results[0][0].transcript;
            };
            recognition.start();
          }
        </script>
      </body>
    </html>
  `);
});

app.post('/api/send-otp', async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(email, { otp, expires: Date.now() + 5 * 60 * 1000 });

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.SMTP_EMAIL, pass: process.env.SMTP_PASS },
  });

  await transporter.sendMail({
    from: process.env.SMTP_EMAIL,
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP is ${otp}. It expires in 5 minutes.`,
  });

  res.json({ success: true });
});

app.post('/api/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore.get(email);
  if (!record || record.otp !== otp || Date.now() > record.expires) {
    return res.status(400).json({ error: 'Invalid or expired OTP' });
  }
  const token = jwt.sign({ email }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
  res.json({ token });
});

app.post('/api/google', (req, res) => {
  const { email, name } = req.body;
  const token = jwt.sign({ email, name }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
  res.json({ token });
});

app.post('/api/chat/save', async (req, res) => {
  const { email, message, response } = req
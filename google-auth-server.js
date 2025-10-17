
// Run with: node vsai-app.js
// Requires: express, mongoose, nodemailer, body-parser, cors, jwt, fs

const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
require('dotenv').config();

app.use(cors());
app.use(bodyParser.json());

// Load metadata.json
const metadata = JSON.parse(fs.readFileSync('./metadata.json', 'utf-8'));

// MongoDB setup
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const ChatSchema = new mongoose.Schema({
  email: String,
  message: String,
  response: String,
}, { timestamps: true });
const Chat = mongoose.model('Chat', ChatSchema);

// OTP store
const otpStore = new Map();

// Routes
app.get('/', (req, res) => {
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
  const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

app.post('/api/google', (req, res) => {
  const { email, name } = req.body;
  const token = jwt.sign({ email, name }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

app.post('/api/chat/save', async (req, res) => {
  const { email, message, response } = req.body;
  const chat = new Chat({ email, message, response });
  await chat.save();
  res.json({ success: true });
});

app.get('/api/chat/:email', async (req, res) => {
  const chats = await Chat.find({ email: req.params.email }).sort({ createdAt: -1 });
  res.json(chats);
});

app.post('/api/gemini', async (req, res) => {
  const { inputType, payload } = req.body;
  const response = await fetch(`https://gemini.googleapis.com/${inputType}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.GEMINI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  res.json(data);
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`VSAI2.0 running on port ${process.env.PORT || 5000}`);
});
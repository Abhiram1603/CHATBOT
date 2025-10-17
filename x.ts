import express from 'express';
import multer from 'multer';
import { createCanvas, loadImage } from 'canvas';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.json());
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;

// Image Generation (AI Placeholder)
app.post('/generate-image', async (req, res) => {
  const { prompt } = req.body;
  const imageId = uuidv4();
  const canvas = createCanvas(512, 512);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#000';
  ctx.font = '20px Arial';
  ctx.fillText(`AI Generated: ${prompt}`, 50, 100);

  const outPath = path.join(__dirname, 'public', `${imageId}.png`);
  const out = fs.createWriteStream(outPath);
  const stream = canvas.createPNGStream();
  stream.pipe(out);
  out.on('finish', () => res.json({ imageUrl: `/${imageId}.png` }));
});

// Image Editing
app.post('/edit-image', upload.single('image'), async (req, res) => {
  const { operation } = req.body;
  const imagePath = req.file.path;
  const image = await loadImage(imagePath);
  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext('2d');

  ctx.drawImage(image, 0, 0);

  if (operation === 'grayscale') {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < imageData.data.length; i += 4) {
      const avg = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
      imageData.data[i] = avg;
      imageData.data[i + 1] = avg;
      imageData.data[i + 2] = avg;
    }
    ctx.putImageData(imageData, 0, 0);
  }

  const editedId = uuidv4();
  const outPath = path.join(__dirname, 'public', `${editedId}.png`);
  const out = fs.createWriteStream(outPath);
  const stream = canvas.createPNGStream();
  stream.pipe(out);
  out.on('finish', () => res.json({ imageUrl: `/${editedId}.png` }));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
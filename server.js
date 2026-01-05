require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const path = require('path');
const { body, validationResult } = require('express-validator');
// 🟢 1. Import Nodemailer
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

// --- CONNECT TO MONGODB ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ DB Error:', err.message));

// --- SCHEMAS ---
const PresetSchema = new mongoose.Schema({
    name: String, desc: String, price: String, img: String, link: String,
    order: { type: Number, default: 0 },
    date: { type: Date, default: Date.now }
});
const Preset = mongoose.model('Preset', PresetSchema);

const MessageSchema = new mongoose.Schema({
    name: String, email: String, message: String,
    date: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', MessageSchema);

// --- MIDDLEWARE ---
app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://cdn.tailwindcss.com", "https://cdn.jsdelivr.net", "'unsafe-inline'"],
        scriptSrcAttr: ["'unsafe-inline'"],
        imgSrc: ["'self'", "https://*", "data:"], 
        styleSrc: ["'self'", "https://fonts.googleapis.com", "'unsafe-inline'"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        connectSrc: ["'self'"]
      }
    }
}));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public'))); 

// --- AUTH ---
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'sreeniii431') { 
      const token = jwt.sign({ username }, 'secret-key', { expiresIn: '24h' });
      return res.json({ token });
  }
  return res.status(401).json({ error: 'Invalid credentials' });
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token missing' });
  jwt.verify(token, 'secret-key', (err) => {
    if (err) return res.status(403).json({ error: 'Token invalid' });
    next();
  });
};

// --- ROUTES ---
app.get('/api/presets', async (req, res) => {
    const presets = await Preset.find().sort({ order: 1, date: -1 });
    res.json(presets.map(p => ({ id: p._id, ...p._doc })));
});

app.post('/api/presets', authenticateToken, async (req, res) => {
    const count = await Preset.countDocuments();
    const newPreset = await Preset.create({ ...req.body, order: count });
    res.json({ id: newPreset._id, ...newPreset._doc });
});

app.put('/api/presets/reorder', authenticateToken, async (req, res) => {
    const { order } = req.body;
    await Promise.all(order.map((id, index) => Preset.findByIdAndUpdate(id, { order: index })));
    res.json({ message: 'Reordered' });
});

app.put('/api/presets/:id', authenticateToken, async (req, res) => {
    await Preset.findByIdAndUpdate(req.params.id, req.body);
    res.json({ message: 'Updated' });
});

app.delete('/api/presets/:id', authenticateToken, async (req, res) => {
    await Preset.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
});

// 🟢 CONTACT ROUTE (Now Sends Email + Saves to DB)
app.post('/api/contact', [
    body('email').isEmail().withMessage('Invalid Email'),
    body('message').notEmpty().withMessage('Message is required')
], async (req, res) => {
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

    const { name, email, message } = req.body;

    try {
        // 1. Save to Database (Backup)
        await Message.create({ name, email, message });

        // 2. Configure Email Transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, // Gets from .env file
                pass: process.env.EMAIL_PASS  // Gets from .env file
            }
        });

        // 3. Send the Email
        await transporter.sendMail({
            from: `"${name}" <${email}>`, // Shows sender's name
            to: process.env.EMAIL_USER,    // Sends to YOU
            subject: `New Inquiry from ${name}`,
            text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
            html: `<h3>New Inquiry</h3><p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Message:</strong><br>${message}</p>`
        });

        console.log(`✅ Email sent regarding: ${email}`);
        res.json({ success: true, message: "Sent successfully!" });

    } catch (err) {
        console.error("❌ Error:", err);
        // Even if email fails, we tell user 'Saved' if DB worked, or Error if both failed
        res.status(500).json({ error: "Could not send message. Please try again." });
    }
});

// Serve Frontend
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
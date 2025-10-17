
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();
const app = express();
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
}));
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Main Server MongoDB connected'))
  .catch(err => console.error('Main Server MongoDB connection error:', err));

// Schemas
const messageSchema = new mongoose.Schema({
  id: { type: String, required: true },
  role: { type: String, required: true },
  text: { type: String, required: true },
  image: String,
  language: String,
  status: String,
  error: String
}, { _id: false });

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Not required for Google OAuth users
  phone: String,
  profilePicture: String,
  bio: String,
  preferredLanguage: String,
  theme: String,
  chatHistory: [messageSchema]
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const generateToken = (user) => {
    return jwt.sign({ id: user.id, email: user.email, name: user.name }, process.env.JWT_SECRET, {
        expiresIn: '24h',
    });
};

// Middleware to verify JWT
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authorization token required.' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Add user payload to request
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token.' });
    }
};


// Routes

// Register new user
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please provide name, email, and password.' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'An account with this email already exists.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const newUser = new User({
            id: new mongoose.Types.ObjectId().toString(),
            name,
            email,
            password: hashedPassword,
        });

        const savedUser = await newUser.save();
        const userResponse = { ...savedUser.toObject() };
        delete userResponse.password;

        res.status(201).json({
            message: 'User registered successfully',
            token: generateToken(savedUser),
            user: userResponse
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error during registration.', error: error.message });
    }
});

// Login user
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password.' });
        }

        const user = await User.findOne({ email });
        if (!user || !user.password) { // Check for password existence for email users
            return res.status(401).json({ message: 'Invalid credentials or user signed up with Google.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        
        const userResponse = { ...user.toObject() };
        delete userResponse.password;
        
        res.status(200).json({
            message: 'Login successful',
            token: generateToken(user),
            user: userResponse
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error during login.', error: error.message });
    }
});

// Google Login/Signup
app.post('/api/google-login', async (req, res) => {
    try {
        const { email, name } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email is required for Google login.' });
        }

        let user = await User.findOne({ email });

        if (!user) {
            // If user doesn't exist, create a new one without a password
            user = new User({
                id: new mongoose.Types.ObjectId().toString(),
                name,
                email,
            });
            await user.save();
        }

        const userResponse = { ...user.toObject() };
        delete userResponse.password;

        res.status(200).json({
            message: 'Google login successful',
            token: generateToken(user),
            user: userResponse
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error during Google login.', error: error.message });
    }
});


// Forgot Password
app.post('/api/forgot-password', async (req, res) => {
    try {
        const { email, newPassword } = req.body;
         if (!email || !newPassword) {
            return res.status(400).json({ message: 'Email and new password are required.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        const updatedUser = await User.findOneAndUpdate(
            { email },
            { password: hashedPassword },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found." });
        }
        
        res.status(200).json({ message: "Password reset successfully." });

    } catch (error) {
        res.status(500).json({ message: 'Server error during password reset.', error: error.message });
    }
});

// Get current user profile
app.get('/api/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findOne({ id: req.user.id }).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching user profile.' });
    }
});


// Update user
app.put('/api/user', async (req, res) => {
    try {
        const { email, ...updateData } = req.body;
        const user = await User.findOneAndUpdate({ email }, updateData, { new: true });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        const userResponse = { ...user.toObject() };
        delete userResponse.password;
        res.status(200).json({ message: "Profile updated successfully.", user: userResponse });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update user.', error: error.message });
    }
});

// Delete user
app.delete('/api/user', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOneAndDelete({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.status(200).json({ message: 'User deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete user.', error: error.message });
    }
});


// Chat history routes
app.get('/api/chat-history/:email', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ history: user.chatHistory || [] });
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve chat history.' });
    }
});

app.post('/api/chat-history', async (req, res) => {
    try {
        const { email, history } = req.body;
        await User.updateOne({ email }, { $set: { chatHistory: history } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: 'Failed to save chat history.' });
    }
});

app.delete('/api/chat-history/:email', async (req, res) => {
    try {
        await User.updateOne({ email: req.params.email }, { $set: { chatHistory: [] } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: 'Failed to clear chat history.' });
    }
});


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Main Server running on port ${PORT}`);
});

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Auth Middleware
app.use('/api', (req, res, next) => {
  // Allow auth and health endpoints
  if (req.path.startsWith('/auth') || req.path === '/health') {
    return next();
  }
  const token = req.headers.authorization;
  if (token === 'Bearer madarej_admin_token_valid') {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized' });
});

// Routes
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/groups',     require('./routes/groups'));
app.use('/api/students',   require('./routes/students'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/payments',   require('./routes/payments'));
app.use('/api/dashboard',  require('./routes/dashboard'));
app.use('/api/tasks',      require('./routes/tasks'));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// Start server immediately (don't block on DB)
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

// Connect to MongoDB with auto-retry
async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('❌ MONGO_URI not set in .env');
    return;
  }

  const options = {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    tls: true,
    family: 4, // force IPv4
  };

  let attempt = 0;
  while (true) {
    attempt++;
    try {
      await mongoose.connect(uri, options);
      console.log('✅ MongoDB connected');
      return;
    } catch (err) {
      const delay = Math.min(attempt * 3000, 30000); // up to 30s
      console.error(`❌ MongoDB connection failed (attempt ${attempt}): ${err.message}`);
      console.log(`⏳ Retrying in ${delay / 1000}s...`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

connectDB();

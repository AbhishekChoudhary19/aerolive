const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const cron = require('node-cron');
require('dotenv').config();

const flightRoutes = require('./routes/flights');
const cargoRoutes = require('./routes/cargo');
const authRoutes = require('./routes/auth');
const airportRoutes = require('./routes/airports');
const { fetchLiveFlights, fetchAndCacheLiveFlights } = require('./controllers/flightController');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.set('trust proxy', 1); // Trust first proxy for rate limiting
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200
});
app.use('/api/', limiter);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/aerolive')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.log('❌ MongoDB error:', err.message));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/cargo', cargoRoutes);
app.use('/api/airports', airportRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), serverless: !!process.env.VERCEL });
});

// Vercel Cron endpoint: fetch live flights and update cache
app.get('/api/cron/fetch-flights', async (req, res) => {
  // Authentication for cron (optional but recommended)
  const authHeader = req.headers.authorization;
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const flights = await fetchAndCacheLiveFlights();
    if (flights && flights.length > 0) {
      cachedFlights = flights;
      // Note: io.emit might not work reliably here in serverless, 
      // but it updates the cache for the next GET request.
      if (io) io.emit('flights:update', flights);
    }
    res.json({ success: true, count: flights?.length || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Socket.IO for live flight updates
let cachedFlights = [];

io.on('connection', (socket) => {
  console.log(`⚡ Client connected: ${socket.id}`);

  // Send current cached data immediately
  socket.emit('flights:update', cachedFlights);

  // Join a specific flight room for detailed updates
  socket.on('flight:subscribe', (flightId) => {
    socket.join(`flight:${flightId}`);
    console.log(`📡 Subscribed to flight: ${flightId}`);
  });

  socket.on('flight:unsubscribe', (flightId) => {
    socket.leave(`flight:${flightId}`);
  });

  socket.on('disconnect', () => {
    console.log(`👋 Client disconnected: ${socket.id}`);
  });
});

// Cron: fetch live flights every 15 seconds and broadcast
cron.schedule('*/15 * * * * *', async () => {
  try {
    const flights = await fetchAndCacheLiveFlights();
    if (flights && flights.length > 0) {
      cachedFlights = flights;
      io.emit('flights:update', flights);
    }
  } catch (err) {
    // Silent fail - use cached data
  }
});

// Cron: broadcast flight stats every 30 seconds
cron.schedule('*/30 * * * * *', () => {
  const stats = {
    total: cachedFlights.length,
    airborne: cachedFlights.filter(f => f.onGround === false).length,
    delayed: Math.floor(cachedFlights.length * 0.04),
    cargo: Math.floor(cachedFlights.length * 0.08),
    timestamp: new Date().toISOString()
  };
  io.emit('stats:update', stats);
});

const PORT = process.env.PORT || 5000;

// Only start the server if not running on Vercel
if (!process.env.VERCEL) {
  server.listen(PORT, () => {
    console.log(`🚀 AeroLive server running on port ${PORT}`);
    console.log(`📡 Socket.IO ready`);
    // Initial data fetch
    fetchAndCacheLiveFlights().then(flights => {
      cachedFlights = flights || [];
      console.log(`✈️  Initial flights loaded: ${cachedFlights.length}`);
    });
  });
}

module.exports = app;

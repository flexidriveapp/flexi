require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth');
const vehicleRoutes = require('./routes/vehicles');
const bookingRoutes = require('./routes/bookings');
const kycRoutes = require('./routes/kyc');
const hostRoutes = require('./routes/host');
const adminRoutes = require('./routes/admin');
const messageRoutes = require('./routes/messages');
const paymentRoutes = require('./routes/payments');
const reviewRoutes = require('./routes/reviews');
const notificationRoutes = require('./routes/notifications');
const { errorHandler } = require('./middleware/errorHandler');
const { setupSocket } = require('./socket');

const app = express();
const server = http.createServer(app);

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: [process.env.CLIENT_URL, process.env.ADMIN_URL],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});
setupSocket(io);
app.set('io', io);

// Middleware
app.use(helmet());
app.use(cors({
  origin: [process.env.CLIENT_URL, process.env.ADMIN_URL],
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'Flexi API', timestamp: new Date().toISOString() }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/host', hostRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);

// 404
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Flexi API running on port ${PORT}`);
});

module.exports = { app, server };

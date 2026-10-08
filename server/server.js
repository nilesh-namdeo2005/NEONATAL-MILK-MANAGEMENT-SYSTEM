import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import mongoose from 'mongoose';

import connectDB from './config/db.js';
import validateEnvironment from './config/validateEnvironment.js';
import errorHandler from './middleware/errorHandler.js';
import { startExpiryJob } from './jobs/expiryCheck.js';

// Import route files
import authRoutes from './routes/authRoutes.js';
import donorRoutes from './routes/donorRoutes.js';
import babyRoutes from './routes/babyRoutes.js';
import hospitalRoutes from './routes/hospitalRoutes.js';
import donationRoutes from './routes/donationRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import historyRoutes from './routes/historyRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();

// Apply middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}
app.use(mongoSanitize());

app.get('/api/health', (req, res) => {
  const databaseConnected = mongoose.connection.readyState === 1;
  res.status(databaseConnected ? 200 : 503).json({
    success: databaseConnected,
    message: databaseConnected ? 'API and database are ready' : 'Database is not connected'
  });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/babies', babyRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/admin', adminRoutes);

app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: 'API route not found' });
});

// Apply error handler last
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  validateEnvironment(process.env);
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
  startExpiryJob();
};

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exitCode = 1;
});

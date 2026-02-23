import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import formRoutes from './routes/formRoutes.js';
import assetRoutes from './routes/assetRoutes.js';
import waveformRoutes from './routes/waveformRoutes.js';
import trendRoutes from './routes/trendRoutes.js';
import sensorRoutes from './routes/sensorRoutes.js';

dotenv.config();

const app = express();

// ✅ CORS Configuration - Allow all frontend ports
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:3000',
    'http://localhost:3001',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Environment Variables
const PORT = process.env.PORT || 5003;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cloud-login-dashboard';

/// ✅ MongoDB Connection (Optional - Comment out if not needed)
const connectMongoDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.warn('⚠️ MongoDB not available - Running in demo mode');
    console.warn('   To use MongoDB, make sure mongod is running on port 27017');
  }
};

connectMongoDB();

// ✅ Health Check Route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// ✅ Auth Routes
app.use('/api/auth', authRoutes);

// ✅ User Routes - CRUD operations
app.use('/api/users', userRoutes);

// ✅ Form Builder Routes - Dynamic form system
app.use('/api/forms', formRoutes);

// ✅ Asset Routes - Asset record and field values
app.use('/api/assets', assetRoutes);

// ✅ Spectral Routes - Sensor waveform data processing
app.use('/api/spectral', waveformRoutes);
app.use('/api/spectral', sensorRoutes);
app.use('/api/spectral', trendRoutes);

// ✅ Dashboard Route (placeholder)
app.get('/api/dashboard', (req, res) => {
  // TODO: Implement actual dashboard data retrieval
  res.json({
    success: true,
    data: {
      totalAssets: 1250,
      activeDevices: 890,
      systemHealth: 98.5,
      recentAlerts: 12,
      assets: [
        {
          id: '1',
          name: 'Manufacturing Unit A',
          status: 'active',
          health: 95,
        },
        {
          id: '2',
          name: 'Manufacturing Unit B',
          status: 'active',
          health: 92,
        },
        {
          id: '3',
          name: 'Warehouse C',
          status: 'inactive',
          health: 45,
        },
      ],
    },
  });
});

// ✅ Error Handling Middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error('❌ Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: {
      message: err.message || 'Internal Server Error',
      code: err.code || 'INTERNAL_ERROR',
    },
  });
});

// ✅ 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found',
      code: 'NOT_FOUND',
    },
  });
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📡 CORS enabled for:`);
  console.log(`   - http://localhost:5173`);
  console.log(`   - http://localhost:5174`);
  console.log(`   - http://localhost:5175`);
  console.log(`   - http://localhost:3000`);
  console.log(`   - http://localhost:3001`);
});
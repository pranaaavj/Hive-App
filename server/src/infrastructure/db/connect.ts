// src/infrastructure/db/connect.ts
import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 0) { // 0 = disconnected
      const conn = await mongoose.connect(process.env.MONGO_URL!, {
        serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      });
      console.log(`✅ MongoDB connected: ${conn.connection.host}`);
      return conn;
    }
    console.log('Using existing MongoDB connection');
    return mongoose.connection;
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err);
    throw err; // Re-throw to be caught in index.ts
  }
};

export const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
};
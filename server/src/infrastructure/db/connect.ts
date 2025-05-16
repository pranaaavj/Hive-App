import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 0) { // 0 = disconnected
      const mongoUrl = process.env.MONGO_URI || 'mongodb://hive-app-mongo:27017/hive-app?replicaSet=rs0';
      console.log(`Attempting to connect to MongoDB at: ${mongoUrl}`);
      // Wait for MongoDB to be ready (optional, for replica set)
      for (let i = 0; i < 10; i++) {
        try {
          const conn = await mongoose.connect(mongoUrl, {
            serverSelectionTimeoutMS: 5000, // Timeout after 5s
          });
          console.log(`✅ MongoDB connected: ${conn.connection.host}`);
          return conn;
        } catch (err) {
          console.log(`Attempt ${i + 1}/10: MongoDB not ready, retrying in 2s...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      throw new Error('MongoDB connection failed after retries');
    }
    console.log('Using existing MongoDB connection');
    return mongoose.connection;
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err);
    throw err;
  }
};

export const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
};
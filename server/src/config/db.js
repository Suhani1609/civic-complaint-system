import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✓ MongoDB connected: ${conn.connection.host}`);

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠ MongoDB disconnected');
    });
  } catch (err) {
    console.error(`✗ MongoDB connection failed: ${err.message}`);
    process.exit(1);
  }
};
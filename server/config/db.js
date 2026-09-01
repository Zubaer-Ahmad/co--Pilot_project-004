import mongoose from 'mongoose';

export async function connectDatabase() {
  if (!process.env.MONGODB_URI) {
    console.log('Using demo memory store (set MONGODB_URI to connect MongoDB).');
    return;
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected.');
  } catch (error) {
    console.warn(`MongoDB unavailable, continuing with demo store: ${error.message}`);
  }
}

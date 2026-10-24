import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGO_URI ;
  // || 'mongodb://127.0.0.1:27017/blogcine'; // Default to local MongoDB if MONGO_URI is not set
  if (!uri) throw new Error('MONGO_URI is not defined in environment variables.');
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
}

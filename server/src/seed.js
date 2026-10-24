import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import User from './models/User.js';
import Post from './models/Post.js';
import Comment from './models/Comment.js';
import { seedPosts } from './seedData.js';

const { ADMIN_NAME = 'Admin', ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
const reset = process.argv.includes('--reset');

if (!ADMIN_EMAIL || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 10) {
  console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD (10+ characters) in server/.env before seeding.');
  process.exit(1);
}

await connectDB();

if (reset) {
  console.log('--reset: deleting all users, posts and comments.');
  await Promise.all([User.deleteMany({}), Post.deleteMany({}), Comment.deleteMany({})]);
}

let admin = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
if (!admin) {
  admin = await User.create({ name: ADMIN_NAME, email: ADMIN_EMAIL, password: ADMIN_PASSWORD, role: 'admin' });
  console.log(`Created admin ${admin.email}`);
} else {
  console.log(`Admin ${admin.email} already exists; password left unchanged.`);
}

if ((await Post.countDocuments()) === 0) {
  const base = Date.now();
  for (const [i, p] of seedPosts.entries()) {
    await Post.create({ ...p, author: admin._id, createdAt: new Date(base - i * 86400000 * 3) });
  }
  console.log(`Added ${seedPosts.length} sample articles.`);
} else {
  console.log('Posts already exist; skipped sample articles.');
}

await mongoose.disconnect();

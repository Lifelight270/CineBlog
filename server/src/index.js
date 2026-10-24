import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import postRoutes from './routes/posts.js';
import miscRoutes from './routes/misc.js';
import { notFound, errorHandler } from './middleware/error.js';
import User from './models/User.js';

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
  console.error('Refusing to start: set JWT_SECRET (16+ random characters) in server/.env');
  process.exit(1);
}

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '2mb' }));
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, limit: 600, standardHeaders: true }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 40 }));

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api', miscRoutes);

app.use(notFound);
app.use(errorHandler);

// Only the configured account with the configured password can be an admin.
async function ensureAdmin() {
  const { ADMIN_NAME = 'Admin', ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    await User.updateMany({ role: 'admin' }, { $set: { role: 'user' } });
    console.warn('ADMIN_EMAIL / ADMIN_PASSWORD not set in .env: all accounts remain regular users.');
    return;
  }
  if (ADMIN_PASSWORD.length < 10) {
    await User.updateMany({ role: 'admin' }, { $set: { role: 'user' } });
    console.warn('ADMIN_PASSWORD must be at least 10 characters: all accounts remain regular users.');
    return;
  }
  const adminEmail = ADMIN_EMAIL.trim().toLowerCase();
  let admin = await User.findOne({ email: adminEmail }).select('+password');
  if (!admin) {
    admin = await User.create({
      name: ADMIN_NAME,
      email: adminEmail,
      password: ADMIN_PASSWORD,
      role: 'admin',
    });
    console.log(`Admin account created for ${adminEmail}`);
  } else if (await admin.matchPassword(ADMIN_PASSWORD)) {
    if (admin.role !== 'admin') {
      admin.role = 'admin';
      await admin.save();
      console.log(`Configured account ${adminEmail} promoted to admin`);
    } else {
      console.log(`Admin account ready: ${adminEmail}`);
    }
  } else {
    if (admin.role !== 'user') {
      admin.role = 'user';
      await admin.save();
    }
    console.warn(`Configured account ${adminEmail} password does not match ADMIN_PASSWORD; it remains a regular user.`);
  }
  await User.updateMany({ email: { $ne: adminEmail }, role: 'admin' }, { $set: { role: 'user' } });
}

const port = process.env.PORT || 5000;
connectDB()
  .then(ensureAdmin)
  .then(() => app.listen(port, () => console.log(`API listening on http://localhost:${port}`)))
  .catch((err) => {
    console.error('Could not connect to MongoDB:', err.message);
    process.exit(1);
  });

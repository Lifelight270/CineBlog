import { Router } from 'express';
import User from '../models/User.js';
import { protect, signToken } from '../middleware/auth.js';
import { wrap } from '../middleware/error.js';

const router = Router();
const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email, bio: u.bio, role: u.role });

router.post(
  '/register',
  wrap(async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Name, email and password are required.');
    }
    if (password.length < 6) {
      res.status(400);
      throw new Error('Password needs at least 6 characters.');
    }
    if (await User.findOne({ email })) {
      res.status(409);
      throw new Error('An account with that email already exists.');
    }
    const user = await User.create({ name, email, password });
    res.status(201).json({ token: signToken(user._id), user: publicUser(user) });
  })
);

router.post(
  '/login',
  wrap(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password || ''))) {
      res.status(401);
      throw new Error('Email or password is incorrect.');
    }
    res.json({ token: signToken(user._id), user: publicUser(user) });
  })
);

router.get('/me', protect, (req, res) => res.json({ user: publicUser(req.user) }));

router.put(
  '/me',
  protect,
  wrap(async (req, res) => {
    const { name, bio } = req.body;
    if (name) req.user.name = name;
    if (bio !== undefined) req.user.bio = bio;
    await req.user.save();
    res.json({ user: publicUser(req.user) });
  })
);

export default router;

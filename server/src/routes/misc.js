import { Router } from 'express';
import Comment from '../models/Comment.js';
import Subscriber from '../models/Subscriber.js';
import AboutProfile from '../models/AboutProfile.js';
import { protect, requireAdmin } from '../middleware/auth.js';
import { wrap } from '../middleware/error.js';

const router = Router();
const MAX_ABOUT_PHOTO_BYTES = 300 * 1024;

router.get(
  '/about/profile',
  wrap(async (_req, res) => {
    const profile = await AboutProfile.findOne({ key: 'main' }).select('photo');
    res.json({ photo: profile?.photo || '' });
  })
);

router.put(
  '/about/profile',
  protect,
  requireAdmin,
  wrap(async (req, res) => {
    const photo = req.body.photo;
    const match = typeof photo === 'string' && photo.match(/^data:image\/jpeg;base64,([A-Za-z0-9+/]+={0,2})$/);
    if (!match) {
      res.status(400);
      throw new Error('Upload a valid JPEG profile photo.');
    }
    if (Buffer.from(match[1], 'base64').length > MAX_ABOUT_PHOTO_BYTES) {
      res.status(413);
      throw new Error('Profile photo must be 300 KB or smaller.');
    }
    const profile = await AboutProfile.findOneAndUpdate(
      { key: 'main' },
      { $set: { photo } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).select('photo');
    res.json({ photo: profile.photo });
  })
);

router.delete(
  '/about/profile',
  protect,
  requireAdmin,
  wrap(async (_req, res) => {
    await AboutProfile.findOneAndUpdate(
      { key: 'main' },
      { $set: { photo: '' } },
      { upsert: true, setDefaultsOnInsert: true }
    );
    res.json({ photo: '' });
  })
);

router.delete(
  '/comments/:id',
  protect,
  wrap(async (req, res) => {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      res.status(404);
      throw new Error('Comment not found.');
    }
    if (String(comment.author) !== String(req.user._id) && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('You can only delete your own comments.');
    }
    await comment.deleteOne();
    res.json({ message: 'Comment deleted.' });
  })
);

router.post(
  '/newsletter',
  wrap(async (req, res) => {
    const email = String(req.body.email || '').trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      res.status(400);
      throw new Error('Enter a valid email address.');
    }
    await Subscriber.updateOne({ email }, { email }, { upsert: true });
    res.status(201).json({ message: 'You are on the list.' });
  })
);

export default router;

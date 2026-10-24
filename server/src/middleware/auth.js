import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const secret = () => {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 16) throw new Error('JWT_SECRET must be set to a random string of at least 16 characters.');
  return s;
};

export const signToken = (id) => jwt.sign({ id }, secret(), { expiresIn: '7d' });

async function resolveUser(req) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return null;
  try {
    const { id } = jwt.verify(header.slice(7), secret());
    return await User.findById(id);
  } catch {
    return null;
  }
}

export async function protect(req, res, next) {
  const user = await resolveUser(req);
  if (!user) return res.status(401).json({ message: 'Please sign in to continue.' });
  req.user = user;
  next();
}

export async function optionalAuth(req, _res, next) {
  req.user = await resolveUser(req);
  next();
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Only the site admin can do that.' });
  }
  next();
}

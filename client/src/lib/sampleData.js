import { seedPosts } from './seedData';

const author = { _id: 'demo-author', name: 'Mira Okafor', bio: 'Designer who writes code, mostly at night.' };
const day = 86400000;

export const samplePosts = seedPosts.map((p, i) => ({
  ...p,
  _id: `sample-${i}`,
  coverImage: '',
  author,
  likeCount: 12 + i * 7,
  liked: false,
  readTime: Math.max(1, Math.round(p.content.split(/\s+/).length / 220)),
  createdAt: new Date(Date.now() - i * day * 3).toISOString(),
}));

export const sampleCategories = Object.entries(
  samplePosts.reduce((acc, p) => ({ ...acc, [p.category]: (acc[p.category] || 0) + 1 }), {})
).map(([name, count]) => ({ name, count }));

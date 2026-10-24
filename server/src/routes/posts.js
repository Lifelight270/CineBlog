import { Router } from 'express';
import slugify from 'slugify';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import { protect, optionalAuth, requireAdmin } from '../middleware/auth.js';
import { wrap } from '../middleware/error.js';

const router = Router();
const AUTHOR_FIELDS = 'name bio';

const shape = (post, userId) => {
  const o = post.toObject ? post.toObject() : post;
  const likes = o.likes || [];
  return {
    ...o,
    likes: undefined,
    likeCount: likes.length,
    liked: userId ? likes.some((id) => String(id) === String(userId)) : false,
  };
};

async function uniqueSlug(title, ignoreId) {
  const base = slugify(title, { lower: true, strict: true }) || 'post';
  let slug = base;
  let n = 1;
  // eslint-disable-next-line no-await-in-loop
  while (await Post.exists({ slug, _id: { $ne: ignoreId } })) slug = `${base}-${++n}`;
  return slug;
}

const parseTags = (tags) =>
  (Array.isArray(tags) ? tags : String(tags || '').split(','))
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 8);

const notFoundErr = (res, msg = 'Post not found.') => {
  res.status(404);
  return new Error(msg);
};
const canEdit = (post, user) =>
  String(post.author._id || post.author) === String(user._id) || user.role === 'admin';

// List with search, category, tag, pagination
router.get(
  '/',
  optionalAuth,
  wrap(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(24, parseInt(req.query.limit, 10) || 9);
    const filter = { published: true };
    if (req.query.category && req.query.category !== 'all') filter.category = req.query.category;
    if (req.query.tag) filter.tags = String(req.query.tag).toLowerCase();
    if (req.query.search) {
      const rx = new RegExp(String(req.query.search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ title: rx }, { excerpt: rx }, { tags: rx }];
    }
    const [total, posts] = await Promise.all([
      Post.countDocuments(filter),
      Post.find(filter)
        .select('-content')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('author', AUTHOR_FIELDS),
    ]);
    res.json({
      posts: posts.map((p) => shape(p, req.user?._id)),
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
      total,
    });
  })
);

router.get(
  '/featured',
  wrap(async (_req, res) => {
    let posts = await Post.find({ published: true, featured: true })
      .select('-content')
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('author', AUTHOR_FIELDS);
    if (posts.length < 3) {
      posts = await Post.find({ published: true })
        .select('-content')
        .sort({ views: -1, createdAt: -1 })
        .limit(3)
        .populate('author', AUTHOR_FIELDS);
    }
    res.json({ posts: posts.map((p) => shape(p)) });
  })
);

router.get(
  '/categories',
  wrap(async (_req, res) => {
    const rows = await Post.aggregate([
      { $match: { published: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.json({ categories: rows.map((r) => ({ name: r._id, count: r.count })) });
  })
);

router.get(
  '/mine',
  protect,
  requireAdmin,
  wrap(async (req, res) => {
    const posts = await Post.find({ author: req.user._id })
      .select('-content')
      .sort({ createdAt: -1 })
      .populate('author', AUTHOR_FIELDS);
    res.json({ posts: posts.map((p) => shape(p, req.user._id)) });
  })
);

router.get(
  '/id/:id',
  protect,
  requireAdmin,
  wrap(async (req, res) => {
    const post = await Post.findById(req.params.id).populate('author', AUTHOR_FIELDS);
    if (!post) throw notFoundErr(res);
    if (!canEdit(post, req.user)) {
      res.status(403);
      throw new Error('You can only edit your own posts.');
    }
    res.json({ post: shape(post, req.user._id) });
  })
);

router.get(
  '/:slug',
  optionalAuth,
  wrap(async (req, res) => {
    const post = await Post.findOneAndUpdate(
      { slug: req.params.slug },
      { $inc: { views: 1 } },
      { new: true }
    ).populate('author', AUTHOR_FIELDS);
    if (!post || (!post.published && !(req.user && canEdit(post, req.user)))) {
      throw notFoundErr(res, 'That post could not be found.');
    }
    res.json({ post: shape(post, req.user?._id) });
  })
);

router.post(
  '/',
  protect,
  requireAdmin,
  wrap(async (req, res) => {
    const { title, excerpt, content, coverImage, coverImageCredit, coverImageSource, category, tags, published } = req.body;
    if (!title || !excerpt || !content) {
      res.status(400);
      throw new Error('Title, excerpt and content are required.');
    }
    const post = await Post.create({
      title,
      excerpt,
      content,
      coverImage,
      coverImageCredit,
      coverImageSource,
      category: category || 'General',
      tags: parseTags(tags),
      published: published !== false,
      slug: await uniqueSlug(title),
      author: req.user._id,
    });
    res.status(201).json({ post });
  })
);

router.put(
  '/:id',
  protect,
  requireAdmin,
  wrap(async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (!post) throw notFoundErr(res);
    if (!canEdit(post, req.user)) {
      res.status(403);
      throw new Error('You can only edit your own posts.');
    }
    const { title, excerpt, content, coverImage, coverImageCredit, coverImageSource, category, tags, published } = req.body;
    if (title && title !== post.title) {
      post.title = title;
      post.slug = await uniqueSlug(title, post._id);
    }
    if (excerpt !== undefined) post.excerpt = excerpt;
    if (content !== undefined) post.content = content;
    if (coverImage !== undefined) post.coverImage = coverImage;
    if (coverImageCredit !== undefined) post.coverImageCredit = coverImageCredit;
    if (coverImageSource !== undefined) post.coverImageSource = coverImageSource;
    if (category) post.category = category;
    if (tags !== undefined) post.tags = parseTags(tags);
    if (published !== undefined) post.published = published;
    await post.save();
    res.json({ post });
  })
);

router.delete(
  '/:id',
  protect,
  requireAdmin,
  wrap(async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (!post) throw notFoundErr(res);
    if (!canEdit(post, req.user)) {
      res.status(403);
      throw new Error('You can only delete your own posts.');
    }
    await Promise.all([post.deleteOne(), Comment.deleteMany({ post: post._id })]);
    res.json({ message: 'Post deleted.' });
  })
);

router.post(
  '/:id/like',
  protect,
  wrap(async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (!post) throw notFoundErr(res);
    const uid = String(req.user._id);
    const has = post.likes.some((id) => String(id) === uid);
    post.likes = has ? post.likes.filter((id) => String(id) !== uid) : [...post.likes, req.user._id];
    await post.save();
    res.json({ liked: !has, likeCount: post.likes.length });
  })
);

router.get(
  '/:id/comments',
  wrap(async (req, res) => {
    const comments = await Comment.find({ post: req.params.id })
      .sort({ createdAt: -1 })
      .populate('author', 'name');
    res.json({ comments });
  })
);

router.post(
  '/:id/comments',
  protect,
  wrap(async (req, res) => {
    if (!req.body.body?.trim()) {
      res.status(400);
      throw new Error('Write something before posting.');
    }
    const comment = await Comment.create({
      post: req.params.id,
      author: req.user._id,
      body: req.body.body,
    });
    await comment.populate('author', 'name');
    res.status(201).json({ comment });
  })
);

export default router;

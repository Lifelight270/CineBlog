import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 140 },
    slug: { type: String, required: true, unique: true, index: true },
    excerpt: { type: String, required: true, trim: true, maxlength: 280 },
    content: { type: String, required: true },
    coverImage: { type: String, default: '' },
    coverImageCredit: { type: String, default: '' },
    coverImageSource: { type: String, default: '' },
    category: { type: String, required: true, trim: true, default: 'General' },
    tags: [{ type: String, trim: true, lowercase: true }],
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    views: { type: Number, default: 0 },
    readTime: { type: Number, default: 1 },
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

postSchema.pre('validate', function (next) {
  if (this.isModified('content')) {
    const words = this.content.trim().split(/\s+/).length;
    this.readTime = Math.max(1, Math.round(words / 220));
  }
  next();
});

export default mongoose.model('Post', postSchema);

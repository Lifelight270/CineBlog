import mongoose from 'mongoose';

const aboutProfileSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: 'main' },
    photo: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('AboutProfile', aboutProfileSchema);

import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
    },
    role: {
      type: String,
      enum: ['citizen', 'ward_officer', 'admin'],
      default: 'citizen',
    },
    ward: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ward',
    },
    avatar: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    googleId: String,
    refreshToken: String,
  },
  { timestamps: true }
);

export default mongoose.model('User', UserSchema);
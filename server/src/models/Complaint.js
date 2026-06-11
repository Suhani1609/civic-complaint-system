import mongoose from 'mongoose';

const TimelineSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  remark: {
    type: String,
    default: '',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const ComplaintSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['electricity', 'water', 'garbage', 'road', 'drainage', 'lights', 'gas', 'hygiene', 'other'],
    },
    status: {
      type: String,
      enum: ['pending', 'assigned', 'in_progress', 'resolved', 'closed', 'reopened'],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    ward: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ward',
      required: true,
    },
    location: {
      address: { type: String, default: '' },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
    images: {
      before: [{ type: String }], // Cloudinary URLs
      after:  [{ type: String }],
    },
    timeline: [TimelineSchema],
    feedback: {
      rating:      { type: Number, min: 1, max: 5 },
      comment:     { type: String, default: '' },
      submittedAt: { type: Date },
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// ── Indexes for fast queries ───────────────────────────────
ComplaintSchema.index({ ward: 1, status: 1 });
ComplaintSchema.index({ citizen: 1, createdAt: -1 });
ComplaintSchema.index({ assignedTo: 1, status: 1 });
ComplaintSchema.index({ title: 'text', description: 'text' });

export default mongoose.model('Complaint', ComplaintSchema);
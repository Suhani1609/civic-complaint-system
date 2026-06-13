import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'complaint_created',
        'status_changed',
        'complaint_assigned',
        'complaint_resolved',
        'complaint_reopened',
        'feedback_received',
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    relatedComplaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
    },
  },
  { timestamps: true }
);

// Fast queries for unread count
NotificationSchema.index({ recipient: 1, isRead: 1 });
NotificationSchema.index({ recipient: 1, createdAt: -1 });

export default mongoose.model('Notification', NotificationSchema);
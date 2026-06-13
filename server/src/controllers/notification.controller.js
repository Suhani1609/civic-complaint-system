import Notification from '../models/Notification.js';
import { asyncHandler } from '../utils/apiError.js';

// Get all notifications for current user
export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user.id })
    .populate('relatedComplaint', 'title status')
    .sort({ createdAt: -1 })
    .limit(30);

  res.json({ success: true, notifications });
});

// Get unread count only — used for the bell badge
export const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({
    recipient: req.user.id,
    isRead: false,
  });
  res.json({ success: true, count });
});

// Mark one notification as read
export const markAsRead = asyncHandler(async (req, res) => {
  await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user.id },
    { isRead: true }
  );
  res.json({ success: true });
});

// Mark all as read
export const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user.id, isRead: false },
    { isRead: true }
  );
  res.json({ success: true });
});

// Delete a notification
export const deleteNotification = asyncHandler(async (req, res) => {
  await Notification.findOneAndDelete({
    _id: req.params.id,
    recipient: req.user.id,
  });
  res.json({ success: true });
});
import Notification from '../models/Notification.js';

/**
 * Create a notification and store in DB.
 * Socket.io emit is added in Step 5.
 *
 * Usage:
 *   await createNotification({
 *     recipient: userId,
 *     type: 'status_changed',
 *     title: 'Complaint Updated',
 *     message: 'Your complaint is now In Progress',
 *     relatedComplaint: complaintId,
 *     io,        // socket.io instance
 *   });
 */
export const createNotification = async ({
  recipient,
  type,
  title,
  message,
  relatedComplaint,
  io,
}) => {
  try {
    const notification = await Notification.create({
      recipient,
      type,
      title,
      message,
      relatedComplaint,
    });

    // Emit real-time event if socket.io instance is passed
    if (io) {
      io.to(recipient.toString()).emit('new_notification', {
        _id:              notification._id,
        type,
        title,
        message,
        relatedComplaint,
        isRead:           false,
        createdAt:        notification.createdAt,
      });
    }

    return notification;
  } catch (err) {
    // Never crash the main flow if notification fails
    console.error('Notification creation failed:', err.message);
  }
};
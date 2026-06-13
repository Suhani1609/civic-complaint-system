import express from 'express';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllRead,
  deleteNotification,
} from '../controllers/notification.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(verifyToken);

router.get('/',           getNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/read-all', markAllRead);
router.patch('/:id/read', markAsRead);
router.delete('/:id',     deleteNotification);

export default router;
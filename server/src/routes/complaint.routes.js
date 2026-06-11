import express from 'express';
import {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateStatus,
  assignComplaint,
  reopenComplaint,
  submitFeedback,
  deleteComplaint,
  uploadAfterImage,
} from '../controllers/complaint.controller.js';
import { verifyToken, requireRole } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = express.Router();

// All complaint routes require login
router.use(verifyToken);

router.post(
  '/',
  requireRole('citizen'),
  upload.array('images', 3), // max 3 before-images
  createComplaint
);

router.get('/', getComplaints);
router.get('/:id', getComplaintById);

router.patch(
  '/:id/status',
  requireRole('ward_officer', 'admin'),
  updateStatus
);

router.post(
  '/:id/assign',
  requireRole('admin'),
  assignComplaint
);

router.post(
  '/:id/reopen',
  requireRole('citizen'),
  reopenComplaint
);

router.post(
  '/:id/feedback',
  requireRole('citizen'),
  submitFeedback
);

router.delete(
  '/:id',
  requireRole('citizen'),
  deleteComplaint
);

router.post(
  '/:id/after-image',
  requireRole('ward_officer'),
  upload.single('image'),
  uploadAfterImage
);

export default router;
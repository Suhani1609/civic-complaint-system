import express from 'express';
import {
  getWards,
  assignOfficerToWard,
  getWardStats,
} from '../controllers/ward.controller.js';
import { verifyToken, requireRole } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/',       verifyToken, getWards);
router.get('/stats',  verifyToken, requireRole('admin'), getWardStats);

router.patch(
  '/:id/officer',
  verifyToken,
  requireRole('admin'),
  assignOfficerToWard
);

export default router;
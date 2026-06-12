import express from 'express';
import {
  getOverview,
  getByCategory,
  getByStatus,
  getMonthly,
  getWardPerformance,
} from '../controllers/analytics.controller.js';
import { verifyToken, requireRole } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(verifyToken);
router.use(requireRole('admin'));

router.get('/overview',          getOverview);
router.get('/by-category',       getByCategory);
router.get('/by-status',         getByStatus);
router.get('/monthly',           getMonthly);
router.get('/ward-performance',  getWardPerformance);

export default router;
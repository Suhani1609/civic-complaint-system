import express from 'express';
import User from '../models/User.js';
import { asyncHandler } from '../utils/apiError.js';
import { verifyToken, requireRole } from '../middleware/auth.middleware.js';

const router = express.Router();

// Get all users — admin only
router.get('/', verifyToken, requireRole('admin'),
  asyncHandler(async (req, res) => {
    const { role } = req.query;
    const filter = role ? { role } : {};
    const users = await User.find(filter).select('-password -refreshToken');
    res.json({ success: true, users });
  })
);

export default router;
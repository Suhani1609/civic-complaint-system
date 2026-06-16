import express from 'express';
import User from '../models/User.js';
import Ward from '../models/Ward.js';
import { ApiError, asyncHandler } from '../utils/apiError.js';
import { verifyToken, requireRole } from '../middleware/auth.middleware.js';

const router = express.Router();

// Get all users — filter by role — admin only
router.get('/', verifyToken, requireRole('admin'),
  asyncHandler(async (req, res) => {
    const { role } = req.query;
    const filter = role ? { role } : {};
    const users = await User.find(filter)
      .select('-password -refreshToken')
      .populate('ward', 'wardName wardNumber')
      .sort({ createdAt: -1 });
    res.json({ success: true, users });
  })
);

// Get officers with their complaint stats — admin only
router.get('/officers/stats', verifyToken, requireRole('admin'),
  asyncHandler(async (req, res) => {
    const Complaint = (await import('../models/Complaint.js')).default;

    const officers = await User.find({ role: 'ward_officer' })
      .select('-password -refreshToken')
      .populate('ward', 'wardName wardNumber');

    const stats = await Complaint.aggregate([
      { $match: { isDeleted: false, assignedTo: { $ne: null } } },
      {
        $group: {
          _id:      '$assignedTo',
          total:    { $sum: 1 },
          resolved: { $sum: { $cond: [{ $in: ['$status', ['resolved', 'closed']] }, 1, 0] } },
          pending:  { $sum: { $cond: [{ $in: ['$status', ['pending', 'assigned', 'in_progress']] }, 1, 0] } },
        },
      },
    ]);

    const ratings = await Complaint.aggregate([
      { $match: { isDeleted: false, 'feedback.rating': { $exists: true } } },
      {
        $group: {
          _id: '$assignedTo',
          avgRating: { $avg: '$feedback.rating' },
          count:     { $sum: 1 },
        },
      },
    ]);

    const statsMap   = {};
    stats.forEach(s => { statsMap[s._id.toString()] = s; });

    const ratingsMap = {};
    ratings.forEach(r => { ratingsMap[r._id.toString()] = r; });

    const result = officers.map(o => {
      const s = statsMap[o._id.toString()]   || { total: 0, resolved: 0, pending: 0 };
      const r = ratingsMap[o._id.toString()] || { avgRating: null, count: 0 };
      return {
        _id:        o._id,
        name:       o.name,
        email:      o.email,
        avatar:     o.avatar,
        isActive:   o.isActive,
        ward:       o.ward,
        createdAt:  o.createdAt,
        total:      s.total,
        resolved:   s.resolved,
        pending:    s.pending,
        avgRating:  r.avgRating ? Math.round(r.avgRating * 10) / 10 : null,
        ratingCount: r.count,
      };
    });

    res.json({ success: true, officers: result });
  })
);

// Create a new officer — admin only
router.post('/officers', verifyToken, requireRole('admin'),
  asyncHandler(async (req, res) => {
    const { name, email, password, wardId } = req.body;

    if (!name || !email || !password) {
      throw new ApiError(400, 'Name, email and password are required');
    }

    const existing = await User.findOne({ email });
    if (existing) {
      throw new ApiError(409, 'Email already registered');
    }

    const bcrypt = (await import('bcryptjs')).default;
    const hashedPassword = await bcrypt.hash(password, 12);

    const officer = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'ward_officer',
      ward: wardId || null,
    });

    // If a ward was assigned, update the ward's assignedOfficer too
    if (wardId) {
      await Ward.findByIdAndUpdate(wardId, { assignedOfficer: officer._id });
    }

    res.status(201).json({
      success: true,
      message: 'Officer created successfully',
      officer: {
        _id:   officer._id,
        name:  officer.name,
        email: officer.email,
        role:  officer.role,
        ward:  officer.ward,
      },
    });
  })
);

// Deactivate / reactivate an officer — admin only
router.patch('/:id/toggle-active', verifyToken, requireRole('admin'),
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) throw new ApiError(404, 'User not found');

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'}`,
      user: { _id: user._id, isActive: user.isActive },
    });
  })
);

// Reassign officer's ward — admin only
router.patch('/:id/ward', verifyToken, requireRole('admin'),
  asyncHandler(async (req, res) => {
    const { wardId } = req.body;
    const officer = await User.findById(req.params.id);

    if (!officer || officer.role !== 'ward_officer') {
      throw new ApiError(404, 'Officer not found');
    }

    // Remove officer from their old ward
    if (officer.ward) {
      await Ward.findByIdAndUpdate(officer.ward, { assignedOfficer: null });
    }

    officer.ward = wardId || null;
    await officer.save();

    // Assign officer to new ward
    if (wardId) {
      await Ward.findByIdAndUpdate(wardId, { assignedOfficer: officer._id });
    }

    res.json({ success: true, message: 'Ward reassigned' });
  })
);

export default router;
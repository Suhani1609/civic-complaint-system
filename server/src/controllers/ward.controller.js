import Ward from '../models/Ward.js';
import User from '../models/User.js';
import { ApiError, asyncHandler } from '../utils/apiError.js';

// Get all wards — used in complaint form dropdown and admin page
export const getWards = asyncHandler(async (req, res) => {
  const wards = await Ward.find()
    .populate('assignedOfficer', 'name email')
    .sort({ wardNumber: 1 });

  res.json({ success: true, wards });
});

// Assign or change officer for a ward — admin only
export const assignOfficerToWard = asyncHandler(async (req, res) => {
  const { officerId } = req.body;
  const ward = await Ward.findById(req.params.id);

  if (!ward) throw new ApiError(404, 'Ward not found');

  if (officerId) {
    const officer = await User.findById(officerId);
    if (!officer || officer.role !== 'ward_officer') {
      throw new ApiError(400, 'Invalid officer ID');
    }

    // Update the officer's ward field too — so they see complaints from this ward
    officer.ward = ward._id;
    await officer.save();

    ward.assignedOfficer = officerId;
  } else {
    // Unassign
    ward.assignedOfficer = null;
  }

  await ward.save();
  await ward.populate('assignedOfficer', 'name email');

  res.json({ success: true, message: 'Ward updated', ward });
});

// Get ward statistics — complaints count per ward
export const getWardStats = asyncHandler(async (req, res) => {
  const Complaint = (await import('../models/Complaint.js')).default;

  const wards = await Ward.find()
    .populate('assignedOfficer', 'name email')
    .sort({ wardNumber: 1 });

  const stats = await Complaint.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: '$ward',
        total:    { $sum: 1 },
        pending:  { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
        resolved: { $sum: { $cond: [{ $in: ['$status', ['resolved', 'closed']] }, 1, 0] } },
      },
    },
  ]);

  const statsMap = {};
  stats.forEach(s => { statsMap[s._id.toString()] = s; });

  const result = wards.map(w => {
    const s = statsMap[w._id.toString()] || { total: 0, pending: 0, resolved: 0 };
    return {
      _id:            w._id,
      wardName:       w.wardName,
      wardNumber:     w.wardNumber,
      city:           w.city,
      assignedOfficer: w.assignedOfficer,
      total:          s.total,
      pending:        s.pending,
      resolved:       s.resolved,
      resolutionRate: s.total > 0 ? Math.round((s.resolved / s.total) * 100) : 0,
    };
  });

  res.json({ success: true, wards: result });
});
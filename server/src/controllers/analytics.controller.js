import Complaint from '../models/Complaint.js';
import User from '../models/User.js';
import Ward from '../models/Ward.js';
import { asyncHandler } from '../utils/apiError.js';

export const getOverview = asyncHandler(async (req, res) => {
  const [
    total, pending, assigned,
    inProgress, resolved, closed,
    totalUsers, totalWards,
  ] = await Promise.all([
    Complaint.countDocuments({ isDeleted: false }),
    Complaint.countDocuments({ status: 'pending',     isDeleted: false }),
    Complaint.countDocuments({ status: 'assigned',    isDeleted: false }),
    Complaint.countDocuments({ status: 'in_progress', isDeleted: false }),
    Complaint.countDocuments({ status: 'resolved',    isDeleted: false }),
    Complaint.countDocuments({ status: 'closed',      isDeleted: false }),
    User.countDocuments({ role: 'citizen' }),
    Ward.countDocuments(),
  ]);

  res.json({
    success: true,
    data: { total, pending, assigned, inProgress, resolved, closed, totalUsers, totalWards },
  });
});

export const getByCategory = asyncHandler(async (req, res) => {
  const data = await Complaint.aggregate([
    { $match: { isDeleted: false } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  res.json({
    success: true,
    data: data.map(d => ({ category: d._id, count: d.count })),
  });
});

export const getByStatus = asyncHandler(async (req, res) => {
  const data = await Complaint.aggregate([
    { $match: { isDeleted: false } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  res.json({
    success: true,
    data: data.map(d => ({ status: d._id, count: d.count })),
  });
});

export const getMonthly = asyncHandler(async (req, res) => {
  const data = await Complaint.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: {
          year:  { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    { $limit: 12 },
  ]);

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  res.json({
    success: true,
    data: data.map(d => ({
      month: `${months[d._id.month - 1]} ${d._id.year}`,
      count: d.count,
    })),
  });
});

export const getWardPerformance = asyncHandler(async (req, res) => {
  const data = await Complaint.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id:      '$ward',
        total:    { $sum: 1 },
        resolved: { $sum: { $cond: [{ $in: ['$status', ['resolved', 'closed']] }, 1, 0] } },
        pending:  { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
      },
    },
    {
      $lookup: {
        from:         'wards',
        localField:   '_id',
        foreignField: '_id',
        as:           'ward',
      },
    },
    { $unwind: '$ward' },
    { $sort: { resolved: -1 } },
  ]);

  res.json({
    success: true,
    data: data.map(d => ({
      wardName:   d.ward.wardName,
      wardNumber: d.ward.wardNumber,
      total:      d.total,
      resolved:   d.resolved,
      pending:    d.pending,
      rate:       d.total > 0 ? Math.round((d.resolved / d.total) * 100) : 0,
    })),
  });
});
import Ward from '../models/Ward.js';
import { asyncHandler } from '../utils/apiError.js';

// Get all wards — used in complaint form dropdown
export const getWards = asyncHandler(async (req, res) => {
  const wards = await Ward.find()
    .populate('assignedOfficer', 'name email')
    .sort({ wardNumber: 1 });

  res.json({ success: true, wards });
});
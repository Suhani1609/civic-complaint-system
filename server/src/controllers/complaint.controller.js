import Complaint from '../models/Complaint.js';
import Ward from '../models/Ward.js';
import { ApiError, asyncHandler } from '../utils/apiError.js';
import { uploadToCloudinary } from '../config/cloudinary.js';
import { createNotification } from '../utils/notify.js';

// ── Helper: push a timeline entry ─────────────────────────
const pushTimeline = (complaint, action, user, remark = '') => {
  complaint.timeline.push({
    action,
    performedBy: user.id,
    role: user.role,
    remark,
    timestamp: new Date(),
  });
};

// ── CREATE COMPLAINT ──────────────────────────────────────
export const createComplaint = asyncHandler(async (req, res) => {
  const { title, description, category, priority, wardId, address, lat, lng } = req.body;

  if (!title || !description || !category || !wardId) {
    throw new ApiError(400, 'Title, description, category and ward are required');
  }

  // Verify ward exists
  const ward = await Ward.findById(wardId);
  if (!ward) throw new ApiError(404, 'Ward not found');

  // Upload before-images to Cloudinary if provided
  const beforeImages = [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const url = await uploadToCloudinary(file.buffer, 'civic-complaints/before');
      beforeImages.push(url);
    }
  }

  // Create the complaint
  const complaint = await Complaint.create({
    title,
    description,
    category,
    priority: priority || 'medium',
    citizen: req.user.id,
    ward: wardId,
    location: {
      address: address || '',
      coordinates: {
        lat: lat ? parseFloat(lat) : undefined,
        lng: lng ? parseFloat(lng) : undefined,
      },
    },
    images: { before: beforeImages, after: [] },
  });

  // Push first timeline entry
  pushTimeline(complaint, 'Complaint filed by citizen', req.user);
  await complaint.save();

  const io = req.app.get('io');

  // If ward has an assigned officer, notify them
  if (ward.assignedOfficer) {
    await createNotification({
      recipient:        ward.assignedOfficer,
      type:             'complaint_created',
      title:            'New Complaint Filed',
      message:          `A new ${complaint.category} complaint has been filed in your ward: "${complaint.title}"`,
      relatedComplaint: complaint._id,
      io,
    });
  }

  // Populate for response
  await complaint.populate([
    { path: 'citizen', select: 'name email avatar' },
    { path: 'ward',    select: 'wardName wardNumber' },
  ]);

  res.status(201).json({ success: true, complaint });
});

// ── GET ALL COMPLAINTS (with filters + pagination) ─────────
export const getComplaints = asyncHandler(async (req, res) => {
  const {
    status, category, priority, ward,
    search, page = 1, limit = 10,
  } = req.query;

  // Build filter object
  const filter = { isDeleted: false };

  // Role-based filtering
  if (req.user.role === 'citizen') {
    filter.citizen = req.user.id;
  } else if (req.user.role === 'ward_officer') {
    filter.ward = req.user.ward;
  }
  // Admin sees everything

  if (status)   filter.status   = status;
  if (category) filter.category = category;
  if (priority) filter.priority = priority;
  if (ward && req.user.role === 'admin') filter.ward = ward;

  // Text search
  if (search) {
    filter.$text = { $search: search };
  }

  const skip  = (parseInt(page) - 1) * parseInt(limit);
  const total = await Complaint.countDocuments(filter);

  const complaints = await Complaint.find(filter)
    .populate('citizen',    'name email avatar')
    .populate('assignedTo', 'name email')
    .populate('ward',       'wardName wardNumber')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.json({
    success: true,
    complaints,
    pagination: {
      total,
      page:       parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      hasNext:    parseInt(page) < Math.ceil(total / parseInt(limit)),
    },
  });
});

// ── GET SINGLE COMPLAINT ───────────────────────────────────
export const getComplaintById = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id)
    .populate('citizen',               'name email avatar')
    .populate('assignedTo',            'name email')
    .populate('ward',                  'wardName wardNumber')
    .populate('timeline.performedBy',  'name role');

  if (!complaint || complaint.isDeleted) {
    throw new ApiError(404, 'Complaint not found');
  }

  // Citizens can only view their own complaints
  if (
    req.user.role === 'citizen' &&
    complaint.citizen._id.toString() !== req.user.id
  ) {
    throw new ApiError(403, 'Access denied');
  }

  res.json({ success: true, complaint });
});

// ── UPDATE STATUS ──────────────────────────────────────────
export const updateStatus = asyncHandler(async (req, res) => {
  const { status, remark } = req.body;

  if (!status) throw new ApiError(400, 'Status is required');

  const complaint = await Complaint.findById(req.params.id);
  if (!complaint || complaint.isDeleted) {
    throw new ApiError(404, 'Complaint not found');
  }

  // Only the assigned officer or admin can update status
  if (req.user.role === 'ward_officer') {
    if (!complaint.assignedTo || complaint.assignedTo.toString() !== req.user.id) {
      throw new ApiError(403, 'You are not assigned to this complaint');
    }
  }

  // Validate status transition
  const allowed = {
    pending:     ['assigned'],
    assigned:    ['in_progress'],
    in_progress: ['resolved'],
    resolved:    ['closed'],
    reopened:    ['in_progress'],
  };

  if (allowed[complaint.status] && !allowed[complaint.status].includes(status)) {
    throw new ApiError(400, `Cannot change status from ${complaint.status} to ${status}`);
  }

  complaint.status = status;
  pushTimeline(
    complaint,
    `Status changed to ${status}`,
    req.user,
    remark || ''
  );
  await complaint.save();

  const io = req.app.get('io');

  // Notify the citizen about the status change
  await createNotification({
    recipient:        complaint.citizen,
    type:             'status_changed',
    title:            'Complaint Status Updated',
    message:          `Your complaint "${complaint.title}" is now ${status.replace('_', ' ')}`,
    relatedComplaint: complaint._id,
    io,
  });

  res.json({ success: true, message: 'Status updated', complaint });
});

// ── ASSIGN COMPLAINT TO OFFICER ────────────────────────────
export const assignComplaint = asyncHandler(async (req, res) => {
  const { officerId } = req.body;
  if (!officerId) throw new ApiError(400, 'Officer ID is required');

  const complaint = await Complaint.findById(req.params.id);
  if (!complaint || complaint.isDeleted) {
    throw new ApiError(404, 'Complaint not found');
  }

  complaint.assignedTo = officerId;
  complaint.status     = 'assigned';
  pushTimeline(complaint, 'Complaint assigned to officer', req.user);
  await complaint.save();

  const io = req.app.get('io');

  // Notify the officer who was assigned
  await createNotification({
    recipient:        officerId,
    type:             'complaint_assigned',
    title:            'Complaint Assigned to You',
    message:          `You have been assigned complaint: "${complaint.title}"`,
    relatedComplaint: complaint._id,
    io,
  });

  // Also notify the citizen
  await createNotification({
    recipient:        complaint.citizen,
    type:             'complaint_assigned',
    title:            'Complaint Assigned',
    message:          `Your complaint "${complaint.title}" has been assigned to an officer`,
    relatedComplaint: complaint._id,
    io,
  });

  res.json({ success: true, message: 'Complaint assigned', complaint });
});

// ── REOPEN COMPLAINT ───────────────────────────────────────
export const reopenComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint || complaint.isDeleted) {
    throw new ApiError(404, 'Complaint not found');
  }

  // Only the citizen who filed it can reopen
  if (complaint.citizen.toString() !== req.user.id) {
    throw new ApiError(403, 'Only the complaint owner can reopen it');
  }

  if (complaint.status !== 'resolved') {
    throw new ApiError(400, 'Only resolved complaints can be reopened');
  }

  complaint.status = 'reopened';
  pushTimeline(complaint, 'Complaint reopened by citizen', req.user, req.body.remark || '');
  await complaint.save();

  res.json({ success: true, message: 'Complaint reopened', complaint });
});

// ── SUBMIT FEEDBACK ────────────────────────────────────────
export const submitFeedback = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    throw new ApiError(400, 'Rating must be between 1 and 5');
  }

  const complaint = await Complaint.findById(req.params.id);
  if (!complaint || complaint.isDeleted) {
    throw new ApiError(404, 'Complaint not found');
  }

  if (complaint.citizen.toString() !== req.user.id) {
    throw new ApiError(403, 'Only the complaint owner can submit feedback');
  }

  if (complaint.status !== 'resolved' && complaint.status !== 'closed') {
    throw new ApiError(400, 'Feedback can only be submitted after resolution');
  }

  if (complaint.feedback?.rating) {
    throw new ApiError(400, 'Feedback already submitted');
  }

  complaint.feedback = { rating, comment: comment || '', submittedAt: new Date() };
  pushTimeline(complaint, `Citizen gave ${rating}★ feedback`, req.user);
  await complaint.save();

  res.json({ success: true, message: 'Feedback submitted' });
});

// ── DELETE COMPLAINT (soft) ────────────────────────────────
export const deleteComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint || complaint.isDeleted) {
    throw new ApiError(404, 'Complaint not found');
  }

  if (complaint.citizen.toString() !== req.user.id) {
    throw new ApiError(403, 'Access denied');
  }

  // Can only delete if still pending (not yet assigned)
  if (complaint.status !== 'pending') {
    throw new ApiError(400, 'Cannot delete a complaint that is already being processed');
  }

  complaint.isDeleted = true;
  await complaint.save();

  res.json({ success: true, message: 'Complaint deleted' });
});

// ── UPLOAD RESOLUTION IMAGE (officer) ─────────────────────
export const uploadAfterImage = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint || complaint.isDeleted) {
    throw new ApiError(404, 'Complaint not found');
  }

  if (!req.file) throw new ApiError(400, 'Image is required');

  const url = await uploadToCloudinary(req.file.buffer, 'civic-complaints/after');
  complaint.images.after.push(url);
  pushTimeline(complaint, 'Resolution image uploaded by officer', req.user);
  await complaint.save();

  res.json({ success: true, message: 'Image uploaded', imageUrl: url });
});
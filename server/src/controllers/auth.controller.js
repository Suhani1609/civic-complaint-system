import User from '../models/User.js';
import { ApiError, asyncHandler } from '../utils/apiError.js';
import {
  generateAccessToken,
  generateRefreshToken,
  sendRefreshCookie,
} from '../utils/generateTokens.js';
import jwt from 'jsonwebtoken';

// ── SIGNUP ────────────────────────────────────────────────
export const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Basic validation
  if (!name || !email || !password) {
    throw new ApiError(400, 'Name, email and password are required');
  }

  // Check if user already exists
  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(409, 'Email already registered');
  }

  // Create user — password is hashed by the pre-save hook in the model
  const user = await User.create({ name, email, password });

  // Generate tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Save refresh token to DB
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  // Send refresh token as cookie, access token in response body
  sendRefreshCookie(res, refreshToken);

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    accessToken,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      ward: user.ward,
    },
  });
});

// ── LOGIN ─────────────────────────────────────────────────
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  // Find user — include password field (excluded by default)
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'Your account has been deactivated');
  }

  // Compare password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Generate tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Save new refresh token to DB
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  sendRefreshCookie(res, refreshToken);

  res.json({
    success: true,
    message: 'Logged in successfully',
    accessToken,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      ward: user.ward,
    },
  });
});

// ── REFRESH TOKEN ─────────────────────────────────────────
// This is the route App.jsx calls on every page load
export const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    throw new ApiError(401, 'No refresh token');
  }

  // Verify the refresh token
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  // Find user and make sure token matches what's in DB
  const user = await User.findById(decoded.id);
  if (!user || user.refreshToken !== token) {
    throw new ApiError(401, 'Refresh token mismatch');
  }

  // Issue new tokens (token rotation — old token replaced)
  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  user.refreshToken = newRefreshToken;
  await user.save({ validateBeforeSave: false });

  sendRefreshCookie(res, newRefreshToken);

  res.json({
    success: true,
    accessToken: newAccessToken,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      ward: user.ward,
    },
  });
});

// ── LOGOUT ────────────────────────────────────────────────
export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;

  if (token) {
    // Clear refresh token from DB
    await User.findOneAndUpdate(
      { refreshToken: token },
      { refreshToken: null }
    );
  }

  // Clear the cookie
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });

  res.json({ success: true, message: 'Logged out successfully' });
});

// ── GET CURRENT USER ──────────────────────────────────────
export const getMe = asyncHandler(async (req, res) => {
  // req.user is attached by verifyToken middleware
  const user = await User.findById(req.user.id).populate('ward', 'wardName wardNumber');
  if (!user) throw new ApiError(404, 'User not found');

  res.json({ success: true, user });
});
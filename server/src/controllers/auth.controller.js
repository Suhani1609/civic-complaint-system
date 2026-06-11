import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ApiError, asyncHandler } from '../utils/apiError.js';
import {
  generateAccessToken,
  generateRefreshToken,
  sendRefreshCookie,
} from '../utils/generateTokens.js';

export const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, 'Name, email and password are required');
  }

  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(409, 'Email already registered');
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  const accessToken  = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save();

  sendRefreshCookie(res, refreshToken);

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    accessToken,
    user: {
      _id:    user._id,
      name:   user.name,
      email:  user.email,
      role:   user.role,
      avatar: user.avatar,
      ward:   user.ward,
    },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'Your account has been deactivated');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const accessToken  = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save();

  sendRefreshCookie(res, refreshToken);

  res.json({
    success: true,
    message: 'Logged in successfully',
    accessToken,
    user: {
      _id:    user._id,
      name:   user.name,
      email:  user.email,
      role:   user.role,
      avatar: user.avatar,
      ward:   user.ward,
    },
  });
});

export const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    throw new ApiError(401, 'No refresh token');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  const user = await User.findById(decoded.id);
  if (!user || user.refreshToken !== token) {
    throw new ApiError(401, 'Refresh token mismatch');
  }

  const newAccessToken  = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  user.refreshToken = newRefreshToken;
  await user.save();

  sendRefreshCookie(res, newRefreshToken);

  res.json({
    success: true,
    accessToken: newAccessToken,
    user: {
      _id:    user._id,
      name:   user.name,
      email:  user.email,
      role:   user.role,
      avatar: user.avatar,
      ward:   user.ward,
    },
  });
});

export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;

  if (token) {
    await User.findOneAndUpdate(
      { refreshToken: token },
      { refreshToken: null }
    );
  }

  res.clearCookie('refreshToken');
  res.json({ success: true, message: 'Logged out successfully' });
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
    .populate('ward', 'wardName wardNumber');

  if (!user) throw new ApiError(404, 'User not found');
  res.json({ success: true, user });
});
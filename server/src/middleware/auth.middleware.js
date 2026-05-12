import jwt from 'jsonwebtoken';
import { ApiError, asyncHandler } from '../utils/apiError.js';

// Verifies the JWT access token on every protected request
export const verifyToken = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'Access token required');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, ward }
    next();
  } catch {
    throw new ApiError(401, 'Invalid or expired access token');
  }
});

// Role-based access — use after verifyToken
// Usage: requireRole('admin')  or  requireRole('admin', 'ward_officer')
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, `Access denied. Required role: ${roles.join(' or ')}`);
    }
    next();
  };
};
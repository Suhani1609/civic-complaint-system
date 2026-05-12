import express from 'express';
import {
  signup,
  login,
  logout,
  refreshToken,
  getMe,
} from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { authLimiter } from '../middleware/rateLimit.middleware.js';

const router = express.Router();

router.post('/signup',  authLimiter, signup);
router.post('/login',   authLimiter, login);
router.post('/logout',  logout);
router.post('/refresh', refreshToken);
router.get('/me',       verifyToken, getMe);

export default router;
import express from 'express';
import { getWards } from '../controllers/ward.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', verifyToken, getWards);

export default router;
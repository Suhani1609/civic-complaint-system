import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes         from './routes/auth.routes.js';
import complaintRoutes    from './routes/complaint.routes.js';
import wardRoutes         from './routes/ward.routes.js';
import analyticsRoutes    from './routes/analytics.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import userRoutes         from './routes/user.routes.js';

const app = express();

// ── Security headers ───────────────────────────────────────
app.use(helmet({
  crossOriginEmbedderPolicy: false, // needed for Cloudinary images
  contentSecurityPolicy: false,     // configure this after deployment if needed
}));

// ── CORS ──────────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5173',
];

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (mobile apps, curl)
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}));

// ── Global rate limit ─────────────────────────────────────
// 100 requests per 15 minutes per IP
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, try again later' },
  skip: (req) => process.env.NODE_ENV === 'development',
}));

// ── Body parsers ──────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// ── Logging ───────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ── Sanitize manually (avoids req.query conflict) ─────────
app.use((req, res, next) => {
  // Remove $ from keys to prevent NoSQL injection
  const sanitize = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    Object.keys(obj).forEach(key => {
      if (key.startsWith('$')) {
        delete obj[key];
      } else if (typeof obj[key] === 'object') {
        sanitize(obj[key]);
      }
    });
  };
  sanitize(req.body);
  sanitize(req.params);
  next();
});

// ── Health check ──────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    status:      'ok',
    environment: process.env.NODE_ENV,
    timestamp:   new Date().toISOString(),
  });
});

// ── API routes ────────────────────────────────────────────
app.use('/api/v1/auth',          authRoutes);
app.use('/api/v1/complaints',    complaintRoutes);
app.use('/api/v1/wards',         wardRoutes);
app.use('/api/v1/analytics',     analyticsRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/users',         userRoutes);

// ── 404 ───────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// ── Global error handler (must be last) ───────────────────
app.use(errorHandler);

export default app;
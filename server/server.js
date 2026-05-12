import 'dotenv/config';
import http from 'http';
import app from './src/app.js';
import { connectDB } from './src/config/db.js';

const PORT = process.env.PORT || 5000;
const httpServer = http.createServer(app);

// Connect DB first, then start server
// httpServer is separate from app so Socket.io can attach later
connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`✓ Server running on port ${PORT}`);
  });
});

process.on('SIGTERM', () => {
  httpServer.close(() => process.exit(0));
});
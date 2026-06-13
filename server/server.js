import 'dotenv/config';
import http from 'http';
import { Server } from 'socket.io';
import app from './src/app.js';
import { connectDB } from './src/config/db.js';
import { seedWards } from './src/config/seedWards.js';

const PORT = process.env.PORT || 5000;

// Create HTTP server from Express app
const httpServer = http.createServer(app);

// Attach Socket.io to the same HTTP server
const io = new Server(httpServer, {
  cors: {
    origin:      process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  },
});

// Store io instance on app so controllers can access it
app.set('io', io);

// Socket.io connection handler
io.on('connection', (socket) => {
  // Client sends their userId to join their personal room
  socket.on('join', (userId) => {
    if (userId) {
      socket.join(userId.toString());
    }
  });

  socket.on('disconnect', () => {
    // cleanup happens automatically
  });
});

// Connect DB then start server
connectDB().then(async () => {
  await seedWards();
  httpServer.listen(PORT, () => {
    console.log(`✓ Server running on port ${PORT}`);
    console.log(`✓ Socket.io attached`);
  });
});

process.on('SIGTERM', () => {
  httpServer.close(() => process.exit(0));
});

export { io };
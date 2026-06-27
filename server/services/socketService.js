const { Server } = require('socket.io');

let io = null;

const init = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`[SOCKET] Client connected: ${socket.id}`);

    // Join a farm-specific room
    socket.on('join_farm', (farmId) => {
      if (farmId) {
        socket.join(farmId.toString());
        console.log(`[SOCKET] Socket ${socket.id} joined farm room: ${farmId}`);
      }
    });

    // Join the admin room
    socket.on('join_admin', () => {
      socket.join('admin');
      console.log(`[SOCKET] Socket ${socket.id} joined admin room`);
    });

    socket.on('disconnect', () => {
      console.log(`[SOCKET] Client disconnected: ${socket.id}`);
    });
  });

  console.log('[SOCKET] Socket.IO initialized successfully.');
  return io;
};

/**
 * Emit an event to a specific room (used across the entire app).
 * @param {string} room - Room name (farmId string or 'admin')
 * @param {string} event - Event name
 * @param {*} data - Payload
 */
const emitToRoom = (room, event, data) => {
  if (io) io.to(room).emit(event, data);
};

// Convenience aliases kept for backward compatibility
const emitToFarm  = (farmId, event, data) => emitToRoom(farmId.toString(), event, data);
const emitToAdmin = (event, data) => emitToRoom('admin', event, data);

const getIO = () => io;

module.exports = { init, emitToRoom, emitToFarm, emitToAdmin, getIO };

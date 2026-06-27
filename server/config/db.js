const mongoose = require('mongoose');
const env = require('./env');

const connectDB = async () => {
  // Mongoose connection event listeners — set BEFORE connecting
  mongoose.connection.on('connected', () => {
    console.log('[DB] MongoDB connection established successfully.');
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[DB] WARNING: MongoDB connection lost. Attempting to reconnect...');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('[DB] MongoDB reconnected successfully.');
  });

  mongoose.connection.on('error', (err) => {
    console.error(`[DB] MongoDB runtime error: ${err.message}`);
  });

  try {
    console.log('[DB] Connecting to MongoDB Atlas...');
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,  // Fail fast if Atlas unreachable (10s)
      socketTimeoutMS: 45000,           // Close idle sockets after 45s
      family: 4,                        // Force IPv4 (avoids IPv6 resolution issues on Windows)
    });
    console.log(`[DB] Connected to host: ${conn.connection.host}`);
    console.log(`[DB] Database name:     ${conn.connection.name}`);
    console.log(`[DB] Connection state:  ${conn.connection.readyState === 1 ? 'READY' : 'UNKNOWN'}`);
  } catch (error) {
    console.error('=========================================');
    console.error('[DB] FATAL: Could not connect to MongoDB');
    console.error(`[DB] Reason: ${error.message}`);
    console.error('[DB] Check your MONGODB_URI in server/.env');
    console.error('[DB] Ensure your IP is whitelisted in Atlas Network Access');
    console.error('=========================================');
    process.exit(1);
  }
};

module.exports = connectDB;

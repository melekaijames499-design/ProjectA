// env MUST be required first — loads dotenv before any other module reads process.env
const env = require('./config/env');

const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const socketService = require('./services/socketService');
const scheduleRunner = require('./services/scheduleRunner');

const startServer = async () => {
  console.log('====================================================');
  console.log(' SMART IRRIGATION SYSTEM — STARTING BOOTSTRAP');
  console.log(`  Environment: ${env.NODE_ENV}`);
  console.log(`  Target port: ${env.PORT}`);
  console.log(`  Client URL:  ${env.CLIENT_URL}`);
  console.log('====================================================');

  // Step 1: Connect to Database (must succeed before server starts)
  await connectDB();

  // Step 2: Create HTTP Server from Express app
  const server = http.createServer(app);

  // Step 3: Attach Socket.IO to the HTTP server
  socketService.init(server);
  console.log('[SOCKET] Socket.IO initialized.');

  // Step 4: Start irrigation schedule cron runner
  scheduleRunner.start();
  console.log('[CRON] Schedule runner started.');

  // Step 5: Begin listening for requests
  server.listen(env.PORT, () => {
    console.log('====================================================');
    console.log(` SERVER RUNNING IN: [${env.NODE_ENV}] MODE`);
    console.log(` PORT NUMBER:       ${env.PORT}`);
    console.log(` API BASE URL:      http://localhost:${env.PORT}/api`);
    console.log(` HEALTH CHECK:      http://localhost:${env.PORT}/api/health`);
    console.log(` FRONTEND:          http://localhost:${env.PORT}/login.html`);
    console.log('====================================================');
  });

  // Step 6: Handle port already in use
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`[SERVER] ERROR: Port ${env.PORT} is already in use.`);
      console.error(`[SERVER] Fix: Stop the process using port ${env.PORT} or change PORT in .env`);
      console.error(`[SERVER] Windows tip: Run  netstat -ano | findstr :${env.PORT}  to find the process`);
    } else {
      console.error(`[SERVER] Unexpected server error: ${err.message}`);
    }
    process.exit(1);
  });

  // Step 7: Graceful shutdown handlers
  const shutdown = (signal) => {
    console.log(`\n[SERVER] ${signal} received. Shutting down gracefully...`);
    scheduleRunner.stop();
    server.close(() => {
      console.log('[SERVER] HTTP server closed.');
      process.exit(0);
    });
    // Force kill if graceful shutdown takes too long
    setTimeout(() => {
      console.error('[SERVER] Forced shutdown after timeout.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));

  // Step 8: Catch unhandled promise rejections globally
  process.on('unhandledRejection', (reason, promise) => {
    console.error('[SERVER] Unhandled Promise Rejection:');
    console.error(reason);
  });

  process.on('uncaughtException', (err) => {
    console.error('[SERVER] Uncaught Exception:');
    console.error(err.message);
    process.exit(1);
  });
};

startServer().catch(err => {
  console.error('[SERVER] Bootstrap failed:', err.message);
  process.exit(1);
});

const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const cookieParser = require('cookie-parser');
const path       = require('path');
const env        = require('./config/env');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ─── 1. SECURITY HEADERS ─────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc:  ["'self'"],
        scriptSrc:   [
          "'self'",
          "'unsafe-inline'",
          "https://cdn.tailwindcss.com",
          "https://cdn.jsdelivr.net",
          "https://cdn.socket.io",
          "https://unpkg.com",
        ],
        styleSrc:    [
          "'self'",
          "'unsafe-inline'",
          "https://cdn.tailwindcss.com",
          "https://fonts.googleapis.com",
        ],
        fontSrc:     ["'self'", "https://fonts.gstatic.com"],
        imgSrc:      ["'self'", "data:", "https:"],
        connectSrc:  ["'self'", "ws://localhost:*", "wss://localhost:*"],
        workerSrc:   ["'self'", "blob:"],
        scriptSrcAttr: ["'unsafe-inline'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// Parse comma-separated origins (supports dev Vite :5173 + prod Express :5000)
const allowedOrigins = env.CLIENT_URL
  ? env.CLIENT_URL.split(',').map(o => o.trim())
  : ['http://localhost:5000'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. Postman, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: Origin ${origin} not allowed`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
}));

// ─── 3. BODY PARSERS ──────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── 4. STATIC FILE SERVING ───────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '../client/public')));
app.use('/assets', express.static(path.join(__dirname, '../client/assets')));

// ─── 5. HEALTH CHECK ──────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success:     true,
    message:     'Smart Irrigation System API is running',
    environment: env.NODE_ENV,
    timestamp:   new Date(),
  });
});

// ─── 6. API ROUTES (safe require — won't crash if file missing) ───────────────
const safeRequire = (routePath, label) => {
  try {
    return require(routePath);
  } catch (e) {
    console.warn(`[ROUTES] WARNING: ${label} not found — skipping. Create ${routePath}`);
    const router = express.Router();
    router.all('*', (req, res) => {
      res.status(501).json({
        success: false,
        error:   `${label} not implemented yet`,
        code:    'ROUTE_NOT_IMPLEMENTED',
      });
    });
    return router;
  }
};

app.use('/api/auth',       safeRequire('./routes/auth.routes',      'auth.routes'));
app.use('/api/admin',      safeRequire('./routes/admin.routes',     'admin.routes'));
app.use('/api/farms',      safeRequire('./routes/farm.routes',      'farm.routes'));
app.use('/api/sensors',    safeRequire('./routes/sensor.routes',    'sensor.routes'));
app.use('/api/pump',       safeRequire('./routes/pump.routes',      'pump.routes'));
app.use('/api/alerts',     safeRequire('./routes/alert.routes',     'alert.routes'));
app.use('/api/schedules',  safeRequire('./routes/schedule.routes',  'schedule.routes'));
app.use('/api/thresholds', safeRequire('./routes/threshold.routes', 'threshold.routes'));
app.use('/api/contact',    safeRequire('./routes/contact.routes',   'contact.routes'));


// ─── 7. API 404 HANDLER ───────────────────────────────────────────────────────
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error:   `API endpoint not found: ${req.originalUrl}`,
    code:    'ENDPOINT_NOT_FOUND',
  });
});

// ─── 8. FALLBACK → index.html (landing page) ─────────────────────────────────
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../client/public/index.html'));
});

// ─── 9. GLOBAL ERROR HANDLER (must be last) ───────────────────────────────────
app.use(errorHandler);

module.exports = app;

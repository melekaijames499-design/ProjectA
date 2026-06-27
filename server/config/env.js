// MUST be the first line — loads .env before anything else reads process.env
require('dotenv').config();

const REQUIRED_VARS = [
  'PORT',
  'NODE_ENV',
  'MONGODB_URI',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'JWT_ACCESS_EXPIRY',
  'JWT_REFRESH_EXPIRY',
  'CLIENT_URL'
];

// Validate all required vars are present
const missing = REQUIRED_VARS.filter(key => !process.env[key]);
if (missing.length > 0) {
  console.error('=========================================');
  console.error(' FATAL: Missing required .env variables:');
  missing.forEach(key => console.error(`   - ${key}`));
  console.error(' Check your server/.env file.');
  console.error('=========================================');
  process.exit(1);
}

const env = Object.freeze({
  PORT:                parseInt(process.env.PORT, 10) || 5000,
  NODE_ENV:            process.env.NODE_ENV,
  MONGODB_URI:         process.env.MONGODB_URI,
  JWT_ACCESS_SECRET:   process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET:  process.env.JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRY:   process.env.JWT_ACCESS_EXPIRY,
  JWT_REFRESH_EXPIRY:  process.env.JWT_REFRESH_EXPIRY,
  CLIENT_URL:          process.env.CLIENT_URL,
  IS_PRODUCTION:       process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT:      process.env.NODE_ENV === 'development',
});

module.exports = env;

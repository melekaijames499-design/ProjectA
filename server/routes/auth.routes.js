const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');
const {
  loginValidator,
  registerValidator,
  profileValidator
} = require('../utils/validators');

// Public auth routes (with rate limiter on login/register)
router.post('/login', authLimiter, loginValidator, validate, authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

// Register - Optional JWT validation to allow admins to assign roles, else public (defaults to farmer)
const softProtect = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return protect(req, res, next);
  }
  next();
};
router.post('/register', softProtect, registerValidator, validate, authController.register);

// Protected profile routes
router.get('/me', protect, authController.getMe);
router.put('/me', protect, profileValidator, validate, authController.updateMe);

module.exports = router;

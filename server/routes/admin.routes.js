const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const validate = require('../middleware/validate');
const { body } = require('express-validator');
const { registerValidator, farmValidator } = require('../utils/validators');

// Restrict all routes inside this file to Authenticated Admins
router.use(protect);
router.use(roleGuard('admin'));

// Validator for editing a user (all fields optional — password only validated if provided)
const editUserValidator = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Please enter a valid email address'),
  body('password').optional({ checkFalsy: true }).isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['admin', 'farmer', 'viewer']).withMessage('Invalid role'),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
];

// User Management
router.get('/users', adminController.getUsers);
router.post('/users', registerValidator, validate, adminController.createUser);
router.put('/users/:id', editUserValidator, validate, adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Farm Management
router.get('/farms', adminController.getFarms);
router.post('/farms', farmValidator, validate, adminController.createFarm);
router.put('/farms/:id', farmValidator, validate, adminController.updateFarm);
router.delete('/farms/:id', adminController.deleteFarm);

// System-wide Analytics
router.get('/analytics', adminController.getAnalytics);

// Global alerts list
router.get('/alerts', adminController.getAllAlerts);

module.exports = router;

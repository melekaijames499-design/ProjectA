const { body, query, param } = require('express-validator');

exports.loginValidator = [
  body('email').isEmail().withMessage('Please enter a valid email address'),
  body('password').notEmpty().withMessage('Password is required')
];

exports.registerValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please enter a valid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('role').optional().isIn(['admin', 'farmer', 'viewer']).withMessage('Role must be admin, farmer, or viewer'),
  body('farmId').optional().custom((val) => {
    if (val && val !== 'null' && !val.match(/^[0-9a-fA-F]{24}$/)) {
      throw new Error('Invalid farm reference format');
    }
    return true;
  })
];

exports.profileValidator = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

exports.farmValidator = [
  body('name').trim().notEmpty().withMessage('Farm name is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('owner').custom((val) => {
    if (!val || !val.match(/^[0-9a-fA-F]{24}$/)) {
      throw new Error('Owner must be a valid User ID');
    }
    return true;
  }),
  body('area').isFloat({ min: 0.1 }).withMessage('Area must be a number greater than 0'),
  body('cropType').trim().notEmpty().withMessage('Crop type is required')
];

exports.sensorReadingValidator = [
  body('farmId').custom((val) => {
    if (!val || !val.match(/^[0-9a-fA-F]{24}$/)) {
      throw new Error('Farm ID must be a valid ID');
    }
    return true;
  }),
  body('soilMoisture').isFloat({ min: 0, max: 100 }).withMessage('Soil moisture must be between 0% and 100%'),
  body('temperature').isFloat({ min: -10, max: 60 }).withMessage('Temperature must be between -10°C and 60°C'),
  body('humidity').isFloat({ min: 0, max: 100 }).withMessage('Humidity must be between 0% and 100%'),
  body('timestamp').optional().isISO8601().withMessage('Timestamp must be a valid ISO8601 date'),
  body('notes').optional().trim()
];

exports.pumpControlValidator = [
  body('farmId').custom((val) => {
    if (!val || !val.match(/^[0-9a-fA-F]{24}$/)) {
      throw new Error('Farm ID must be a valid ID');
    }
    return true;
  }),
  body('action').isIn(['ON', 'OFF']).withMessage('Action must be ON or OFF'),
  body('duration').optional({ nullable: true }).isInt({ min: 1 }).withMessage('Duration must be a positive integer in minutes'),
  body('notes').optional().trim()
];

exports.scheduleValidator = [
  body('farmId').custom((val) => {
    if (!val || !val.match(/^[0-9a-fA-F]{24}$/)) {
      throw new Error('Farm ID must be a valid ID');
    }
    return true;
  }),
  body('startTime').matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage('Start time must be in HH:MM 24-hour format'),
  body('duration').isInt({ min: 1 }).withMessage('Duration must be at least 1 minute'),
  body('daysOfWeek').isArray({ min: 1 }).withMessage('Days of week must be an array with at least one day'),
  body('daysOfWeek.*').isInt({ min: 0, max: 6 }).withMessage('Days must be numbers between 0 (Sunday) and 6 (Saturday)')
];

exports.thresholdValidator = [
  body('farmId').custom((val) => {
    if (!val || !val.match(/^[0-9a-fA-F]{24}$/)) {
      throw new Error('Farm ID must be a valid ID');
    }
    return true;
  }),
  body('minMoisture').isFloat({ min: 0, max: 100 }).withMessage('minMoisture must be between 0 and 100'),
  body('maxMoisture').isFloat({ min: 0, max: 100 }).withMessage('maxMoisture must be between 0 and 100'),
  body('maxTemperature').isFloat({ min: 0, max: 60 }).withMessage('maxTemperature must be between 0 and 60'),
  body('minHumidity').isFloat({ min: 0, max: 100 }).withMessage('minHumidity must be between 0 and 100')
];

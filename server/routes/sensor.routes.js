const express = require('express');
const router = express.Router();
const sensorController = require('../controllers/sensorController');
const { protect } = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const validate = require('../middleware/validate');
const { sensorReadingValidator } = require('../utils/validators');

router.use(protect);

router.post('/readings', roleGuard('farmer', 'admin'), sensorReadingValidator, validate, sensorController.submitReading);
router.get('/readings', sensorController.getReadings);
router.get('/readings/latest', sensorController.getLatestReading);
router.get('/readings/stats', sensorController.getReadingStats);

module.exports = router;

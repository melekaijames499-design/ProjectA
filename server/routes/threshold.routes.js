const express = require('express');
const router = express.Router();
const thresholdController = require('../controllers/thresholdController');
const { protect } = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const validate = require('../middleware/validate');
const { thresholdValidator } = require('../utils/validators');

router.use(protect);

router.get('/', thresholdController.getThresholds);
router.put('/', roleGuard('farmer', 'admin'), thresholdValidator, validate, thresholdController.upsertThresholds);

module.exports = router;

const express = require('express');
const router = express.Router();
const pumpController = require('../controllers/pumpController');
const { protect } = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const validate = require('../middleware/validate');
const { pumpControlValidator } = require('../utils/validators');

router.use(protect);

router.post('/control', roleGuard('farmer', 'admin'), pumpControlValidator, validate, pumpController.controlPump);
router.get('/logs', pumpController.getPumpLogs);
router.get('/status', pumpController.getPumpStatus);

module.exports = router;

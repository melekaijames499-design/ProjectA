const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const { protect } = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

router.use(protect);

router.get('/', alertController.getAlerts);
router.put('/:id/resolve', roleGuard('farmer', 'admin'), alertController.resolveAlert);
router.post('/test', roleGuard('admin'), alertController.testAlert);

module.exports = router;

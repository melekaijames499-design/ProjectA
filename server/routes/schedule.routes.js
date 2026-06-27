const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const { protect } = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const validate = require('../middleware/validate');
const { scheduleValidator } = require('../utils/validators');

router.use(protect);

router.get('/', scheduleController.getSchedules);
router.post('/', roleGuard('farmer', 'admin'), scheduleValidator, validate, scheduleController.createSchedule);
router.put('/:id', roleGuard('farmer', 'admin'), scheduleValidator, validate, scheduleController.updateSchedule);
router.delete('/:id', roleGuard('farmer', 'admin'), scheduleController.deleteSchedule);
router.patch('/:id/toggle', roleGuard('farmer', 'admin'), scheduleController.toggleSchedule);

module.exports = router;

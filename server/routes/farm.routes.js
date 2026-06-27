const express = require('express');
const router = express.Router();
const farmController = require('../controllers/farmController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/:id', farmController.getFarmDetails);
router.get('/:id/summary', farmController.getFarmSummary);

module.exports = router;

const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  farmId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farm',
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  daysOfWeek: {
    type: [Number],
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastRun: {
    type: Date,
  },
});

module.exports = mongoose.model('Schedule', scheduleSchema);

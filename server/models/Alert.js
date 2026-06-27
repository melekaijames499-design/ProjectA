const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  farmId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farm',
    required: true,
  },
  type: {
    type: String,
    enum: [
      'low_moisture', 'high_moisture',
      'high_temp',
      'low_humidity',
      'moisture_low', 'temperature_high', 'humidity_low', 'system_error'
    ],
    required: true,
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical', 'warning', 'info'],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  isResolved: {
    type: Boolean,
    default: false,
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  resolvedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Alert', alertSchema);

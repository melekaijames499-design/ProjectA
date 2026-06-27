const mongoose = require('mongoose');

const pumpLogSchema = new mongoose.Schema({
  farmId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farm',
    required: true,
  },
  action: {
    type: String,
    enum: ['ON', 'OFF'],
    required: true,
  },
  triggeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  triggerType: {
    type: String,
    enum: ['manual', 'auto', 'schedule'],
    required: true,
  },
  duration: {
    type: Number,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  notes: {
    type: String,
  },
});

module.exports = mongoose.model('PumpLog', pumpLogSchema);

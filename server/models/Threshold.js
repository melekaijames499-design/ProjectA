const mongoose = require('mongoose');

const thresholdSchema = new mongoose.Schema({
  farmId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farm',
    required: true,
    unique: true,
  },
  minMoisture: {
    type: Number,
    required: true,
  },
  maxMoisture: {
    type: Number,
    required: true,
  },
  maxTemperature: {
    type: Number,
    required: true,
  },
  minHumidity: {
    type: Number,
    required: true,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Threshold', thresholdSchema);

const mongoose = require('mongoose');

const sensorReadingSchema = new mongoose.Schema({
  farmId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farm',
    required: true,
  },
  soilMoisture: {
    type: Number,
    required: true,
  },
  temperature: {
    type: Number,
    required: true,
  },
  humidity: {
    type: Number,
    required: true,
  },
  inputMethod: {
    type: String,
    enum: ['auto', 'manual'],
    required: true,
  },
  enteredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  notes: {
    type: String,
  },
});

module.exports = mongoose.model('SensorReading', sensorReadingSchema);

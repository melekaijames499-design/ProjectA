const Threshold = require('../models/Threshold');
const Alert = require('../models/Alert');
const socketService = require('./socketService');

/**
 * Check sensor readings against thresholds and trigger alerts
 * @param {Object} reading - The saved SensorReading document
 */
const checkReadings = async (reading) => {
  try {
    const { farmId, soilMoisture, temperature, humidity } = reading;

    // Fetch thresholds or use defaults
    let threshold = await Threshold.findOne({ farmId });
    if (!threshold) {
      threshold = {
        minMoisture: 30,
        maxMoisture: 70,
        maxTemperature: 35,
        minHumidity: 20
      };
    }

    const checks = [];

    // 1. Soil Moisture Checks
    if (soilMoisture < threshold.minMoisture - 10) {
      checks.push({
        type: 'low_moisture',
        severity: 'critical',
        message: `Critical soil moisture alert: current moisture is ${soilMoisture}%, which is more than 10% below the minimum threshold of ${threshold.minMoisture}%.`
      });
    } else if (soilMoisture < threshold.minMoisture) {
      checks.push({
        type: 'low_moisture',
        severity: 'warning',
        message: `Warning: Soil moisture is low at ${soilMoisture}%. Minimum threshold is ${threshold.minMoisture}%.`
      });
    } else if (soilMoisture > threshold.maxMoisture) {
      checks.push({
        type: 'high_moisture',
        severity: 'info',
        message: `Info: Soil moisture is high at ${soilMoisture}%. Maximum threshold is ${threshold.maxMoisture}%.`
      });
    }

    // 2. Temperature Checks
    if (temperature > threshold.maxTemperature + 5) {
      checks.push({
        type: 'high_temp',
        severity: 'critical',
        message: `Critical high temperature alert: current temperature is ${temperature}°C, which is more than 5°C above the maximum threshold of ${threshold.maxTemperature}°C.`
      });
    } else if (temperature > threshold.maxTemperature) {
      checks.push({
        type: 'high_temp',
        severity: 'warning',
        message: `Warning: Temperature is high at ${temperature}°C. Maximum threshold is ${threshold.maxTemperature}°C.`
      });
    }

    // 3. Humidity Checks
    if (humidity < threshold.minHumidity) {
      checks.push({
        type: 'low_humidity',
        severity: 'info',
        message: `Info: Humidity is low at ${humidity}%. Minimum threshold is ${threshold.minHumidity}%.`
      });
    }

    // Process all alerts
    for (const check of checks) {
      // Check for existing unresolved alert of the same type
      let alert = await Alert.findOne({
        farmId,
        type: check.type,
        isResolved: false
      });

      if (alert) {
        // Update existing alert
        alert.severity = check.severity;
        alert.message = check.message;
        // Trigger pre-save hook or touch updatedAt
        alert.markModified('message');
        await alert.save();
      } else {
        // Create new alert
        alert = await Alert.create({
          farmId,
          type: check.type,
          severity: check.severity,
          message: check.message,
          isResolved: false
        });
      }

      // Emit Socket.IO event to farm room and admin room
      socketService.emitToRoom(farmId.toString(), 'new_alert', {
        farmId,
        alert
      });

      socketService.emitToRoom('admin', 'new_alert', {
        farmId,
        alert
      });
    }
  } catch (err) {
    console.error('Error in alertService.checkReadings:', err.message);
  }
};

module.exports = {
  checkReadings
};

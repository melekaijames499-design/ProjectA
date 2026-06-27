const Threshold = require('../models/Threshold');
const PumpLog = require('../models/PumpLog');
const socketService = require('./socketService');

/**
 * Automate pump state transitions based on moisture levels
 * @param {Object} reading - The saved SensorReading document
 */
const checkReadings = async (reading) => {
  try {
    const { farmId, soilMoisture } = reading;

    // Fetch thresholds or use defaults
    let threshold = await Threshold.findOne({ farmId });
    if (!threshold) {
      threshold = {
        minMoisture: 30,
        maxMoisture: 70
      };
    }

    // Fetch last pump action to see if it is ON or OFF
    const lastAction = await PumpLog.findOne({ farmId }).sort({ timestamp: -1 });
    const isCurrentlyOn = lastAction ? lastAction.action === 'ON' : false;

    let triggerAction = null;
    let notes = '';

    if (soilMoisture < threshold.minMoisture && !isCurrentlyOn) {
      triggerAction = 'ON';
      notes = `Automatic trigger: soil moisture (${soilMoisture}%) fell below minimum threshold of ${threshold.minMoisture}%.`;
    } else if (soilMoisture >= threshold.maxMoisture && isCurrentlyOn) {
      triggerAction = 'OFF';
      notes = `Automatic trigger: soil moisture (${soilMoisture}%) reached maximum threshold of ${threshold.maxMoisture}%.`;
    }

    if (triggerAction) {
      // Calculate duration if turning OFF
      let duration = null;
      if (triggerAction === 'OFF' && lastAction && lastAction.action === 'ON') {
        const timeDiffMs = new Date() - lastAction.timestamp;
        duration = Math.round(timeDiffMs / (1000 * 60)); // convert to minutes
      }

      const log = await PumpLog.create({
        farmId,
        action: triggerAction,
        triggeredBy: null, // System automation
        triggerType: 'auto',
        duration,
        notes
      });

      // Emit real-time update
      socketService.emitToRoom(farmId.toString(), 'pump_status_change', {
        farmId,
        status: triggerAction,
        log
      });

      console.log(`[AUTOMATION] Farm ${farmId}: Pump auto-triggered ${triggerAction}.`);
    }
  } catch (err) {
    console.error('Error in pumpAutomation.checkReadings:', err.message);
  }
};

module.exports = {
  checkReadings
};

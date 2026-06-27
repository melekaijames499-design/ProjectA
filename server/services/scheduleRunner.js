const cron = require('node-cron');

let task = null;

const start = () => {
  // Runs every minute — checks active schedules and triggers pump if needed
  task = cron.schedule('* * * * *', async () => {
    try {
      // Schedule logic will be fully implemented in Phase 7
      // For now this is a safe stub that prevents crashes
      const now = new Date();
      const currentDay  = now.getDay();   // 0 = Sunday
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      // Placeholder — full implementation added when Schedule model is ready
      // console.log(`[CRON] Tick at ${currentTime} day ${currentDay}`);
    } catch (err) {
      console.error('[CRON] Schedule runner error:', err.message);
    }
  });

  console.log('[CRON] Irrigation schedule runner started (checks every minute).');
};

const stop = () => {
  if (task) {
    task.stop();
    console.log('[CRON] Schedule runner stopped.');
  }
};

module.exports = { start, stop };

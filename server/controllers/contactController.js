const { success, error } = require('../utils/apiResponse');

// For now, logs to console and returns success.
// Phase 2: save to ContactMessage model and send email notification.
const submitContact = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;
    console.log(`[CONTACT] New message from ${name} <${email}> — ${subject}`);
    // TODO Phase 2: await ContactMessage.create({ name, email, subject, message });
    return success(res, null, 'Your message has been received. We will get back to you shortly.');
  } catch (err) {
    next(err);
  }
};

module.exports = { submitContact };

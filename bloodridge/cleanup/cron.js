const cron = require('node-cron');
const User = require('../models/user');

const cleanupUnverifiedUsers = () => {
  // Run every day at midnight
  cron.schedule('0 0 * * *', async () => {
    try {
      const result = await User.deleteMany({
        isVerified: false,
        verificationExpires: { $lt: new Date() },
      });
      if (result.deletedCount > 0) {
        console.log(`🧹 Cleaned up ${result.deletedCount} expired unverified users`);
      }
    } catch (err) {
      console.error('Cleanup error:', err.message);
    }
  });
};

module.exports = cleanupUnverifiedUsers;

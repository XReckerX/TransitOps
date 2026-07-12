const cron = require('node-cron');
const Driver = require('../models/Driver');
const { sendEmail } = require('../services/emailService');

// Schedule job to run daily at midnight: '0 0 * * *'
// For testing/boilerplate, we will initialize it
function initLicenseExpiryCron() {
  console.log('License Expiry Cron Job initialized');

  cron.schedule('0 0 * * *', async () => {
    console.log('Running daily license expiry scan...');

    try {
      const in7Days = new Date();
      in7Days.setDate(in7Days.getDate() + 7);

      const today = new Date();

      // Find drivers whose license is expiring within the next 7 days, or already expired, and status is not suspended
      const expiringDrivers = await Driver.find({
        licenseExpiryDate: { $lte: in7Days, $gte: today },
        status: { $ne: 'Suspended' }
      });

      if (expiringDrivers.length > 0) {
        console.log(`Found ${expiringDrivers.length} drivers with upcoming license expiry`);

        let driverListText = expiringDrivers
          .map(d => `- ${d.name} (License: ${d.licenseNumber}, Expires: ${d.licenseExpiryDate.toDateString()})`)
          .join('\n');

        await sendEmail({
          to: 'safety-officer@transitops.io',
          subject: '⚠️ WARNING: Upcoming Driver License Expirations',
          text: `The licenses of the following drivers are expiring within the next 7 days:\n\n${driverListText}\n\nPlease take appropriate action.`,
          html: `<p>The licenses of the following drivers are expiring within the next 7 days:</p><ul>${expiringDrivers.map(d => `<li><strong>${d.name}</strong> (License: ${d.licenseNumber}, Expires: ${d.licenseExpiryDate.toDateString()})</li>`).join('')}</ul>`
        });
      }
    } catch (error) {
      console.error(`License Expiry Cron Error: ${error.message}`);
    }
  });
}

module.exports = initLicenseExpiryCron;

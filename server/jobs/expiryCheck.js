import cron from 'node-cron';
import expireExpiredDonations from '../utils/expireExpiredDonations.js';

export const startExpiryJob = () => {
  cron.schedule('0 0 * * *', async () => {
    try {
      const expiredCount = await expireExpiredDonations();
      console.log(`Expiry check completed. ${expiredCount} donations marked as expired.`);
    } catch (error) {
      console.error('Error running expiry check job:', error);
    }
  });
};

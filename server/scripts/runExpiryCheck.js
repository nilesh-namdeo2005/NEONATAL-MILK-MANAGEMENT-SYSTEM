import mongoose from 'mongoose';
import dotenv from 'dotenv';
import expireExpiredDonations from '../utils/expireExpiredDonations.js';

dotenv.config();

const run = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is required. Configure server/.env before checking expiry.');
  }

  await mongoose.connect(process.env.MONGO_URI);
  try {
    const count = await expireExpiredDonations();
    console.log(`Expiry check completed. ${count} donations marked as expired.`);
  } finally {
    await mongoose.disconnect();
  }
};

run().catch((error) => {
  console.error('Error running expiry check:', error);
  process.exitCode = 1;
});

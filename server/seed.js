import mongoose from 'mongoose';
import dotenv from 'dotenv';

import User from './models/User.js';
import Donor from './models/Donor.js';
import Baby from './models/Baby.js';
import Hospital from './models/Hospital.js';
import MilkDonation from './models/MilkDonation.js';
import MilkRequest from './models/MilkRequest.js';
import Inventory from './models/Inventory.js';
import ActivityLog from './models/ActivityLog.js';
import Counter from './models/Counter.js';

dotenv.config();

const DEMO_PASSWORD = 'password123';

const findOrCreate = async (Model, filter, fields) => {
  const existing = await Model.findOne(filter);
  return existing || Model.create(fields);
};

const seedDatabase = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is required. Configure server/.env before seeding.');
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log(`Connected to MongoDB: ${mongoose.connection.host}`);

  const admin = await findOrCreate(User, { email: 'admin@nmm.com' }, {
    name: 'Admin User',
    email: 'admin@nmm.com',
    passwordHash: DEMO_PASSWORD,
    role: 'admin',
    phone: '9000000001'
  });

  const hospitalUser = await findOrCreate(User, { email: 'hospital1@nmm.com' }, {
    name: 'City Hospital Admin',
    email: 'hospital1@nmm.com',
    passwordHash: DEMO_PASSWORD,
    role: 'hospital',
    phone: '9000000002'
  });
  const hospital = await findOrCreate(Hospital, { user: hospitalUser._id }, {
    user: hospitalUser._id,
    name: 'City General Hospital',
    registrationNo: 'HOS-001',
    address: '123 Main St',
    city: 'mumbai',
    phone: '022-12345678',
    isApproved: true,
    approvalStatus: 'approved'
  });

  const secondHospitalUser = await findOrCreate(User, { email: 'hospital2@nmm.com' }, {
    name: 'Care Hospital Admin',
    email: 'hospital2@nmm.com',
    passwordHash: DEMO_PASSWORD,
    role: 'hospital',
    phone: '9000000003'
  });
  const secondHospital = await findOrCreate(Hospital, { user: secondHospitalUser._id }, {
    user: secondHospitalUser._id,
    name: 'Care Children Hospital',
    registrationNo: 'HOS-002',
    address: '456 Park Ave',
    city: 'delhi',
    phone: '011-87654321',
    isApproved: true,
    approvalStatus: 'approved'
  });
  const pendingHospitalUser = await findOrCreate(User, { email: 'hospital3@nmm.com' }, {
    name: 'New Hospital Admin',
    email: 'hospital3@nmm.com',
    passwordHash: DEMO_PASSWORD,
    role: 'hospital',
    phone: '9000000010'
  });
  await findOrCreate(Hospital, { user: pendingHospitalUser._id }, {
    user: pendingHospitalUser._id,
    name: 'Newborn Care Hospital',
    registrationNo: 'HOS-003',
    address: '789 Lake Rd',
    city: 'nagpur',
    phone: '0712-123456',
    isApproved: false,
    approvalStatus: 'pending'
  });

  const donorUser = await findOrCreate(User, { email: 'donor1@nmm.com' }, {
    name: 'Priya Sharma',
    email: 'donor1@nmm.com',
    passwordHash: DEMO_PASSWORD,
    role: 'donor',
    phone: '9000000004'
  });
  const donor = await findOrCreate(Donor, { user: donorUser._id }, {
    user: donorUser._id,
    age: 28,
    bloodGroup: 'O+',
    address: 'Mumbai',
    screeningStatus: 'approved'
  });

  const secondDonorUser = await findOrCreate(User, { email: 'donor2@nmm.com' }, {
    name: 'Anita Patel',
    email: 'donor2@nmm.com',
    passwordHash: DEMO_PASSWORD,
    role: 'donor',
    phone: '9000000005'
  });
  const secondDonor = await findOrCreate(Donor, { user: secondDonorUser._id }, {
    user: secondDonorUser._id,
    age: 25,
    bloodGroup: 'A+',
    address: 'Delhi',
    screeningStatus: 'approved'
  });

  const pendingDonorUser = await findOrCreate(User, { email: 'donor3@nmm.com' }, {
    name: 'Meena Reddy',
    email: 'donor3@nmm.com',
    passwordHash: DEMO_PASSWORD,
    role: 'donor',
    phone: '9000000006'
  });
  const pendingDonor = await findOrCreate(Donor, { user: pendingDonorUser._id }, {
    user: pendingDonorUser._id,
    age: 30,
    bloodGroup: 'B+',
    address: 'Nagpur',
    screeningStatus: 'pending'
  });

  const recipientUser = await findOrCreate(User, { email: 'recipient1@nmm.com' }, {
    name: 'Rahul Kumar',
    email: 'recipient1@nmm.com',
    passwordHash: DEMO_PASSWORD,
    role: 'recipient',
    phone: '9000000007'
  });
  const baby = await findOrCreate(Baby, {
    guardian: recipientUser._id,
    babyName: 'Baby Kumar'
  }, {
    guardian: recipientUser._id,
    babyName: 'Baby Kumar',
    ageInMonths: 2,
    weightKg: 3.2,
    bloodGroup: 'O+',
    hospital: hospital._id
  });

  const secondRecipientUser = await findOrCreate(User, { email: 'recipient2@nmm.com' }, {
    name: 'Suresh Gupta',
    email: 'recipient2@nmm.com',
    passwordHash: DEMO_PASSWORD,
    role: 'recipient',
    phone: '9000000008'
  });
  const secondBaby = await findOrCreate(Baby, {
    guardian: secondRecipientUser._id,
    babyName: 'Baby Gupta'
  }, {
    guardian: secondRecipientUser._id,
    babyName: 'Baby Gupta',
    ageInMonths: 1,
    weightKg: 2.8,
    bloodGroup: 'A+',
    hospital: hospital._id
  });

  await findOrCreate(MilkDonation, { tokenId: 'NMM-DON-20261008-0001' }, {
    donor: donor._id,
    hospital: hospital._id,
    quantityMl: 300,
    status: 'collected',
    tokenId: 'NMM-DON-20261008-0001',
    collectionDate: new Date(),
    expiryDate: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000)
  });
  await findOrCreate(MilkDonation, { tokenId: 'NMM-DON-20261008-0002' }, {
    donor: secondDonor._id,
    hospital: hospital._id,
    quantityMl: 150,
    status: 'verified',
    tokenId: 'NMM-DON-20261008-0002'
  });
  await findOrCreate(MilkDonation, { donor: pendingDonor._id, hospital: hospital._id, status: 'pending' }, {
    donor: pendingDonor._id,
    hospital: hospital._id,
    quantityMl: 200,
    status: 'pending'
  });

  await findOrCreate(MilkRequest, {
    baby: baby._id,
    hospital: hospital._id,
    notes: 'Seeded emergency request'
  }, {
    baby: baby._id,
    hospital: hospital._id,
    quantityMl: 150,
    urgency: 'emergency',
    status: 'pending',
    notes: 'Seeded emergency request'
  });
  await findOrCreate(MilkRequest, {
    baby: baby._id,
    hospital: hospital._id,
    notes: 'Seeded insufficient-stock request'
  }, {
    baby: baby._id,
    hospital: hospital._id,
    quantityMl: 400,
    urgency: 'normal',
    status: 'pending',
    notes: 'Seeded insufficient-stock request'
  });

  await findOrCreate(Inventory, { hospital: hospital._id, bloodGroup: 'O+' }, {
    hospital: hospital._id,
    bloodGroup: 'O+',
    totalAvailableMl: 300
  });
  await findOrCreate(Inventory, { hospital: hospital._id, bloodGroup: 'A+' }, {
    hospital: hospital._id,
    bloodGroup: 'A+',
    totalAvailableMl: 0
  });
  await Counter.updateOne({ key: 'DON' }, { $max: { seq: 2 } }, { upsert: true });
  await Counter.updateOne({ key: 'REQ' }, { $max: { seq: 1 } }, { upsert: true });

  await ActivityLog.updateOne(
    { actor: admin._id, action: 'SYSTEM_INIT', details: 'Demo data seeded' },
    {
      $setOnInsert: {
        actor: admin._id,
        action: 'SYSTEM_INIT',
        entityType: 'System',
        entityId: admin._id,
        details: 'Demo data seeded'
      }
    },
    { upsert: true }
  );

  console.log('Seed data is ready. Existing application data was not deleted.');
  console.log('Demo password for newly created accounts:', DEMO_PASSWORD);
  console.log('Admin: admin@nmm.com');
  console.log('Hospital: hospital1@nmm.com');
  console.log('Donor: donor1@nmm.com');
  console.log('Recipient: recipient1@nmm.com');
};

seedDatabase()
  .catch((error) => {
    console.error('Error seeding data:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });

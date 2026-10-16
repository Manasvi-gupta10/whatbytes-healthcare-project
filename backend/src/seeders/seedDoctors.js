const { sequelize, Doctor } = require('../models');

const sampleDoctors = [
  {
    name: 'Dr. Sarah Mitchell',
    specialization: 'Cardiology',
    email: 'sarah.mitchell@hospital.org',
    phone: '9876543210',
  },
  {
    name: 'Dr. James Wilson',
    specialization: 'Neurology',
    email: 'james.wilson@hospital.org',
    phone: '9812345678',
  },
  {
    name: 'Dr. Priya Patel',
    specialization: 'Pediatrics',
    email: 'priya.patel@hospital.org',
    phone: '9823456789',
  },
  {
    name: 'Dr. Marcus Vance',
    specialization: 'Orthopedic Surgery',
    email: 'marcus.vance@hospital.org',
    phone: '9834567890',
  },
  {
    name: 'Dr. Elena Rostova',
    specialization: 'Dermatology',
    email: 'elena.rostova@hospital.org',
    phone: '9845678901',
  },
  {
    name: 'Dr. David Chen',
    specialization: 'Oncology',
    email: 'david.chen@hospital.org',
    phone: '9856789012',
  },
  {
    name: 'Dr. Amina Al-Mansoor',
    specialization: 'Psychiatry',
    email: 'amina.almansoor@hospital.org',
    phone: '9867890123',
  },
  {
    name: 'Dr. Robert Torres',
    specialization: 'Internal Medicine',
    email: 'robert.torres@hospital.org',
    phone: '9878901234',
  },
];

const seedDoctors = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to database for seeding...');

    // Synchronize models (ensures tables exist)
    await sequelize.sync();

    let createdCount = 0;
    for (const doc of sampleDoctors) {
      const [doctor, created] = await Doctor.findOrCreate({
        where: { email: doc.email },
        defaults: doc,
      });

      if (created) {
        createdCount++;
        console.log(`[+] Seeded Doctor: ${doctor.name} (${doctor.specialization})`);
      } else {
        console.log(`[~] Doctor already exists: ${doctor.name}`);
      }
    }

    // Seed sample demo user
    const bcrypt = require('bcryptjs');
    const { User } = require('../models');
    const demoPasswordHash = await bcrypt.hash('SecurePass123!', 10);
    const [demoUser, userCreated] = await User.findOrCreate({
      where: { email: 'jane.doe@example.com' },
      defaults: {
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        password: demoPasswordHash,
      },
    });
    if (userCreated) {
      console.log(`[+] Seeded Demo User: ${demoUser.email} (Password: SecurePass123!)`);
    }

    console.log(`\nSeed completed! Added ${createdCount} new doctors (${sampleDoctors.length} total available).`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding doctors and demo user:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDoctors();
}

module.exports = seedDoctors;

const mongoose = require('mongoose');
const env = require('./config/env');
const User = require('./models/User');
const Farm = require('./models/Farm');
const Threshold = require('./models/Threshold');
const SensorReading = require('./models/SensorReading');
const PumpLog = require('./models/PumpLog');
const Alert = require('./models/Alert');
const Schedule = require('./models/Schedule');

const seedData = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(env.MONGODB_URI);
    console.log('Connected to MongoDB.');

    // Clear existing data
    console.log('Clearing database collection logs...');
    await User.deleteMany({});
    await Farm.deleteMany({});
    await Threshold.deleteMany({});
    await SensorReading.deleteMany({});
    await PumpLog.deleteMany({});
    await Alert.deleteMany({});
    await Schedule.deleteMany({});
    console.log('Collections cleared.');

    // 1. Create Admin
    console.log('Creating Admin User...');
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@irrigation.com',
      password: 'Admin@123', // Will be hashed by mongoose pre-save hook
      role: 'admin'
    });

    // 2. Create Farmer (without farmId first)
    console.log('Creating Farmer User...');
    const farmer = await User.create({
      name: 'James Melekai',
      email: 'james@irrigation.com',
      password: 'Farmer@123',
      role: 'farmer'
    });

    // 3. Create Viewer
    console.log('Creating Viewer User...');
    const viewer = await User.create({
      name: 'Dr. Supervisor',
      email: 'viewer@irrigation.com',
      password: 'Viewer@123',
      role: 'viewer'
    });

    // 4. Create Farm
    console.log('Creating Farm...');
    const farm = await Farm.create({
      name: 'Melekai Farm',
      location: 'Nairobi, Kenya',
      owner: farmer._id,
      area: 2.5,
      cropType: 'Maize'
    });

    // Update farmer's farmId reference
    farmer.farmId = farm._id;
    await farmer.save();

    // 5. Create Thresholds for Farm
    console.log('Creating Thresholds...');
    await Threshold.create({
      farmId: farm._id,
      minMoisture: 30,
      maxMoisture: 70,
      maxTemperature: 35,
      minHumidity: 20,
      updatedBy: admin._id
    });

    // 6. Generate 7 days of sensor readings (4 per day)
    console.log('Generating 7 days of historical readings...');
    const readings = [];
    const pumpLogs = [];
    const now = new Date();

    // Hours of readings: 06:00, 12:00, 18:00, 22:00
    const readingHours = [6, 12, 18, 22];

    for (let dayOffset = 6; dayOffset >= 0; dayOffset--) {
      const currentDate = new Date(now);
      currentDate.setDate(now.getDate() - dayOffset);

      for (const hour of readingHours) {
        const timestamp = new Date(currentDate);
        timestamp.setHours(hour, 0, 0, 0);

        // Daily cyclical variations
        let baseMoisture, baseTemp, baseHum;

        if (hour === 6) { // Cool morning
          baseMoisture = 58;
          baseTemp = 19;
          baseHum = 75;
        } else if (hour === 12) { // Midday dry/hot
          baseMoisture = 42;
          baseTemp = 33;
          baseHum = 38;
        } else if (hour === 18) { // Evening dry/cool
          baseMoisture = 28; // Below 30% minMoisture, triggers pump ON
          baseTemp = 27;
          baseHum = 48;
        } else { // Night cool
          baseMoisture = 68; // Wet after pump sequence or night dew
          baseTemp = 21;
          baseHum = 65;
        }

        // Add some random noise
        const moistureNoise = (Math.random() - 0.5) * 4;
        const tempNoise = (Math.random() - 0.5) * 3;
        const humNoise = (Math.random() - 0.5) * 5;

        const soilMoisture = Math.max(0, Math.min(100, Math.round(baseMoisture + moistureNoise)));
        const temperature = Math.max(0, Math.min(60, Math.round(baseTemp + tempNoise)));
        const humidity = Math.max(0, Math.min(100, Math.round(baseHum + humNoise)));

        readings.push({
          farmId: farm._id,
          soilMoisture,
          temperature,
          humidity,
          inputMethod: 'manual',
          enteredBy: farmer._id,
          timestamp,
          notes: hour === 18 ? 'Field looks slightly dry' : 'Standard reading'
        });

        // Simulate pump activities based on moisture trigger
        // If moisture goes below 30 (which occurs at 18:00), turn ON. 
        // Then at 22:00, soil moisture rises back to 68, indicating pump was turned OFF.
        if (hour === 18 && soilMoisture < 30) {
          const pumpOnTime = new Date(timestamp);
          pumpOnTime.setMinutes(10); // 18:10

          pumpLogs.push({
            farmId: farm._id,
            action: 'ON',
            triggeredBy: null, // auto trigger
            triggerType: 'auto',
            duration: null,
            timestamp: pumpOnTime,
            notes: `Soil moisture (${soilMoisture}%) fell below minMoisture (30%). Pump auto-started.`
          });

          // Pump turns OFF after 35 minutes
          const pumpOffTime = new Date(timestamp);
          pumpOffTime.setMinutes(45); // 18:45

          pumpLogs.push({
            farmId: farm._id,
            action: 'OFF',
            triggeredBy: null, // auto trigger
            triggerType: 'auto',
            duration: 35,
            timestamp: pumpOffTime,
            notes: 'Soil moisture restored. Pump auto-stopped.'
          });
        }
      }
    }

    await SensorReading.insertMany(readings);
    console.log(`Successfully seeded ${readings.length} sensor readings.`);

    await PumpLog.insertMany(pumpLogs);
    console.log(`Successfully seeded ${pumpLogs.length} pump logs.`);

    // 7. Seed one active alert for the last day if it's below threshold, or keep empty
    // Let's create an unresolved warning alert to show on dashboards
    console.log('Creating sample unresolved alert...');
    await Alert.create({
      farmId: farm._id,
      type: 'low_moisture',
      severity: 'warning',
      message: 'Warning: Soil moisture is low at 29%. Minimum threshold is 30%.',
      isResolved: false
    });
    console.log('Seed warning alert created.');

    console.log('Database seeding finished successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed with error:', err.message);
    process.exit(1);
  }
};

seedData();

/**
 * One-time migration script.
 * Marks all existing users who have a password set as isVerified = true,
 * so they are not asked for OTP on every login.
 *
 * Run once with: node scripts/markExistingUsersVerified.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Mark every user who has a password (i.e., registered users) as verified
    const result = await User.updateMany(
      { isVerified: { $ne: true } },
      { $set: { isVerified: true } }
    );

    console.log(`✅ Marked ${result.modifiedCount} users as verified.`);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

run();

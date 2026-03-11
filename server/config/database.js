const mongoose = require('mongoose');
const colors = require('colors');
const { queryDefaultsPlugin } = require('../plugins/queryDefaults');

const connectDB = async () => {
  try {
    // Phase 1 P0: Apply global query safety to limit unbounded queries to 100 documents
    mongoose.plugin(require('../plugins/queryDefaults'));

    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecokids', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      autoIndex: process.env.NODE_ENV !== 'production', // Phase 5: Disable autoIndex in production
      maxPoolSize: 50, // Per audit requirement
      minPoolSize: 10, // Per audit requirement
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`🍃 MongoDB Connected: ${conn.connection.host}`.green.bold);
  } catch (error) {
    console.error(`❌ Database connection error: ${error.message}`.red.bold);
    console.log('⚠️  Running in development mode without database connection'.yellow.bold);
    // Don't exit in development mode, allow the server to continue running
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
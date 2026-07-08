const mongoose = require('mongoose');

// Retry the initial connection instead of crashing on the first hiccup.
// Atlas can be briefly unreachable (network blips, cold cluster); a hard
// exit turns a transient timeout into downtime.
const connectDB = async (retries = 5, delayMs = 5000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      console.error(
        `MongoDB connection attempt ${attempt}/${retries} failed: ${error.message}`
      );
      if (attempt === retries) {
        console.error('All MongoDB connection attempts failed. Exiting.');
        process.exit(1);
      }
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
};

// Once connected, let the driver auto-reconnect on later drops rather than
// letting an unhandled error bubble up and kill the process.
mongoose.connection.on('error', (err) => {
  console.error(`MongoDB runtime error: ${err.message}`);
});
mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected — driver will attempt to reconnect.');
});

module.exports = connectDB;

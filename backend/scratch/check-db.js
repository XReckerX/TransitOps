const mongoose = require('mongoose');

async function check() {
  try {
    console.log('Connecting to mongodb://localhost:27017/transitops...');
    await mongoose.connect('mongodb://localhost:27017/transitops', { serverSelectionTimeoutMS: 2000 });
    console.log('MongoDB Connected successfully!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  }
}

check();

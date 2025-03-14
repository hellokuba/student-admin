// Script to reset the admin password
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/student_admin')
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Define User schema
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: String,
  name: String,
  email: String,
  phone: String,
  status: Boolean
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// New password to set
const newPassword = 'admin123';

async function resetAdminPassword() {
  try {
    // Find admin user
    const adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      console.log('No admin user found. Creating a new admin user...');
      
      // Create a new admin user if none exists
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      const newAdmin = new User({
        username: 'admin',
        password: hashedPassword,
        role: 'admin',
        name: 'System Administrator',
        email: 'admin@example.com',
        phone: '12345678900',
        status: true
      });
      
      await newAdmin.save();
      console.log('New admin user created:');
      console.log(`Username: admin`);
      console.log(`Password: ${newPassword}`);
    } else {
      // Update existing admin user password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      adminUser.password = hashedPassword;
      await adminUser.save();
      
      console.log('Admin password reset successful:');
      console.log(`Username: ${adminUser.username}`);
      console.log(`Password: ${newPassword}`);
    }
    
    mongoose.disconnect();
  } catch (error) {
    console.error('Error resetting admin password:', error);
    mongoose.disconnect();
    process.exit(1);
  }
}

resetAdminPassword(); 
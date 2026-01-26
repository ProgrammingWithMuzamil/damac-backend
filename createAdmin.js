import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/userModel.js';

// Load environment variables
dotenv.config();

const mongoURI = process.env.MONGODB_URI;

async function createAdminUser() {
    try {
        // Connect to MongoDB
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'admin@damac.com' });
        if (existingAdmin) {
            console.log('Admin user already exists!');
            console.log('Email: admin@damac.com');
            console.log('You can use this account to login to AdminJS panel.');
            process.exit(0);
        }

        // Create admin user
        const admin = new User({
            name: 'Admin User',
            email: 'admin@damac.com',
            password: 'admin123', // This will be hashed by the pre-save hook
            role: 'admin'
        });

        await admin.save();
        console.log('Admin user created successfully!');
        console.log('Email: admin@damac.com');
        console.log('Password: admin123');
        console.log('\nYou can now login to the AdminJS panel at http://localhost:8000/admin');
        
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin user:', error);
        process.exit(1);
    }
}

createAdminUser();

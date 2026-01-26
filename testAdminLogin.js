import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/userModel.js';

dotenv.config();

const mongoURI = process.env.MONGODB_URI;

async function testAdminLogin() {
    try {
        await mongoose.connect(mongoURI);
        console.log('✅ Connected to MongoDB\n');

        const email = 'admin@damac.com';
        const password = 'admin123';

        console.log(`Testing login for: ${email}`);
        console.log(`Password: ${password}\n`);

        const user = await User.findOne({ email });
        
        if (!user) {
            console.log('❌ User not found!');
            process.exit(1);
        }

        console.log('✅ User found:');
        console.log(`   Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Password hash: ${user.password.substring(0, 20)}...\n`);

        if (user.role !== 'admin') {
            console.log('❌ User is not an admin!');
            process.exit(1);
        }

        const isValid = await user.comparePassword(password);
        
        if (isValid) {
            console.log('✅ Password is valid!');
            console.log('✅ Admin login should work!\n');
        } else {
            console.log('❌ Password is invalid!');
            console.log('   Try running: npm run create-admin\n');
            process.exit(1);
        }

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

testAdminLogin();

import { Sequelize, DataTypes } from 'sequelize';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Sequelize Database Setup
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './damac.db',
    logging: false
});

// Define User model (same as in server.js)
const User = sequelize.define('User', {
    name: DataTypes.STRING,
    email: { type: DataTypes.STRING, unique: true },
    password: DataTypes.STRING,
    role: { type: DataTypes.STRING, defaultValue: 'user' }
}, {
    timestamps: true
});

async function createDefaultUser() {
    try {
        // Connect to database
        await sequelize.authenticate();
        console.log('Connected to SQLite database');

        // Sync tables
        await sequelize.sync({ force: false });

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email: 'user@damac.com' } });
        if (existingUser) {
            console.log('Default user already exists!');
            console.log('Email: user@damac.com');
            console.log('Password: user123');
            process.exit(0);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash('user123', 10);

        // Create default user
        const user = await User.create({
            name: 'Default User',
            email: 'user@damac.com',
            password: hashedPassword,
            role: 'user'
        });

        console.log('Default user created successfully!');
        console.log('Email: user@damac.com');
        console.log('Password: user123');
        console.log('\nYou can use this account for regular user access.');

        process.exit(0);
    } catch (error) {
        console.error('Error creating default user:', error);
        process.exit(1);
    }
}

createDefaultUser();

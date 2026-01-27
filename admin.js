import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import { Database, Resource } from '@adminjs/mongoose';
import uploadFeature from '@adminjs/upload';
import mongoose from 'mongoose';
import express from 'express';
import session from 'express-session';
import { ComponentLoader } from 'adminjs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import User from './models/userModel.js';
import Collaboration from './models/collaborationModel.js';
import cardModel from './models/cardModel.js';
import cardYourPerfectModel from './models/cardYourPerfectModel.js';
import propertyModel from './models/propertyModel.js';
import slideModel from './models/slideModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const componentLoader = new ComponentLoader();


// Register AdminJS adapter
AdminJS.registerAdapter({
    Resource: Resource,
    Database: Database,
});

// AdminJS configuration
const adminOptions = {
    componentLoader,
    resources: [
        {
            resource: User,
            options: {
                navigation: { name: 'Users', icon: 'User' },
                listProperties: ['name', 'email', 'role'],
                editProperties: ['name', 'email', 'role', 'password'],
                properties: {
                    password: {
                        type: 'string',
                        isVisible: { list: false, filter: false, show: true, edit: true },
                    },
                },
            },
        },
        {
            resource: Collaboration,
            options: {
                navigation: { name: 'Collaborations', icon: 'Collaboration' },
                listProperties: ['title', 'desc', 'img', 'logo'],
                editProperties: ['uploadImg', 'uploadLogo', 'title', 'desc'],
                properties: {
                    img: {
                        isVisible: { list: true, filter: true, show: true, edit: false },
                    },
                    logo: {
                        isVisible: { list: true, filter: true, show: true, edit: false },
                    },
                },
            },
            features: [
                uploadFeature({
                    componentLoader,
                    provider: {
                        local: {
                            bucket: path.join(__dirname, 'uploads'),
                        },
                    },
                    properties: {
                        file: 'uploadImg',
                        key: 'img',
                    },
                    uploadPath: (record, filename) => `uploads/${filename}`,
                }),
                uploadFeature({
                    componentLoader,
                    provider: {
                        local: {
                            bucket: path.join(__dirname, 'uploads'),
                        },
                    },
                    properties: {
                        file: 'uploadLogo',
                        key: 'logo',
                    },
                    uploadPath: (record, filename) => `uploads/${filename}`,
                }),
            ],
        },
        {
            resource: cardModel,
            options: {
                navigation: { name: 'Cards', icon: 'Card' },
                listProperties: ['title', 'desc', 'img', 'createdAt'],
                editProperties: ['uploadImg', 'title', 'desc'],
                properties: {
                    img: {
                        isVisible: { list: true, filter: true, show: true, edit: false },
                    },
                },
            },
            features: [
                uploadFeature({
                    componentLoader,
                    provider: {
                        local: {
                            bucket: path.join(__dirname, 'uploads'),
                        },
                    },
                    properties: {
                        file: 'uploadImg',
                        key: 'img',
                    },
                    uploadPath: (record, filename) => `uploads/${filename}`,
                }),
            ],
        },
        {
            resource: cardYourPerfectModel,
            options: {
                navigation: { name: 'Your Perfect Cards', icon: 'Card' },
                listProperties: ['title', 'price', 'img', 'createdAt'],
                editProperties: ['uploadImg', 'title', 'price'],
                properties: {
                    img: {
                        isVisible: { list: true, filter: true, show: true, edit: false },
                    },
                },
            },
            features: [
                uploadFeature({
                    componentLoader,
                    provider: {
                        local: {
                            bucket: path.join(__dirname, 'uploads'),
                        },
                    },
                    properties: {
                        file: 'uploadImg',
                        key: 'img',
                    },
                    uploadPath: (record, filename) => `uploads/${filename}`,
                }),
            ],
        },
        {
            resource: propertyModel,
            options: {
                navigation: { name: 'Properties', icon: 'Property' },
                listProperties: ['title', 'location', 'price', 'img', 'createdAt'],
                editProperties: ['uploadImg', 'title', 'location', 'price'],
                properties: {
                    img: {
                        isVisible: { list: true, filter: true, show: true, edit: false },
                    },
                },
            },
            features: [
                uploadFeature({
                    componentLoader,
                    provider: {
                        local: {
                            bucket: path.join(__dirname, 'uploads'),
                        },
                    },
                    properties: {
                        file: 'uploadImg',
                        key: 'img',
                    },
                    uploadPath: (record, filename) => `uploads/${filename}`,
                }),
            ],
        },
        {
            resource: slideModel,
            options: {
                navigation: { name: 'Slides', icon: 'Slide' },
                listProperties: ['title', 'location', 'img', 'createdAt'],
                editProperties: ['uploadImg', 'title', 'location', 'points'],
                properties: {
                    img: {
                        isVisible: { list: true, filter: true, show: true, edit: false },
                    },
                },
            },
            features: [
                uploadFeature({
                    componentLoader,
                    provider: {
                        local: {
                            bucket: path.join(__dirname, 'uploads'),
                        },
                    },
                    properties: {
                        file: 'uploadImg',
                        key: 'img',
                    },
                    uploadPath: (record, filename) => `uploads/${filename}`,
                }),
            ],
        },
    ],
    rootPath: '/admin',
    branding: {
        companyName: 'DAMAC Admin Panel',
        logo: false,
    },
};

// Initialize AdminJS
const admin = new AdminJS(adminOptions);

// Session secret
const sessionSecret = process.env.ADMIN_COOKIE_SECRET || 'some-very-long-secret-password-that-is-at-least-32-characters-long-for-security-purposes-12345';

// Authentication function
const authenticate = async (email, password) => {
    try {
        console.log(`\n🔐 [${new Date().toISOString()}] Login attempt: ${email}`);

        if (!email || !password) {
            console.log('❌ Missing credentials');
            return null;
        }

        if (mongoose.connection.readyState !== 1) {
            console.error('❌ MongoDB not connected');
            return null;
        }

        const user = await User.findOne({ email: email.trim().toLowerCase() });

        if (!user) {
            console.log(`❌ User not found: ${email}`);
            return null;
        }

        if (user.role !== 'admin') {
            console.log(`❌ Not an admin user. Role: ${user.role}`);
            return null;
        }

        const isValid = await user.comparePassword(password);

        if (!isValid) {
            console.log(`❌ Invalid password for: ${email}`);
            return null;
        }

        console.log(`✅ Login successful: ${email}\n`);

        // Return the full user object (AdminJS expects Mongoose document)
        return user;
    } catch (error) {
        console.error('❌ Auth error:', error.message);
        return null;
    }
};

// Create router
const router = express.Router();

// Session configuration
const sessionConfig = {
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    name: 'adminjs.sid',
    cookie: {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
    },
};

// Build authenticated router
const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
    admin,
    {
        authenticate: authenticate,
        cookiePassword: sessionSecret,
    },
    router,
    sessionConfig
);

export default adminRouter;

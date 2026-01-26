import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import { Database, Resource } from '@adminjs/mongoose';
import mongoose from 'mongoose';
import User from './models/userModel.js';
import Collaboration from './models/collaborationModel.js';

// Register Mongoose adapter
AdminJS.registerAdapter({
    Resource: Resource,
    Database: Database,
});

// AdminJS options
const adminOptions = {
    resources: [
        {
            resource: User,
            options: {
                navigation: {
                    name: 'Users',
                    icon: 'User',
                },
                listProperties: ['name', 'email', 'role'],
                editProperties: ['name', 'email', 'role', 'password'],
                properties: {
                    password: {
                        type: 'string',
                        isVisible: {
                            list: false,
                            filter: false,
                            show: true,
                            edit: true,
                        },
                    },
                },
            },
        },
        {
            resource: Collaboration,
            options: {
                navigation: {
                    name: 'Collaborations',
                    icon: 'Collaboration',
                },
                listProperties: ['title', 'desc', 'img', 'logo'],
                editProperties: ['img', 'logo', 'title', 'desc'],
                properties: {
                    img: {
                        type: 'string',
                        isVisible: {
                            list: true,
                            filter: false,
                            show: true,
                            edit: true,
                        },
                    },
                    logo: {
                        type: 'string',
                        isVisible: {
                            list: true,
                            filter: false,
                            show: true,
                            edit: true,
                        },
                    },
                    title: {
                        type: 'string',
                        isVisible: {
                            list: true,
                            filter: true,
                            show: true,
                            edit: true,
                        },
                    },
                    desc: {
                        type: 'string',
                        isVisible: {
                            list: true,
                            filter: false,
                            show: true,
                            edit: true,
                        },
                    },
                },
            },
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

// AdminJS login configuration
const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
    admin,
    {
        authenticate: async (email, password) => {
            try {
                const user = await User.findOne({ email });
                if (!user || user.role !== 'admin') {
                    return null;
                }
                
                const isPasswordValid = await user.comparePassword(password);
                if (!isPasswordValid) {
                    return null;
                }
                
                // Return user object - AdminJS expects the Mongoose document
                return user;
            } catch (error) {
                console.error('Authentication error:', error);
                return null;
            }
        },
        cookiePassword: 'some-very-long-secret-password-that-is-at-least-32-characters-long-for-security-purposes-12345',
    },
    null,
    {
        resave: false,
        saveUninitialized: true,
    }
);

export default adminRouter;

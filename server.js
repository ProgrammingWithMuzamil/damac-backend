import express from 'express';
import { User, Property, Collaboration, Slide, YourPerfect, SidebarCard, DAMAC, EmpoweringCommunities, sequelize } from './models.js';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import authRoutes from './routes/authRoute.js';
import userRoutes from './routes/usersRoute.js';
import contactRoutes from './routes/contactRoute.js';
import collaborationRoutes from './routes/collaborationsRoute.js';
import propertyRoutes from './routes/propertiesRoute.js';
import slideRoutes from './routes/slidesRoute.js';
import yourperfectRoutes from './routes/yourperfectRoute.js';
import sidebarcardRoutes from './routes/sidebarcardRoute.js';
import damacRoutes from './routes/damacRoute.js';
import empoweringCommunitiesRoutes from './routes/empoweringCommunitiesRoute.js';
import bodyParser from 'body-parser';
import publicGetMiddleware from './middlewares/publicGet.js';
import imageUrlsMiddleware from './middlewares/imageUrls.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env' });

const app = express();
const port = process.env.PORT || 3001;

// Initialize Database
async function initializeDatabase() {
    try {
        await sequelize.authenticate();
        console.log('✅ SQLite database connected successfully');

        // Auto-create tables with sync (force: false to preserve data)
        await sequelize.sync({ force: false });
        console.log('✅ Database tables synchronized');

        // Create admin user if not exists
        await createAdminUser();

        // Make models available globally
        global.db = {
            User,
            Property,
            Collaboration,
            Slide,
            YourPerfect,
            SidebarCard,
            DAMAC,
            EmpoweringCommunities,
            sequelize
        };

    } catch (err) {
        console.error('❌ Database connection error:', err);
    }
}

// Create admin user function
async function createAdminUser() {
    try {
        // Remove all existing users first
        await User.destroy({ where: {} });
        console.log('🗑️  Removed all existing users');

        // Create only the specified admin user
        const bcrypt = await import('bcrypt');
        const hashedPassword = await bcrypt.hash('Ipoint@2025', 10);

        await User.create({
            name: 'iland',
            email: 'ipointsales03@gmail.com',
            password: hashedPassword,
            role: 'admin'
        });

        console.log('✅ Admin user created successfully');
        console.log('   Email: ipointsales03@gmail.com');
        console.log('   Password: Ipoint@2025');

    } catch (error) {
        console.error('❌ Error creating admin user:', error);
    }
}

initializeDatabase();

// Production middleware
if (process.env.NODE_ENV === 'production') {
    app.use(compression());
    app.use(morgan('combined'));
} else {
    app.use(morgan('dev'));
}

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "http:", "https:"],
            connectSrc: ["'self'", "https://ilandpropertiesdashboard.vercel.app", "https://damac-backend.onrender.com"]
        },
    },
    crossOriginEmbedderPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Always allow these trusted origins regardless of environment
        const allowedOrigins = [
            'https://ilandpropertiesdashboard.vercel.app',
            'https://damac-backend.onrender.com'
        ];

        if (allowedOrigins.indexOf(origin) !== -1) {
            return callback(null, true);
        }

        if (process.env.NODE_ENV === 'production') {
            // In production, reject unknown origins
            return callback(new Error('Not allowed by CORS'));
        }

        // In development, allow other origins for convenience
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cookie'],
    exposedHeaders: ['Set-Cookie'],
    optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

// Handle preflight requests
app.options('*', cors(corsOptions));

// Apply CORS middleware
app.use(cors(corsOptions));

// Serve static files with proper MIME types and CORS headers
app.use('/uploads', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
}, express.static(path.join(__dirname, 'uploads'), {
    setHeaders: (res, filePath) => {
        // Set proper MIME types for images
        if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
            res.setHeader('Content-Type', 'image/jpeg');
        } else if (filePath.endsWith('.png')) {
            res.setHeader('Content-Type', 'image/png');
        } else if (filePath.endsWith('.gif')) {
            res.setHeader('Content-Type', 'image/gif');
        } else if (filePath.endsWith('.webp')) {
            res.setHeader('Content-Type', 'image/webp');
        }
    }
}));

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

app.use((req, res, next) => {
    if (req.path.includes('/admin')) {
        console.log(`📥 [${new Date().toISOString()}] ${req.method} ${req.path}`);
    }
    next();
});

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        database: sequelize ? 'connected' : 'disconnected',
        type: 'sequelize-sqlite',
        timestamp: new Date().toISOString()
    });
});

// Demo CRUD operations with Sequelize
app.get('/api/demo', async (req, res) => {
    try {
        // CREATE - Auto-generates INSERT
        const user = await User.create({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'hashedpassword',
            role: 'user'
        });

        // READ ALL - Auto-generates SELECT
        const allUsers = await User.findAll();

        // READ ONE - Auto-generates SELECT with WHERE
        const foundUser = await User.findByPk(user.id);

        // UPDATE - Auto-generates UPDATE
        await user.update({ name: 'John Updated' });

        // DELETE - Auto-generates DELETE
        // await user.destroy();

        res.json({
            message: 'Sequelize CRUD demo successful',
            created: user,
            allUsers: allUsers.length,
            foundUser: foundUser.name,
            updated: user.name
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Apply routes with middleware
app.use('/api', authRoutes);
app.use('/api/contact', contactRoutes); // Public contact form endpoint
app.use('/api/users', userRoutes); // User management requires authentication
app.use('/api/properties', imageUrlsMiddleware, publicGetMiddleware, propertyRoutes); // GET requests are public
app.use('/api/collaborations', imageUrlsMiddleware, publicGetMiddleware, collaborationRoutes); // GET requests are public
app.use('/api/slides', imageUrlsMiddleware, publicGetMiddleware, slideRoutes); // GET requests are public
app.use('/api/yourperfect', imageUrlsMiddleware, publicGetMiddleware, yourperfectRoutes); // GET requests are public
app.use('/api/sidebarcard', imageUrlsMiddleware, publicGetMiddleware, sidebarcardRoutes); // GET requests are public
app.use('/api/damac', imageUrlsMiddleware, publicGetMiddleware, damacRoutes); // GET requests are public
app.use('/api/empoweringcommunities', imageUrlsMiddleware, publicGetMiddleware, empoweringCommunitiesRoutes); // GET requests are public

app.use((err, req, res, next) => {
    console.error('❌ Error:', err.message);
    console.error('Stack:', err.stack);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error'
    });
});

app.listen(port, () => {
    console.log(`\n🚀 Server is running on port: ${port}`);
    console.log(` Health Check: http://localhost:${port}/health\n`);
});

// Export models for use in other files
export { User, Property, Collaboration, sequelize };

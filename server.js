import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import userRoutes from './routes/userRoute.js';
import collaborationRoutes from './routes/collaborationRoute.js';
import cardRoutes from './routes/cardRoute.js';
import propertyRoutes from './routes/propertyRoute.js';
import adminRouter from './admin.js';
import slideRoutes from './routes/slideRoute.js';
import cardYourPerfectModel from "./routes/cardYourPerfectRoute.js";
import bodyParser from 'body-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const mongoURI = process.env.MONGODB_URI;

console.log('Mongo URI:', mongoURI);
mongoose.connect("mongodb+srv://muzamildeveloper750_db_user:VdQ2s1YTXaKiDIn3@cluster0.0oc8ri1.mongodb.net/")
    .then(() => {
        console.log('✅ MongoDB connected successfully');
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err);
        if (err.message.includes('whitelist') || err.message.includes('IP')) {
            console.error('\n⚠️  IP Whitelist Issue Detected!');
            console.error('📝 To fix this:');
            console.error('1. Go to MongoDB Atlas: https://cloud.mongodb.com/');
            console.error('2. Navigate to: Network Access → Add IP Address');
            console.error('3. Click "Add Current IP Address" or add 0.0.0.0/0 (allow all IPs - less secure)');
            console.error('4. Wait a few minutes for changes to propagate\n');
        }
    });

mongoose.connection.on('disconnected', () => {
    console.log('⚠️  MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB error:', err);
});

app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cookie'],
    exposedHeaders: ['Set-Cookie'],
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

app.use((req, res, next) => {
    if (req.path.includes('/admin')) {
        console.log(`📥 [${new Date().toISOString()}] ${req.method} ${req.path}`);
    }
    next();
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
    });
});

app.use('/api', userRoutes);
app.use('/api/', collaborationRoutes);
app.use('/api/', cardRoutes);
app.use('/api/', propertyRoutes);
app.use('/api/', slideRoutes);
app.use('/api/', cardYourPerfectModel);

app.use('/admin', adminRouter);

app.use((err, req, res, next) => {
    console.error('❌ Error:', err.message);
    console.error('Stack:', err.stack);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error'
    });
});

app.listen(port, () => {
    console.log(`\n🚀 Server is running on port: ${port}`);
    console.log(`📊 Admin Panel: http://localhost:${port}/admin`);
    console.log(`💚 Health Check: http://localhost:${port}/health\n`);
});

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

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const mongoURI = process.env.MONGODB_URI;

// Connect to MongoDB
mongoose.connect(mongoURI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB connection error:', err));

app.use(cors({
    origin: true,
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api', userRoutes);
app.use('/api/collaboration', collaborationRoutes);
app.use('/admin', adminRouter);
app.use('/api/card', cardRoutes);
app.use('/api/property', propertyRoutes);
app.use('/api/slide', slideRoutes);
app.use('/api/cardYourPerfect', cardYourPerfectModel);
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});

import express from 'express';
import upload from '../middlewares/uploadMiddleware.js'; // Import multer upload middleware
import {
    createProperty,
    getProperties,
    getPropertyById,
    updateProperty,
    deleteProperty
} from '../controllers/propertyController.js';

const router = express.Router();

// Route to create a new property with image upload
router.post('/properties', upload.single('img'), createProperty);

// Route to get all properties
router.get('/properties', getProperties);

// Route to get a property by ID
router.get('/properties/:id', getPropertyById);

// Route to update a property by ID with image upload
router.put('/properties/:id', upload.single('img'), updateProperty);

// Route to delete a property by ID
router.delete('/properties/:id', deleteProperty);

export default router;

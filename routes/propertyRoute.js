import express from 'express';
import upload from '../middlewares/uploadMiddleware.js';
import {
    createProperty,
    getProperties,
    getPropertyById,
    updateProperty,
    deleteProperty
} from '../controllers/propertyController.js';

const router = express.Router();

router.post('/properties', upload.single('img'), createProperty);

router.get('/properties', getProperties);

router.get('/properties/:id', getPropertyById);

router.put('/properties/:id', upload.single('img'), updateProperty);

router.delete('/properties/:id', deleteProperty);

export default router;

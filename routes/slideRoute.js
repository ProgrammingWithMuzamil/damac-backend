import express from 'express';
import upload from '../middlewares/uploadMiddleware.js'; // Import multer upload middleware
import {
    createSlide,
    getSlides,
    getSlideById,
    updateSlide,
    deleteSlide
} from '../controllers/slideController.js';

const router = express.Router();

// Route to create a new slide with image upload
router.post('/slides', upload.single('img'), createSlide);

// Route to get all slides
router.get('/slides', getSlides);

// Route to get a slide by ID
router.get('/slides/:id', getSlideById);

// Route to update a slide by ID with image upload
router.put('/slides/:id', upload.single('img'), updateSlide);

// Route to delete a slide by ID
router.delete('/slides/:id', deleteSlide);

export default router;

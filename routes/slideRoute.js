import express from 'express';
import upload from '../middlewares/uploadMiddleware.js';
import {
    createSlide,
    getSlides,
    getSlideById,
    updateSlide,
    deleteSlide
} from '../controllers/slideController.js';

const router = express.Router();

router.post('/slides', upload.single('img'), createSlide);

router.get('/slides', getSlides);

router.get('/slides/:id', getSlideById);

router.put('/slides/:id', upload.single('img'), updateSlide);

router.delete('/slides/:id', deleteSlide);

export default router;

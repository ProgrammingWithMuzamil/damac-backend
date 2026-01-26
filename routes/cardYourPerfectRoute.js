import express from 'express';
import upload from '../middlewares/uploadMiddleware.js'; // Import multer upload middleware
import {
    createCardYourPerfect,
    getCardsYourPerfect,
    getCardYourPerfectById,
    updateCardYourPerfect,
    deleteCardYourPerfect
} from '../controllers/cardYourPerfectController.js';

const router = express.Router();

// Route to create a new card with image upload
router.post('/cards-your-perfect', upload.single('img'), createCardYourPerfect);

// Route to get all cards
router.get('/cards-your-perfect', getCardsYourPerfect);

// Route to get a card by ID
router.get('/cards-your-perfect/:id', getCardYourPerfectById);

// Route to update a card by ID with image upload
router.put('/cards-your-perfect/:id', upload.single('img'), updateCardYourPerfect);

// Route to delete a card by ID
router.delete('/cards-your-perfect/:id', deleteCardYourPerfect);

export default router;

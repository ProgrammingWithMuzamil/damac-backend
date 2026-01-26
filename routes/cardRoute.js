import express from 'express';
import upload from '../middlewares/uploadMiddleware.js'; // Import multer upload middleware
import {
    createCard,
    getCards,
    getCardById,
    updateCard,
    deleteCard
} from '../controllers/cardController.js';

const router = express.Router();

// Route to create a new card with image upload
router.post('/cards', upload.single('img'), createCard);

// Route to get all cards
router.get('/cards', getCards);

// Route to get a card by ID
router.get('/cards/:id', getCardById);

// Route to update a card by ID with image upload
router.put('/cards/:id', upload.single('img'), updateCard);

// Route to delete a card by ID
router.delete('/cards/:id', deleteCard);

export default router;

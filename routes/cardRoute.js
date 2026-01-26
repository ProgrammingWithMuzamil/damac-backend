import express from 'express';
import upload from '../middlewares/uploadMiddleware.js';
import {
    createCard,
    getCards,
    getCardById,
    updateCard,
    deleteCard
} from '../controllers/cardController.js';

const router = express.Router();

router.post('/cards', upload.single('img'), createCard);

router.get('/cards', getCards);

router.get('/cards/:id', getCardById);

router.put('/cards/:id', upload.single('img'), updateCard);

router.delete('/cards/:id', deleteCard);

export default router;

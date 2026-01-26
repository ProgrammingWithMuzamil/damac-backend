import express from 'express';
import upload from '../middlewares/uploadMiddleware.js';
import {
    createCardYourPerfect,
    getCardsYourPerfect,
    getCardYourPerfectById,
    updateCardYourPerfect,
    deleteCardYourPerfect
} from '../controllers/cardYourPerfectController.js';

const router = express.Router();

router.post('/cards-your-perfect', upload.single('img'), createCardYourPerfect);

router.get('/cards-your-perfect', getCardsYourPerfect);

router.get('/cards-your-perfect/:id', getCardYourPerfectById);

router.put('/cards-your-perfect/:id', upload.single('img'), updateCardYourPerfect);

router.delete('/cards-your-perfect/:id', deleteCardYourPerfect);

export default router;

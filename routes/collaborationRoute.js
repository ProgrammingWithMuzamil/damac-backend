import express from 'express';
import upload from '../middlewares/uploadMiddleware.js';
import {
    createCollaboration,
    getCollaborations,
    getCollaborationById,
    updateCollaboration,
    deleteCollaboration
} from '../controllers/collaborationController.js';

const router = express.Router();

router.post('/collaborations', upload.fields([{ name: 'img', maxCount: 1 }, { name: 'logo', maxCount: 1 }]), createCollaboration);

router.get('/collaborations', getCollaborations);

router.get('/collaborations/:id', getCollaborationById);

router.put('/collaborations/:id', upload.fields([{ name: 'img', maxCount: 1 }, { name: 'logo', maxCount: 1 }]), updateCollaboration);

router.delete('/collaborations/:id', deleteCollaboration);

export default router;

import express from 'express';
import upload from '../middlewares/uploadMiddleware.js'; // Import multer upload middleware
import { createCollaboration, getCollaborations, updateCollaboration, deleteCollaboration } from '../controllers/collaborationController.js';

const router = express.Router();

// Route to create a new collaboration with image and logo upload
router.post('/collaborations', upload.fields([{ name: 'img', maxCount: 1 }, { name: 'logo', maxCount: 1 }]), createCollaboration);
router.get('/collaborations', getCollaborations);
router.put('/collaborations/:id', upload.fields([{ name: 'img', maxCount: 1 }, { name: 'logo', maxCount: 1 }]), updateCollaboration);
router.delete('/collaborations/:id', deleteCollaboration);

export default router;

import express from 'express';
import upload from '../middlewares/uploadMiddleware.js'; // Import the multer upload middleware
import {
    createCollaboration,
    getCollaborations,
    getCollaborationById,
    updateCollaboration,
    deleteCollaboration
} from '../controllers/collaborationController.js';

const router = express.Router();

// Route to create a new collaboration with image and logo upload
router.post('/collaborations', upload.fields([{ name: 'img', maxCount: 1 }, { name: 'logo', maxCount: 1 }]), createCollaboration);

// Route to get all collaborations
router.get('/collaborations', getCollaborations);

// Route to get a collaboration by ID
router.get('/collaborations/:id', getCollaborationById);

// Route to update a collaboration by ID with image and logo upload
router.put('/collaborations/:id', upload.fields([{ name: 'img', maxCount: 1 }, { name: 'logo', maxCount: 1 }]), updateCollaboration);

// Route to delete a collaboration by ID
router.delete('/collaborations/:id', deleteCollaboration);

export default router;

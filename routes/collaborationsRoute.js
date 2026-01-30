import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Collaboration } from '../models.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/collaborations'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
    }
  }
});

// Get all collaborations
router.get('/', async (req, res) => {
  try {
    const collaborations = await Collaboration.findAll({
      order: [['createdAt', 'DESC']]
    });
    
    const cleanCollaborations = collaborations.map(collab => ({
      id: collab.id,
      img: collab.img,
      logo: collab.logo,
      title: collab.title,
      desc: collab.desc,
      createdAt: collab.createdAt ? collab.createdAt.toISOString() : null,
      updatedAt: collab.updatedAt ? collab.updatedAt.toISOString() : null
    }));
    
    res.json(cleanCollaborations);
  } catch (error) {
    console.error('Get collaborations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get collaboration by ID
router.get('/:id', async (req, res) => {
  try {
    const collaboration = await Collaboration.findByPk(req.params.id);
    
    if (!collaboration) {
      return res.status(404).json({ message: 'Collaboration not found' });
    }
    
    const cleanCollaboration = {
      id: collaboration.id,
      img: collaboration.img,
      logo: collaboration.logo,
      title: collaboration.title,
      desc: collaboration.desc,
      createdAt: collaboration.createdAt ? collaboration.createdAt.toISOString() : null,
      updatedAt: collaboration.updatedAt ? collaboration.updatedAt.toISOString() : null
    };
    
    res.json(cleanCollaboration);
  } catch (error) {
    console.error('Get collaboration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create collaboration
router.post('/', upload.fields([{ name: 'img', maxCount: 1 }, { name: 'logo', maxCount: 1 }]), async (req, res) => {
  try {
    const { title, desc } = req.body;

    if (!title || !desc) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    let imgPath = '';
    let logoPath = '';

    // Handle image upload
    if (req.files && req.files.img && req.files.img[0]) {
      imgPath = `/uploads/collaborations/${req.files.img[0].filename}`;
    } else if (req.body.img) {
      imgPath = req.body.img.trim();
    } else {
      return res.status(400).json({ message: 'Image is required' });
    }

    // Handle logo upload
    if (req.files && req.files.logo && req.files.logo[0]) {
      logoPath = `/uploads/collaborations/${req.files.logo[0].filename}`;
    } else if (req.body.logo) {
      logoPath = req.body.logo.trim();
    } else {
      return res.status(400).json({ message: 'Logo is required' });
    }

    const collaboration = await Collaboration.create({
      img: imgPath,
      logo: logoPath,
      title: title.trim(),
      desc: desc.trim()
    });

    const cleanCollaboration = {
      id: collaboration.id,
      img: collaboration.img,
      logo: collaboration.logo,
      title: collaboration.title,
      desc: collaboration.desc,
      createdAt: collaboration.createdAt ? collaboration.createdAt.toISOString() : null,
      updatedAt: collaboration.updatedAt ? collaboration.updatedAt.toISOString() : null
    };
    
    res.status(201).json(cleanCollaboration);
  } catch (error) {
    console.error('Create collaboration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update collaboration
router.put('/:id', upload.fields([{ name: 'img', maxCount: 1 }, { name: 'logo', maxCount: 1 }]), async (req, res) => {
  try {
    const collaboration = await Collaboration.findByPk(req.params.id);
    
    if (!collaboration) {
      return res.status(404).json({ message: 'Collaboration not found' });
    }

    const { title, desc } = req.body;
    const updateData = {};

    // Handle image upload
    if (req.files && req.files.img && req.files.img[0]) {
      updateData.img = `/uploads/collaborations/${req.files.img[0].filename}`;
    } else if (req.body.img !== undefined) {
      updateData.img = req.body.img.trim();
    }

    // Handle logo upload
    if (req.files && req.files.logo && req.files.logo[0]) {
      updateData.logo = `/uploads/collaborations/${req.files.logo[0].filename}`;
    } else if (req.body.logo !== undefined) {
      updateData.logo = req.body.logo.trim();
    }
    
    if (title) updateData.title = title.trim();
    if (desc !== undefined) updateData.desc = desc.trim();

    await collaboration.update(updateData);
    
    const cleanCollaboration = {
      id: collaboration.id,
      img: collaboration.img,
      logo: collaboration.logo,
      title: collaboration.title,
      desc: collaboration.desc,
      createdAt: collaboration.createdAt ? collaboration.createdAt.toISOString() : null,
      updatedAt: collaboration.updatedAt ? collaboration.updatedAt.toISOString() : null
    };
    
    res.json(cleanCollaboration);
  } catch (error) {
    console.error('Update collaboration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete collaboration
router.delete('/:id', async (req, res) => {
  try {
    const collaboration = await Collaboration.findByPk(req.params.id);
    
    if (!collaboration) {
      return res.status(404).json({ message: 'Collaboration not found' });
    }

    await collaboration.destroy();
    res.json({ message: 'Collaboration deleted successfully' });
  } catch (error) {
    console.error('Delete collaboration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

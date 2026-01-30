import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { SidebarCard } from '../models.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/sidebarcard'));
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

// Get all SidebarCard items
router.get('/', async (req, res) => {
  try {
    const items = await SidebarCard.findAll({
      order: [['createdAt', 'DESC']]
    });
    
    const cleanItems = items.map(item => ({
      id: item.id,
      img: item.img,
      title: item.title,
      desc: item.desc,
      createdAt: item.createdAt ? item.createdAt.toISOString() : null,
      updatedAt: item.updatedAt ? item.updatedAt.toISOString() : null
    }));
    
    res.json(cleanItems);
  } catch (error) {
    console.error('Get SidebarCard items error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get SidebarCard item by ID
router.get('/:id', async (req, res) => {
  try {
    const item = await SidebarCard.findByPk(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'SidebarCard item not found' });
    }
    
    const cleanItem = {
      id: item.id,
      img: item.img,
      title: item.title,
      desc: item.desc,
      createdAt: item.createdAt ? item.createdAt.toISOString() : null,
      updatedAt: item.updatedAt ? item.updatedAt.toISOString() : null
    };
    
    res.json(cleanItem);
  } catch (error) {
    console.error('Get SidebarCard item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create SidebarCard item
router.post('/', upload.single('img'), async (req, res) => {
  try {
    const { title, desc } = req.body;

    if (!title || !desc) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    let imgPath = '';
    if (req.file) {
      imgPath = `/uploads/sidebarcard/${req.file.filename}`;
    } else if (req.body.img) {
      imgPath = req.body.img.trim();
    } else {
      return res.status(400).json({ message: 'Image is required' });
    }

    const item = await SidebarCard.create({
      img: imgPath,
      title: title.trim(),
      desc: desc.trim()
    });

    const cleanItem = {
      id: item.id,
      img: item.img,
      title: item.title,
      desc: item.desc,
      createdAt: item.createdAt ? item.createdAt.toISOString() : null,
      updatedAt: item.updatedAt ? item.updatedAt.toISOString() : null
    };
    
    res.status(201).json(cleanItem);
  } catch (error) {
    console.error('Create SidebarCard item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update SidebarCard item
router.put('/:id', upload.single('img'), async (req, res) => {
  try {
    const item = await SidebarCard.findByPk(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'SidebarCard item not found' });
    }

    const { title, desc } = req.body;
    const updateData = {};

    if (req.file) {
      updateData.img = `/uploads/sidebarcard/${req.file.filename}`;
    } else if (req.body.img !== undefined) {
      updateData.img = req.body.img.trim();
    }
    
    if (title) updateData.title = title.trim();
    if (desc !== undefined) updateData.desc = desc.trim();

    await item.update(updateData);
    
    const cleanItem = {
      id: item.id,
      img: item.img,
      title: item.title,
      desc: item.desc,
      createdAt: item.createdAt ? item.createdAt.toISOString() : null,
      updatedAt: item.updatedAt ? item.updatedAt.toISOString() : null
    };
    
    res.json(cleanItem);
  } catch (error) {
    console.error('Update SidebarCard item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete SidebarCard item
router.delete('/:id', async (req, res) => {
  try {
    const item = await SidebarCard.findByPk(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'SidebarCard item not found' });
    }

    await item.destroy();
    res.json({ message: 'SidebarCard item deleted successfully' });
  } catch (error) {
    console.error('Delete SidebarCard item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

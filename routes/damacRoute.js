import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { DAMAC } from '../models.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Helper function to check if file exists
const checkFileExists = (imgPath) => {
  if (!imgPath) return false;
  const fullPath = path.join(__dirname, '..', imgPath);
  return fs.existsSync(fullPath);
};

// Helper function to get clean DAMAC data with file validation
const getCleanDAMAC = (item) => {
  const cleanItem = {
    id: item.id,
    video: item.video,
    img: item.img,
    createdAt: item.createdAt ? item.createdAt.toISOString() : null,
    updatedAt: item.updatedAt ? item.updatedAt.toISOString() : null,
    fileExists: checkFileExists(item.img)
  };
  return cleanItem;
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/damac');
    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
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

// Get all DAMAC items
router.get('/', async (req, res) => {
  try {
    const items = await DAMAC.findAll({
      order: [['createdAt', 'DESC']]
    });
    
    const cleanItems = items.map(item => getCleanDAMAC(item));
    
    res.json(cleanItems);
  } catch (error) {
    console.error('Get DAMAC items error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get DAMAC item by ID
router.get('/:id', async (req, res) => {
  try {
    const item = await DAMAC.findByPk(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'DAMAC item not found' });
    }
    
    const cleanItem = getCleanDAMAC(item);
    
    res.json(cleanItem);
  } catch (error) {
    console.error('Get DAMAC item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create DAMAC item
router.post('/', upload.single('img'), async (req, res) => {
  try {
    console.log('Request body:', req.body);
    
    const { video, img } = req.body;

    if (!video) {
      return res.status(400).json({ message: 'Video link is required' });
    }

    let imgPath = '';
    if (req.file) {
      imgPath = `/uploads/damac/${req.file.filename}`;
    } else if (img) {
      imgPath = img.trim();
    } else {
      imgPath = null; // DAMAC img is optional
    }

    console.log('Creating DAMAC item with video:', video.trim(), 'and img:', imgPath);

    const item = await DAMAC.create({
      video: video.trim(),
      img: imgPath
    });

    console.log('Created DAMAC item:', item);

    const cleanItem = getCleanDAMAC(item);
    
    res.status(201).json(cleanItem);
  } catch (error) {
    console.error('Create DAMAC item error:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
});

// Update DAMAC item
router.put('/:id', upload.single('img'), async (req, res) => {
  try {
    const item = await DAMAC.findByPk(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'DAMAC item not found' });
    }

    const { img, video } = req.body;
    const updateData = {};

    if (req.file) {
      updateData.img = `/uploads/damac/${req.file.filename}`;
    } else if (img !== undefined) {
      updateData.img = img.trim();
    }
    
    if (video !== undefined) {
      updateData.video = video.trim();
    }

    await item.update(updateData);
    
    const cleanItem = getCleanDAMAC(item);
    
    res.json(cleanItem);
  } catch (error) {
    console.error('Update DAMAC item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete DAMAC item
router.delete('/:id', async (req, res) => {
  try {
    const item = await DAMAC.findByPk(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'DAMAC item not found' });
    }

    // Delete associated file if it exists
    if (item.img) {
      const filePath = path.join(__dirname, '..', item.img);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await item.destroy();
    res.json({ message: 'DAMAC item deleted successfully' });
  } catch (error) {
    console.error('Delete DAMAC item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cleanup DAMAC items with missing files
router.delete('/cleanup/orphaned', async (req, res) => {
  try {
    const items = await DAMAC.findAll();
    let deletedCount = 0;
    
    for (const item of items) {
      if (item.img && !checkFileExists(item.img)) {
        // Delete file if it exists (might be corrupted)
        if (item.img) {
          const filePath = path.join(__dirname, '..', item.img);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
        await item.destroy();
        deletedCount++;
      }
    }
    
    res.json({ 
      message: `Cleaned up ${deletedCount} orphaned DAMAC items`,
      deletedCount 
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

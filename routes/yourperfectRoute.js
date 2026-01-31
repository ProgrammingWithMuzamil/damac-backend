import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { YourPerfect } from '../models.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Helper function to check if file exists
const checkFileExists = (imgPath) => {
  if (!imgPath) return false;
  const fullPath = path.join(__dirname, '..', imgPath);
  return fs.existsSync(fullPath);
};

// Helper function to get clean YourPerfect data with file validation
const getCleanYourPerfect = (item) => {
  const cleanItem = {
    id: item.id,
    img: item.img,
    title: item.title,
    price: item.price,
    createdAt: item.createdAt ? item.createdAt.toISOString() : null,
    updatedAt: item.updatedAt ? item.updatedAt.toISOString() : null,
    fileExists: checkFileExists(item.img)
  };
  return cleanItem;
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/yourperfect');
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

// Get all YourPerfect items
router.get('/', async (req, res) => {
  try {
    const items = await YourPerfect.findAll({
      order: [['createdAt', 'DESC']]
    });
    
    const cleanItems = items.map(item => getCleanYourPerfect(item));
    
    res.json(cleanItems);
  } catch (error) {
    console.error('Get YourPerfect items error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get YourPerfect item by ID
router.get('/:id', async (req, res) => {
  try {
    const item = await YourPerfect.findByPk(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'YourPerfect item not found' });
    }
    
    const cleanItem = getCleanYourPerfect(item);
    
    res.json(cleanItem);
  } catch (error) {
    console.error('Get YourPerfect item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create YourPerfect item
router.post('/', upload.single('img'), async (req, res) => {
  try {
    const { title, price } = req.body;

    if (!title || !price) {
      return res.status(400).json({ message: 'Title and price are required' });
    }

    let imgPath = '';
    if (req.file) {
      imgPath = `/uploads/yourperfect/${req.file.filename}`;
    } else if (req.body.img) {
      imgPath = req.body.img.trim();
    } else {
      return res.status(400).json({ message: 'Image is required' });
    }

    const item = await YourPerfect.create({
      img: imgPath,
      title: title.trim(),
      price: price.trim()
    });

    const cleanItem = {
      id: item.id,
      img: item.img,
      title: item.title,
      price: item.price,
      createdAt: item.createdAt ? item.createdAt.toISOString() : null,
      updatedAt: item.updatedAt ? item.updatedAt.toISOString() : null
    };
    
    res.status(201).json(cleanItem);
  } catch (error) {
    console.error('Create YourPerfect item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update YourPerfect item
router.put('/:id', upload.single('img'), async (req, res) => {
  try {
    const item = await YourPerfect.findByPk(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'YourPerfect item not found' });
    }

    const { title, price } = req.body;
    const updateData = {};

    if (req.file) {
      updateData.img = `/uploads/yourperfect/${req.file.filename}`;
    } else if (req.body.img !== undefined) {
      updateData.img = req.body.img.trim();
    }
    
    if (title) updateData.title = title.trim();
    if (price !== undefined) updateData.price = price.trim();

    await item.update(updateData);
    
    const cleanItem = getCleanYourPerfect(item);
    
    res.json(cleanItem);
  } catch (error) {
    console.error('Update YourPerfect item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete YourPerfect item
router.delete('/:id', async (req, res) => {
  try {
    const item = await YourPerfect.findByPk(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'YourPerfect item not found' });
    }

    // Delete associated file if it exists
    if (item.img) {
      const filePath = path.join(__dirname, '..', item.img);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await item.destroy();
    res.json({ message: 'YourPerfect item deleted successfully' });
  } catch (error) {
    console.error('Delete YourPerfect item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cleanup YourPerfect items with missing files
router.delete('/cleanup/orphaned', async (req, res) => {
  try {
    const items = await YourPerfect.findAll();
    let deletedCount = 0;
    
    for (const item of items) {
      if (!checkFileExists(item.img)) {
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
      message: `Cleaned up ${deletedCount} orphaned YourPerfect items`,
      deletedCount 
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

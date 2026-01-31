import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Property } from '../models.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Helper function to check if file exists
const checkFileExists = (imgPath) => {
  if (!imgPath) return false;
  const fullPath = path.join(__dirname, '..', imgPath);
  return fs.existsSync(fullPath);
};

// Helper function to get clean property data with file validation
const getCleanProperty = (property) => {
  const cleanProperty = {
    id: property.id,
    img: property.img,
    title: property.title,
    location: property.location,
    price: property.price,
    createdAt: property.createdAt ? property.createdAt.toISOString() : null,
    updatedAt: property.updatedAt ? property.updatedAt.toISOString() : null,
    fileExists: checkFileExists(property.img)
  };
  return cleanProperty;
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/properties');
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

// Get all properties
router.get('/', async (req, res) => {
  try {
    const properties = await Property.findAll({
      order: [['createdAt', 'DESC']]
    });
    
    const cleanProperties = properties.map(property => getCleanProperty(property));
    
    res.json(cleanProperties);
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get property by ID
router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findByPk(req.params.id);
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    const cleanProperty = getCleanProperty(property);
    
    res.json(cleanProperty);
  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create property
router.post('/', upload.single('img'), async (req, res) => {
  try {
    const { title, location, price } = req.body;

    if (!title || !location || !price) {
      return res.status(400).json({ message: 'Title, location, and price are required' });
    }

    let imgPath = '';
    if (req.file) {
      imgPath = `/uploads/properties/${req.file.filename}`;
    } else if (req.body.img) {
      // Fallback to URL if no file uploaded
      imgPath = req.body.img.trim();
    } else {
      return res.status(400).json({ message: 'Image is required' });
    }

    const property = await Property.create({
      img: imgPath,
      title: title.trim(),
      location: location.trim(),
      price: price.trim()
    });

    const cleanProperty = getCleanProperty(property);
    
    res.status(201).json(cleanProperty);
  } catch (error) {
    console.error('Create property error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update property
router.put('/:id', upload.single('img'), async (req, res) => {
  try {
    const property = await Property.findByPk(req.params.id);
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const { title, location, price } = req.body;
    const updateData = {};

    if (req.file) {
      updateData.img = `/uploads/properties/${req.file.filename}`;
    } else if (req.body.img !== undefined) {
      updateData.img = req.body.img.trim();
    }
    
    if (title) updateData.title = title.trim();
    if (location) updateData.location = location.trim();
    if (price !== undefined) updateData.price = price.trim();

    await property.update(updateData);
    
    const cleanProperty = getCleanProperty(property);
    
    res.json(cleanProperty);
  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete property
router.delete('/:id', async (req, res) => {
  try {
    const property = await Property.findByPk(req.params.id);
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Delete associated file if it exists
    if (property.img) {
      const filePath = path.join(__dirname, '..', property.img);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await property.destroy();
    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cleanup properties with missing files
router.delete('/cleanup/orphaned', async (req, res) => {
  try {
    const properties = await Property.findAll();
    let deletedCount = 0;
    
    for (const property of properties) {
      if (!checkFileExists(property.img)) {
        // Delete file if it exists (might be corrupted)
        if (property.img) {
          const filePath = path.join(__dirname, '..', property.img);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
        await property.destroy();
        deletedCount++;
      }
    }
    
    res.json({ 
      message: `Cleaned up ${deletedCount} orphaned properties`,
      deletedCount 
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Slide } from '../models.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Helper function to check if file exists
const checkFileExists = (imgPath) => {
  if (!imgPath) return false;
  const fullPath = path.join(__dirname, '..', imgPath);
  return fs.existsSync(fullPath);
};

// Helper function to get clean slide data with file validation
const getCleanSlide = (slide) => {
  const cleanSlide = {
    id: slide.id,
    img: slide.img,
    title: slide.title,
    location: slide.location,
    points: slide.points,
    createdAt: slide.createdAt ? slide.createdAt.toISOString() : null,
    updatedAt: slide.updatedAt ? slide.updatedAt.toISOString() : null,
    fileExists: checkFileExists(slide.img)
  };
  return cleanSlide;
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/slides');
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

// Get all slides
router.get('/', async (req, res) => {
  try {
    const slides = await Slide.findAll({
      order: [['createdAt', 'DESC']]
    });
    
    const cleanSlides = slides.map(slide => getCleanSlide(slide));
    
    res.json(cleanSlides);
  } catch (error) {
    console.error('Get slides error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get slide by ID
router.get('/:id', async (req, res) => {
  try {
    const slide = await Slide.findByPk(req.params.id);
    
    if (!slide) {
      return res.status(404).json({ message: 'Slide not found' });
    }
    
    const cleanSlide = getCleanSlide(slide);
    
    res.json(cleanSlide);
  } catch (error) {
    console.error('Get slide error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create slide
router.post('/', upload.single('img'), async (req, res) => {
  try {
    const { title, location, points } = req.body;

    if (!title || !location || !points) {
      return res.status(400).json({ message: 'Title, location, and points are required' });
    }

    let imgPath = '';
    if (req.file) {
      imgPath = `/uploads/slides/${req.file.filename}`;
    } else if (req.body.img) {
      imgPath = req.body.img.trim();
    } else {
      return res.status(400).json({ message: 'Image is required' });
    }

    const slide = await Slide.create({
      img: imgPath,
      title: title.trim(),
      location: location.trim(),
      points: Array.isArray(points) ? points : points.split(',').map(p => p.trim())
    });

    const cleanSlide = getCleanSlide(slide);
    
    res.status(201).json(cleanSlide);
  } catch (error) {
    console.error('Create slide error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update slide
router.put('/:id', upload.single('img'), async (req, res) => {
  try {
    const slide = await Slide.findByPk(req.params.id);
    
    if (!slide) {
      return res.status(404).json({ message: 'Slide not found' });
    }

    const { title, location, points } = req.body;
    const updateData = {};

    if (req.file) {
      updateData.img = `/uploads/slides/${req.file.filename}`;
    } else if (req.body.img !== undefined) {
      updateData.img = req.body.img.trim();
    }
    
    if (title) updateData.title = title.trim();
    if (location) updateData.location = location.trim();
    if (points !== undefined) {
      updateData.points = Array.isArray(points) ? points : points.split(',').map(p => p.trim());
    }

    await slide.update(updateData);
    
    const cleanSlide = getCleanSlide(slide);
    
    res.json(cleanSlide);
  } catch (error) {
    console.error('Update slide error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete slide
router.delete('/:id', async (req, res) => {
  try {
    const slide = await Slide.findByPk(req.params.id);
    
    if (!slide) {
      return res.status(404).json({ message: 'Slide not found' });
    }

    // Delete associated file if it exists
    if (slide.img) {
      const filePath = path.join(__dirname, '..', slide.img);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await slide.destroy();
    res.json({ message: 'Slide deleted successfully' });
  } catch (error) {
    console.error('Delete slide error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cleanup slides with missing files
router.delete('/cleanup/orphaned', async (req, res) => {
  try {
    const slides = await Slide.findAll();
    let deletedCount = 0;
    
    for (const slide of slides) {
      if (!checkFileExists(slide.img)) {
        // Delete file if it exists (might be corrupted)
        if (slide.img) {
          const filePath = path.join(__dirname, '..', slide.img);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
        await slide.destroy();
        deletedCount++;
      }
    }
    
    res.json({ 
      message: `Cleaned up ${deletedCount} orphaned slides`,
      deletedCount 
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

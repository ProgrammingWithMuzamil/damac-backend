import express from 'express';
import { DAMAC } from '../models.js';

const router = express.Router();

// Get all DAMAC items
router.get('/', async (req, res) => {
  try {
    const items = await DAMAC.findAll({
      order: [['createdAt', 'DESC']]
    });
    
    const cleanItems = items.map(item => ({
      id: item.id,
      video: item.video,
      createdAt: item.createdAt ? item.createdAt.toISOString() : null,
      updatedAt: item.updatedAt ? item.updatedAt.toISOString() : null
    }));
    
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
    
    const cleanItem = {
      id: item.id,
      video: item.video,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    };
    
    res.json(cleanItem);
  } catch (error) {
    console.error('Get DAMAC item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create DAMAC item
router.post('/', async (req, res) => {
  try {
    console.log('Request body:', req.body);
    
    const { video, img } = req.body;

    if (!video) {
      return res.status(400).json({ message: 'Video link is required' });
    }

    console.log('Creating DAMAC item with video:', video.trim());

    const item = await DAMAC.create({
      video: video.trim(),
      img: img ? img.trim() : null
    });

    console.log('Created DAMAC item:', item);

    const cleanItem = {
      id: item.id,
      video: item.video,
      createdAt: item.createdAt ? item.createdAt.toISOString() : null,
      updatedAt: item.updatedAt ? item.updatedAt.toISOString() : null
    };
    
    res.status(201).json(cleanItem);
  } catch (error) {
    console.error('Create DAMAC item error:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
});

// Update DAMAC item
router.put('/:id', async (req, res) => {
  try {
    const item = await DAMAC.findByPk(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'DAMAC item not found' });
    }

    const { img, video } = req.body;
    const updateData = {};

    if (img !== undefined) {
      updateData.img = img.trim();
    }
    
    if (video !== undefined) {
      updateData.video = video.trim();
    }

    await item.update(updateData);
    
    const cleanItem = {
      id: item.id,
      video: item.video,
      createdAt: item.createdAt ? item.createdAt.toISOString() : null,
      updatedAt: item.updatedAt ? item.updatedAt.toISOString() : null
    };
    
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

    await item.destroy();
    res.json({ message: 'DAMAC item deleted successfully' });
  } catch (error) {
    console.error('Delete DAMAC item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

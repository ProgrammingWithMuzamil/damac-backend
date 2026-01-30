import express from 'express';
import { EmpoweringCommunities } from '../models.js';

const router = express.Router();

// Get all EmpoweringCommunities items
router.get('/', async (req, res) => {
  try {
    const items = await EmpoweringCommunities.findAll({
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
    console.error('Get EmpoweringCommunities items error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get EmpoweringCommunities item by ID
router.get('/:id', async (req, res) => {
  try {
    const item = await EmpoweringCommunities.findByPk(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'EmpoweringCommunities item not found' });
    }
    
    const cleanItem = {
      id: item.id,
      video: item.video,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    };
    
    res.json(cleanItem);
  } catch (error) {
    console.error('Get EmpoweringCommunities item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create EmpoweringCommunities item
router.post('/', async (req, res) => {
  try {
    const { video } = req.body;

    if (!video) {
      return res.status(400).json({ message: 'Video link is required' });
    }

    const item = await EmpoweringCommunities.create({
      video: video.trim()
    });

    const cleanItem = {
      id: item.id,
      video: item.video,
      createdAt: item.createdAt ? item.createdAt.toISOString() : null,
      updatedAt: item.updatedAt ? item.updatedAt.toISOString() : null
    };
    
    res.status(201).json(cleanItem);
  } catch (error) {
    console.error('Create EmpoweringCommunities item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update EmpoweringCommunities item
router.put('/:id', async (req, res) => {
  try {
    const item = await EmpoweringCommunities.findByPk(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'EmpoweringCommunities item not found' });
    }

    const { video } = req.body;
    const updateData = {};

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
    console.error('Update EmpoweringCommunities item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete EmpoweringCommunities item
router.delete('/:id', async (req, res) => {
  try {
    const item = await EmpoweringCommunities.findByPk(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'EmpoweringCommunities item not found' });
    }

    await item.destroy();
    res.json({ message: 'EmpoweringCommunities item deleted successfully' });
  } catch (error) {
    console.error('Delete EmpoweringCommunities item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

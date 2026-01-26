import Slide from '../models/slideModel.js';

// Create a new slide with image upload
export const createSlide = async (req, res) => {
    try {
        const img = req.file ? `uploads/${req.file.filename}` : null;
        const { title, location, points } = req.body;

        const newSlide = new Slide({
            img,
            title,
            location,
            points
        });

        await newSlide.save();
        res.status(201).json({ message: 'Slide created successfully', newSlide });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create slide', details: error.message });
    }
};

// Get all slides
export const getSlides = async (req, res) => {
    try {
        const slides = await Slide.find().sort({ createdAt: -1 });
        res.status(200).json(slides);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch slides', details: error.message });
    }
};

// Get a slide by ID
export const getSlideById = async (req, res) => {
    try {
        const slide = await Slide.findById(req.params.id);
        if (!slide) return res.status(404).json({ error: 'Slide not found' });
        res.status(200).json(slide);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch slide', details: error.message });
    }
};

// Update slide by ID with image upload
export const updateSlide = async (req, res) => {
    try {
        const { title, location, points } = req.body;
        const img = req.file ? `uploads/${req.file.filename}` : null;

        const updatedSlide = await Slide.findByIdAndUpdate(
            req.params.id,
            { title, location, points, img },
            { new: true, runValidators: true }
        );

        if (!updatedSlide) return res.status(404).json({ error: 'Slide not found' });

        res.status(200).json({ message: 'Slide updated successfully', updatedSlide });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update slide', details: error.message });
    }
};

// Delete slide by ID
export const deleteSlide = async (req, res) => {
    try {
        const deletedSlide = await Slide.findByIdAndDelete(req.params.id);
        if (!deletedSlide) return res.status(404).json({ error: 'Slide not found' });

        res.status(200).json({ message: 'Slide deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete slide', details: error.message });
    }
};

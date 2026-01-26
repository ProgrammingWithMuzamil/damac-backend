import Collaboration from '../models/collaborationModel.js';

// Create a new collaboration with file upload
export const createCollaboration = async (req, res) => {
    try {
        // Extract file paths for uploaded images
        const img = req.files && req.files['img'] ? `uploads/${req.files['img'][0].filename}` : null;
        const logo = req.files && req.files['logo'] ? `uploads/${req.files['logo'][0].filename}` : null;

        // Extract text data from the request body
        const { title, desc } = req.body;

        // Create a new Collaboration object
        const collaboration = new Collaboration({
            img,
            logo,
            title,
            desc,
        });

        // Save the collaboration object to the database
        await collaboration.save();
        res.status(201).json({ message: 'Collaboration created successfully', collaboration });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create collaboration', details: error.message });
    }
};

// Get all collaborations
export const getCollaborations = async (req, res) => {
    try {
        const collaborations = await Collaboration.find().sort({ createdAt: -1 }); // Sort by most recent
        res.status(200).json(collaborations);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch collaborations', details: error.message });
    }
};

// Get a collaboration by ID
export const getCollaborationById = async (req, res) => {
    try {
        const collaboration = await Collaboration.findById(req.params.id);
        if (!collaboration) return res.status(404).json({ error: 'Collaboration not found' });
        res.status(200).json(collaboration);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch collaboration', details: error.message });
    }
};

// Update collaboration by ID with file upload
export const updateCollaboration = async (req, res) => {
    try {
        const { title, desc } = req.body;
        // Check if new images are uploaded, otherwise keep existing ones
        const img = req.files && req.files['img'] ? `uploads/${req.files['img'][0].filename}` : null;
        const logo = req.files && req.files['logo'] ? `uploads/${req.files['logo'][0].filename}` : null;

        // Update the collaboration in the database
        const collaboration = await Collaboration.findByIdAndUpdate(
            req.params.id,
            { title, desc, img, logo },
            { new: true, runValidators: true }
        );

        if (!collaboration) return res.status(404).json({ error: 'Collaboration not found' });

        res.status(200).json({ message: 'Collaboration updated successfully', collaboration });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update collaboration', details: error.message });
    }
};

// Delete collaboration by ID
export const deleteCollaboration = async (req, res) => {
    try {
        const deletedCollaboration = await Collaboration.findByIdAndDelete(req.params.id);
        if (!deletedCollaboration) return res.status(404).json({ error: 'Collaboration not found' });

        res.status(200).json({ message: 'Collaboration deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete collaboration', details: error.message });
    }
};

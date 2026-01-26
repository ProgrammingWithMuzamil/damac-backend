import Collaboration from '../models/collaborationModel.js';

// Create a new collaboration with file upload
export const createCollaboration = async (req, res) => {
    try {
        const { title, desc } = req.body;
        const img = req.files && req.files['img'] ? `uploads/${req.files['img'][0].filename}` : null;
        const logo = req.files && req.files['logo'] ? `uploads/${req.files['logo'][0].filename}` : null;

        const collaboration = new Collaboration({
            img,
            logo,
            title,
            desc,
        });

        await collaboration.save();
        res.status(201).json({ message: 'Collaboration created successfully', collaboration });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create collaboration', details: error.message });
    }
};

// Update collaboration by ID with file upload
export const updateCollaboration = async (req, res) => {
    try {
        const { title, desc } = req.body;
        const img = req.files && req.files['img'] ? `uploads/${req.files['img'][0].filename}` : null;
        const logo = req.files && req.files['logo'] ? `uploads/${req.files['logo'][0].filename}` : null;

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

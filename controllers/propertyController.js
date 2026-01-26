import Property from '../models/propertyModel.js';

// Create a new property
export const createProperty = async (req, res) => {
    try {
        const { img, title, location, price } = req.body;

        const newProperty = new Property({
            img,
            title,
            location,
            price
        });

        await newProperty.save();
        res.status(201).json({ message: 'Property created successfully', newProperty });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create property', details: error.message });
    }
};

// Get all properties
export const getProperties = async (req, res) => {
    try {
        const properties = await Property.find().sort({ createdAt: -1 }); // Sort by most recent
        res.status(200).json(properties);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch properties', details: error.message });
    }
};

// Get a property by ID
export const getPropertyById = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property) return res.status(404).json({ error: 'Property not found' });
        res.status(200).json(property);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch property', details: error.message });
    }
};

// Update a property by ID
export const updateProperty = async (req, res) => {
    try {
        const { img, title, location, price } = req.body;
        const updatedProperty = await Property.findByIdAndUpdate(
            req.params.id,
            { img, title, location, price },
            { new: true, runValidators: true } // Return the updated property
        );

        if (!updatedProperty) return res.status(404).json({ error: 'Property not found' });

        res.status(200).json({ message: 'Property updated successfully', updatedProperty });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update property', details: error.message });
    }
};

// Delete a property by ID
export const deleteProperty = async (req, res) => {
    try {
        const deletedProperty = await Property.findByIdAndDelete(req.params.id);
        if (!deletedProperty) return res.status(404).json({ error: 'Property not found' });

        res.status(200).json({ message: 'Property deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete property', details: error.message });
    }
};

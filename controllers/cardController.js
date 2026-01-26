import Card from '../models/cardModel.js';

// Create a new card
export const createCard = async (req, res) => {
    try {
        const { img, title, desc } = req.body;

        const newCard = new Card({
            img,
            title,
            desc
        });

        await newCard.save();
        res.status(201).json({ message: 'Card created successfully', newCard });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create card', details: error.message });
    }
};

// Get all cards
export const getCards = async (req, res) => {
    try {
        const cards = await Card.find().sort({ createdAt: -1 }); // Sort cards by most recent
        res.status(200).json(cards);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch cards', details: error.message });
    }
};

// Get a card by ID
export const getCardById = async (req, res) => {
    try {
        const card = await Card.findById(req.params.id);
        if (!card) return res.status(404).json({ error: 'Card not found' });
        res.status(200).json(card);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch card', details: error.message });
    }
};

// Update a card by ID
export const updateCard = async (req, res) => {
    try {
        const { img, title, desc } = req.body;
        const updatedCard = await Card.findByIdAndUpdate(
            req.params.id,
            { img, title, desc },
            { new: true, runValidators: true } // Return the updated card
        );

        if (!updatedCard) return res.status(404).json({ error: 'Card not found' });

        res.status(200).json({ message: 'Card updated successfully', updatedCard });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update card', details: error.message });
    }
};

// Delete a card by ID
export const deleteCard = async (req, res) => {
    try {
        const deletedCard = await Card.findByIdAndDelete(req.params.id);
        if (!deletedCard) return res.status(404).json({ error: 'Card not found' });

        res.status(200).json({ message: 'Card deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete card', details: error.message });
    }
};

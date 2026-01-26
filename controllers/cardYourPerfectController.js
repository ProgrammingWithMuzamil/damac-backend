import CardYourPerfect from '../models/cardYourPerfectModel.js';

// Create a new card with image upload
export const createCardYourPerfect = async (req, res) => {
    try {
        const img = req.file ? `uploads/${req.file.filename}` : null;
        const { title, price } = req.body;

        const newCard = new CardYourPerfect({
            img,
            title,
            price
        });

        await newCard.save();
        res.status(201).json({ message: 'Card created successfully', newCard });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create card', details: error.message });
    }
};

// Get all cards
export const getCardsYourPerfect = async (req, res) => {
    try {
        const cards = await CardYourPerfect.find().sort({ createdAt: -1 });
        res.status(200).json(cards);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch cards', details: error.message });
    }
};

// Get a card by ID
export const getCardYourPerfectById = async (req, res) => {
    try {
        const card = await CardYourPerfect.findById(req.params.id);
        if (!card) return res.status(404).json({ error: 'Card not found' });
        res.status(200).json(card);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch card', details: error.message });
    }
};

// Update card by ID with image upload
export const updateCardYourPerfect = async (req, res) => {
    try {
        const { title, price } = req.body;
        const img = req.file ? `uploads/${req.file.filename}` : null;

        const updatedCard = await CardYourPerfect.findByIdAndUpdate(
            req.params.id,
            { title, price, img },
            { new: true, runValidators: true }
        );

        if (!updatedCard) return res.status(404).json({ error: 'Card not found' });

        res.status(200).json({ message: 'Card updated successfully', updatedCard });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update card', details: error.message });
    }
};

// Delete card by ID
export const deleteCardYourPerfect = async (req, res) => {
    try {
        const deletedCard = await CardYourPerfect.findByIdAndDelete(req.params.id);
        if (!deletedCard) return res.status(404).json({ error: 'Card not found' });

        res.status(200).json({ message: 'Card deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete card', details: error.message });
    }
};

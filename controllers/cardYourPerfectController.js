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
        
        const cleanCard = {
            id: newCard.id,
            img: newCard.img,
            title: newCard.title,
            price: newCard.price,
            createdAt: newCard.createdAt,
            updatedAt: newCard.updatedAt
        };
        
        res.status(201).json({ message: 'Card created successfully', newCard: cleanCard });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create card', details: error.message });
    }
};

// Get all cards
export const getCardsYourPerfect = async (req, res) => {
    try {
        const cards = await CardYourPerfect.findAll({
            order: [['createdAt', 'DESC']]
        });
        
        const cleanCards = cards.map(card => ({
            id: card.id,
            img: card.img,
            title: card.title,
            price: card.price,
            createdAt: card.createdAt,
            updatedAt: card.updatedAt
        }));
        
        res.status(200).json(cleanCards);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch cards', details: error.message });
    }
};

// Get a card by ID
export const getCardYourPerfectById = async (req, res) => {
    try {
        const card = await CardYourPerfect.findByPk(req.params.id);
        if (!card) return res.status(404).json({ error: 'Card not found' });
        
        const cleanCard = {
            id: card.id,
            img: card.img,
            title: card.title,
            price: card.price,
            createdAt: card.createdAt,
            updatedAt: card.updatedAt
        };
        
        res.status(200).json(cleanCard);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch card', details: error.message });
    }
};

// Update card by ID with image upload
export const updateCardYourPerfect = async (req, res) => {
    try {
        const { title, price } = req.body;
        const img = req.file ? `uploads/${req.file.filename}` : null;

        const updatedCard = await CardYourPerfect.findByPk(req.params.id);
        if (!updatedCard) return res.status(404).json({ error: 'Card not found' });

        if (title) updatedCard.title = title;
        if (price) updatedCard.price = price;
        if (img) updatedCard.img = img;

        await updatedCard.save();
        
        const cleanCard = {
            id: updatedCard.id,
            img: updatedCard.img,
            title: updatedCard.title,
            price: updatedCard.price,
            createdAt: updatedCard.createdAt,
            updatedAt: updatedCard.updatedAt
        };

        res.status(200).json({ message: 'Card updated successfully', updatedCard: cleanCard });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update card', details: error.message });
    }
};

// Delete card by ID
export const deleteCardYourPerfect = async (req, res) => {
    try {
        const deletedCard = await CardYourPerfect.findByPk(req.params.id);
        if (!deletedCard) return res.status(404).json({ error: 'Card not found' });

        await deletedCard.destroy();

        res.status(200).json({ message: 'Card deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete card', details: error.message });
    }
};

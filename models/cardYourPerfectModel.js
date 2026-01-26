import mongoose from 'mongoose';

const cardYourPerfectSchema = new mongoose.Schema({
    img: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    price: {
        type: String,
        required: true,
    },
}, {
    timestamps: true, // Adds createdAt and updatedAt fields
});

export default mongoose.model('CardYourPerfect', cardYourPerfectSchema);

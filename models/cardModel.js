import mongoose from 'mongoose';

const cardSchema = new mongoose.Schema({
    img: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    desc: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});

export default mongoose.model('Card', cardSchema);

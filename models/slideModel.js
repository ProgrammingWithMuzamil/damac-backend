import mongoose from 'mongoose';

const slideSchema = new mongoose.Schema({
    img: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    points: {
        type: [String],
        required: true,
    }
}, {
    timestamps: true,
});

export default mongoose.model('Slide', slideSchema);

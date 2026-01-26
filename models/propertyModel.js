import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
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
    price: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});

export default mongoose.model('Property', propertySchema);

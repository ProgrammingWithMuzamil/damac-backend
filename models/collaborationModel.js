import mongoose from 'mongoose';

const collaborationSchema = new mongoose.Schema({
    img: {
        type: String,
        required: true,
    },
    logo: {
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

export default mongoose.model('Collaboration', collaborationSchema);

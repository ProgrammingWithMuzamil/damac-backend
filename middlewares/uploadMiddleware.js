import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Get the current directory (middleware folder) and resolve the correct path
const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

// Ensure we're not adding an extra drive letter (we need to resolve to the correct path)
const uploadDir = path.join(__dirname, '..', 'uploads'); // Use path.join to ensure proper relative path

// Ensure the upload directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // Correct path now
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, Date.now() + ext);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed.'));
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB limit
    }
});

export default upload;

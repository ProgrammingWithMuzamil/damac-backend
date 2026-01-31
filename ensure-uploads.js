import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure all upload directories exist
const uploadDirs = [
  'uploads',
  'uploads/slides',
  'uploads/properties',
  'uploads/collaborations',
  'uploads/yourperfect',
  'uploads/sidebarcard',
  'uploads/damac'
];

uploadDirs.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`Created directory: ${dir}`);
  } else {
    console.log(`Directory already exists: ${dir}`);
  }
});

console.log('Upload directories are ready');

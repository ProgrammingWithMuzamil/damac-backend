import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const uploadDirs = [
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
  }
});

console.log('✅ Upload directories ensured');

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

let createdDirs = 0;

uploadDirs.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`Created directory: ${dir}`);
    createdDirs++;
  } else {
    console.log(`Directory already exists: ${dir}`);
  }
});

if (createdDirs > 0) {
  console.log(`✅ Created ${createdDirs} upload directories`);
} else {
  console.log('✅ All upload directories already exist');
}

// Create a .gitkeep file in each directory to ensure they're tracked
uploadDirs.forEach(dir => {
  const gitkeepPath = path.join(__dirname, dir, '.gitkeep');
  if (!fs.existsSync(gitkeepPath)) {
    fs.writeFileSync(gitkeepPath, '# This file ensures the directory is tracked by git\n');
  }
});

console.log('📁 Upload directories are ready');

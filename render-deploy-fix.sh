#!/bin/bash

# Render.com Deployment Fix for Image Upload Issues
# This script runs during deployment to fix all image upload problems

echo "🚀 Starting DAMAC Image Upload Fix for Render.com..."

# Set environment variables
export NODE_ENV=production

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Build frontend
echo "🏗️ Building frontend..."
cd ../damac-frontend
npm ci
npm run build

# Return to backend directory
cd ../damac-backend

# Create upload directories
echo "📁 Creating upload directories..."
mkdir -p uploads/slides
mkdir -p uploads/properties
mkdir -p uploads/collaborations
mkdir -p uploads/yourperfect
mkdir -p uploads/sidebarcard
mkdir -p uploads/damac

# Create .gitkeep files to track directories
touch uploads/.gitkeep
touch uploads/slides/.gitkeep
touch uploads/properties/.gitkeep
touch uploads/collaborations/.gitkeep
touch uploads/yourperfect/.gitkeep
touch uploads/sidebarcard/.gitkeep
touch uploads/damac/.gitkeep

# Create placeholder images for any missing files
echo "🖼️ Creating placeholder images..."
node create-missing-images.js

# Create a startup script that ensures directories exist
cat > ensure-dirs-on-start.js << 'EOF'
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
EOF

# Update package.json start script
echo "📝 Updating start script..."
npm pkg set scripts.start="node ensure-dirs-on-start.js && node server.js"

echo "✅ Deployment fix completed!"
echo "🌐 Server will start with correct image serving"
echo "📁 Upload directories are guaranteed to exist"
echo "🖼️ Missing images have placeholder files"

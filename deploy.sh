#!/bin/bash

# DAMAC Backend Deployment Script

echo "🚀 Starting DAMAC Backend Deployment..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Create production environment file if it doesn't exist
if [ ! -f .env.production ]; then
    echo "⚠️  .env.production not found. Please create it with your production settings."
    exit 1
fi

# Copy production environment file
cp .env.production .env

# Create uploads directory if it doesn't exist
mkdir -p uploads/properties
mkdir -p uploads/collaborations
mkdir -p uploads/slides
mkdir -p uploads/yourperfect
mkdir -p uploads/sidebarcard

# Set permissions
chmod -R 755 uploads/

# Run database migrations (if needed)
echo "🗄️  Setting up database..."
node createAdmin.js

# Start the server
echo "🌐 Starting production server..."
npm start

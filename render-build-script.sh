#!/bin/bash

# Render.com Build Script for DAMAC Backend
# This script runs during deployment to ensure everything is ready

echo "🚀 Starting DAMAC Backend Build for Render.com..."

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

# Ensure upload directories exist
echo "📁 Creating upload directories..."
node ensure-uploads.js

# Fix any production upload issues
echo "🔧 Fixing production upload issues..."
node fix-production-uploads.js

# Create a startup script
cat > start.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting DAMAC Backend on Render.com..."
export NODE_ENV=production
node server.js
EOF

chmod +x start.sh

echo "✅ Build completed successfully!"
echo "🌐 Server will start on port $PORT"
echo "📁 Upload directories are ready"
echo "🖼️ Image serving is configured"

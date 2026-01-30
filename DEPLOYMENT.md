# DAMAC Admin Panel - Production Deployment Guide

## 📋 Overview

This guide covers deploying the DAMAC Admin Panel to production environment.

## 🏗️ Architecture

- **Backend**: Node.js + Express + SQLite
- **Frontend**: React + Vite + Tailwind CSS
- **Database**: SQLite (can be upgraded to PostgreSQL/MySQL)
- **File Storage**: Local filesystem (can be upgraded to S3/Cloud storage)

## 🚀 Backend Deployment

### Prerequisites
- Node.js 18+ 
- PM2 (process manager)
- Nginx (reverse proxy, optional but recommended)
- SSL certificate (HTTPS required for production)

### Step 1: Setup Environment
```bash
# Clone repository
git clone <your-repo-url>
cd damac-backend

# Install dependencies
npm ci --only=production

# Create production environment file
cp .env.example .env.production
```

### Step 2: Configure Environment
Edit `.env.production`:
```env
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this
FRONTEND_URL=https://your-domain.com
```

### Step 3: Setup Database
```bash
# Create admin user
node createAdmin.js

# Create uploads directory
mkdir -p uploads/{properties,collaborations,slides,yourperfect,sidebarcard}
chmod -R 755 uploads/
```

### Step 4: Start with PM2
```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start server.js --name "damac-backend"

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

## 🎨 Frontend Deployment

### Step 1: Build for Production
```bash
cd damac-frontend

# Install dependencies
npm ci

# Create production environment
cp .env.example .env.production

# Build application
npm run build
```

### Step 2: Configure Environment
Edit `.env.production`:
```env
VITE_API_BASE_URL=https://your-backend-domain.com/api
VITE_NODE_ENV=production
```

### Step 3: Deploy to Web Server
The built files are in `dist/`. Deploy them to your web server:
- Apache: Copy to `/var/www/html/`
- Nginx: Copy to `/var/www/html/`
- Static hosting: Upload `dist/` contents

## 🔧 Nginx Configuration (Recommended)

Create `/etc/nginx/sites-available/damac`:
```nginx
# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    root /var/www/damac;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Serve uploaded files
    location /uploads {
        proxy_pass http://localhost:3000;
    }
}
```

## 🔒 Security Considerations

### Essential Security Measures
1. **HTTPS**: Install SSL certificate (Let's Encrypt recommended)
2. **Environment Variables**: Never commit `.env` files
3. **JWT Secret**: Use strong, unique secret
4. **Firewall**: Configure firewall to allow only necessary ports
5. **Regular Updates**: Keep dependencies updated
6. **Backups**: Regular database and file backups

### Rate Limiting
- API endpoints are rate-limited (100 requests per 15 minutes)
- Adjust limits in `server.js` if needed

### File Upload Security
- File size limited to 5MB
- Only image files allowed
- Files stored in separate directories

## 📊 Monitoring

### PM2 Monitoring
```bash
# View process status
pm2 status

# View logs
pm2 logs damac-backend

# Monitor performance
pm2 monit

# Restart application
pm2 restart damac-backend
```

### Health Check
- Backend health: `https://api.yourdomain.com/health`
- Frontend: `https://yourdomain.com`

## 🔄 Updates

### Backend Updates
```bash
# Pull latest code
git pull origin main

# Install new dependencies
npm ci --only=production

# Restart application
pm2 restart damac-backend
```

### Frontend Updates
```bash
# Pull latest code
git pull origin main

# Install dependencies
npm ci

# Build new version
npm run build

# Deploy new dist/ files to web server
```

## 🚨 Troubleshooting

### Common Issues
1. **Port already in use**: Kill existing processes or change port
2. **Database connection**: Check SQLite file permissions
3. **File uploads**: Ensure uploads directory exists and is writable
4. **CORS errors**: Update CORS origins in server.js
5. **Build failures**: Check Node.js version compatibility

### Logs
- Backend logs: `pm2 logs damac-backend`
- Nginx logs: `/var/log/nginx/error.log`
- System logs: `journalctl -u nginx`

## 📞 Support

For deployment issues:
1. Check logs for error messages
2. Verify environment variables
3. Ensure all dependencies are installed
4. Test health endpoints
5. Check network connectivity

## 🎯 Production Checklist

Before going live:
- [ ] Update all environment variables
- [ ] Set up SSL certificates
- [ ] Configure firewall
- [ ] Set up monitoring
- [ ] Create backup strategy
- [ ] Test all functionality
- [ ] Set up error logging
- [ ] Configure rate limiting
- [ ] Test file uploads
- [ ] Verify CORS settings
- [ ] Update CORS origins to production domain
- [ ] Test admin login
- [ ] Verify database connection
- [ ] Test all CRUD operations

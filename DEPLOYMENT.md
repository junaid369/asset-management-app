# Asset Management System - Deployment Guide

## Prerequisites

- Ubuntu Server (18.04, 20.04, or 22.04)
- Root or sudo access
- Domain name pointing to your server IP
- Git installed
- Node.js 16+ and npm installed

---

## Step 1: Install Required Software

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js (if not already installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx
sudo apt install nginx -y

# Install PM2 globally (process manager)
sudo npm install -g pm2

# Install build tools
sudo apt install build-essential -y
```

---

## Step 2: Clone Repository

```bash
# Navigate to web directory
cd /var/www

# Clone your repository
sudo git clone https://github.com/yourusername/asset-management.git asset-management

# Set proper ownership
sudo chown -R $USER:$USER /var/www/asset-management

# Navigate to project
cd /var/www/asset-management
```

---

## Step 3: Configure Environment Variables

### Backend Environment

```bash
# Copy example env file
cp .env.production.example backend/.env

# Edit the environment file
nano backend/.env
```

**Configure these values in `backend/.env`:**

```env
MONGO_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/asset-management?retryWrites=true&w=majority
JWT_SECRET=your-generated-secret-key-here
PORT=5000
NODE_ENV=production
CLIENT_URL=https://yourdomain.com
```

**Generate JWT Secret:**
```bash
# Generate a secure random string
openssl rand -base64 32
```

### Frontend Environment

```bash
# Create frontend .env file
nano frontend/.env.production
```

**Add this content:**
```env
REACT_APP_API_URL=https://yourdomain.com/api
```

---

## Step 4: Install Dependencies and Build

### Backend

```bash
cd /var/www/asset-management/backend
npm install --production
```

### Frontend

```bash
cd /var/www/asset-management/frontend
npm install
npm run build
```

This creates an optimized production build in `frontend/build/` directory.

---

## Step 5: Configure Nginx

### Copy Nginx Configuration

```bash
# Copy nginx config to sites-available
sudo cp /var/www/asset-management/nginx.conf /etc/nginx/sites-available/asset-management

# Edit the configuration file
sudo nano /etc/nginx/sites-available/asset-management
```

**Replace `yourdomain.com` with your actual domain in the config file.**

### Create Symbolic Link

```bash
# Create symbolic link to sites-enabled
sudo ln -s /etc/nginx/sites-available/asset-management /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

## Step 6: Start Backend with PM2

```bash
cd /var/www/asset-management

# Create logs directory
mkdir -p logs

# Start backend with PM2
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

# Setup PM2 to start on system boot
pm2 startup
# Copy and run the command that PM2 outputs
```

### Useful PM2 Commands

```bash
# View running processes
pm2 list

# View logs
pm2 logs asset-management-backend

# Monitor
pm2 monit

# Restart
pm2 restart asset-management-backend

# Stop
pm2 stop asset-management-backend

# Delete
pm2 delete asset-management-backend
```

---

## Step 7: Configure Firewall

```bash
# Allow SSH
sudo ufw allow OpenSSH

# Allow HTTP
sudo ufw allow 'Nginx HTTP'

# Allow HTTPS
sudo ufw allow 'Nginx HTTPS'

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

---

## Step 8: Setup SSL with Let's Encrypt (HTTPS)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow the prompts:
# - Enter email address
# - Agree to terms
# - Choose whether to redirect HTTP to HTTPS (recommended: Yes)
```

Certbot will automatically:
- Obtain SSL certificates
- Configure Nginx for HTTPS
- Set up auto-renewal

**Test auto-renewal:**
```bash
sudo certbot renew --dry-run
```

---

## Step 9: Configure MongoDB Atlas (if using cloud MongoDB)

1. Go to MongoDB Atlas dashboard
2. Navigate to **Network Access**
3. Click **Add IP Address**
4. Add your server's public IP address or use `0.0.0.0/0` (allow from anywhere)
5. Go to **Database Access**
6. Verify your database user has proper permissions

---

## Step 10: Seed Initial Data (Optional)

```bash
cd /var/www/asset-management/backend

# Run seed script to create initial admin user
node seed.js
```

**Default credentials:**
- Email: admin@company.com
- Password: admin123

**⚠️ IMPORTANT: Change the admin password immediately after first login!**

---

## Post-Deployment Checklist

- [ ] Domain DNS is pointing to server IP
- [ ] Nginx is running: `sudo systemctl status nginx`
- [ ] Backend is running: `pm2 list`
- [ ] SSL certificate is active (HTTPS working)
- [ ] Firewall is configured
- [ ] MongoDB connection is working
- [ ] Admin login works
- [ ] Changed default admin password
- [ ] Environment variables are set correctly
- [ ] Frontend can communicate with backend API

---

## Updating the Application

```bash
# Navigate to project
cd /var/www/asset-management

# Pull latest changes
git pull origin main

# Backend: Install dependencies
cd backend
npm install --production

# Frontend: Rebuild
cd ../frontend
npm install
npm run build

# Restart backend
pm2 restart asset-management-backend

# Restart Nginx (if needed)
sudo systemctl restart nginx
```

---

## Monitoring and Logs

### View Backend Logs
```bash
# PM2 logs
pm2 logs asset-management-backend

# View log files
tail -f /var/www/asset-management/logs/backend-combined.log
```

### View Nginx Logs
```bash
# Access logs
sudo tail -f /var/log/nginx/asset-management-access.log

# Error logs
sudo tail -f /var/log/nginx/asset-management-error.log
```

### Monitor System Resources
```bash
# PM2 monitoring
pm2 monit

# System resources
htop
```

---

## Troubleshooting

### Backend Not Starting

```bash
# Check logs
pm2 logs asset-management-backend

# Check if port 5000 is already in use
sudo lsof -i :5000

# Kill process on port 5000
sudo kill -9 $(sudo lsof -t -i:5000)

# Restart
pm2 restart asset-management-backend
```

### Nginx 502 Bad Gateway

```bash
# Check if backend is running
pm2 list

# Check Nginx error logs
sudo tail -f /var/log/nginx/asset-management-error.log

# Test backend directly
curl http://localhost:5000/api/health
```

### Permission Issues

```bash
# Fix ownership
sudo chown -R $USER:$USER /var/www/asset-management

# Fix Nginx permissions
sudo chown -R www-data:www-data /var/www/asset-management/frontend/build
```

### SSL Certificate Issues

```bash
# Renew certificate manually
sudo certbot renew

# Check certificate status
sudo certbot certificates
```

---

## Security Best Practices

1. **Change Default Credentials**
   - Change admin password immediately
   - Use strong, unique passwords

2. **Environment Variables**
   - Never commit `.env` files to Git
   - Use strong JWT secrets
   - Rotate secrets periodically

3. **MongoDB Security**
   - Use strong database passwords
   - Whitelist only necessary IP addresses
   - Enable MongoDB authentication

4. **Server Security**
   - Keep system updated: `sudo apt update && sudo apt upgrade`
   - Use SSH keys instead of passwords
   - Configure fail2ban for SSH protection
   - Regular backups

5. **Nginx Security**
   - Keep Nginx updated
   - Configure rate limiting (if needed)
   - Use strong SSL configuration

---

## Backup Strategy

### Database Backup (MongoDB Atlas)
- MongoDB Atlas provides automatic backups
- Configure backup schedule in Atlas dashboard

### Application Backup
```bash
# Backup entire application
cd /var/www
sudo tar -czf asset-management-backup-$(date +%Y%m%d).tar.gz asset-management/

# Store backup in safe location
sudo mv asset-management-backup-*.tar.gz /backups/
```

---

## Quick Reference Commands

```bash
# Check all services
sudo systemctl status nginx
pm2 list

# Restart all services
sudo systemctl restart nginx
pm2 restart all

# View all logs
pm2 logs
sudo tail -f /var/log/nginx/asset-management-error.log

# Update SSL certificate
sudo certbot renew

# Backup database
# (Use MongoDB Atlas dashboard or mongodump)
```

---

## Support

For issues or questions:
- Check logs first
- Review this deployment guide
- Check GitHub issues
- Contact system administrator

---

**Your Asset Management System should now be live! 🎉**

Access your application at: **https://yourdomain.com**

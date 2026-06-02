# 🚀 Deployment Checklist for assets.miragebymag.com

## ✅ Pre-Deployment Checklist (Completed)

- [x] GitHub repository created and code pushed
- [x] DNS subdomain created: `assets.miragebymag.com`
- [x] Backend .env configured with MongoDB
- [x] Frontend .env.production created
- [x] nginx.conf updated with subdomain
- [x] All configuration files ready

---

## 📋 Server Deployment Steps

### Step 1: Install Required Software (5 min)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx
sudo apt install nginx -y

# Install PM2
sudo npm install -g pm2

# Verify installations
node --version
npm --version
nginx -v
pm2 --version
```

---

### Step 2: Clone Repository (2 min)

```bash
# Create directory
sudo mkdir -p /var/www

# Clone from GitHub
cd /var/www
sudo git clone https://github.com/junaid369/asset-management-app.git asset-management

# Set ownership
sudo chown -R $USER:$USER /var/www/asset-management

# Navigate to project
cd /var/www/asset-management
```

---

### Step 3: Configure Environment Variables (3 min)

**Backend .env is already configured!** ✅

Verify it has correct values:
```bash
cat backend/.env
```

Should show:
```
MONGODB_URI=mongodb+srv://esmatajar:...@magcoffee.turzd.mongodb.net/asset-management
JWT_SECRET=asset_mgmt_secret_key_2024_change_in_production
PORT=5000
NODE_ENV=production
CLIENT_URL=https://assets.miragebymag.com
```

**Frontend .env.production is configured!** ✅

Verify:
```bash
cat frontend/.env.production
```

Should show:
```
REACT_APP_API_URL=https://assets.miragebymag.com/api
```

---

### Step 4: Install Dependencies (5 min)

```bash
# Backend
cd /var/www/asset-management/backend
npm install --production

# Frontend
cd /var/www/asset-management/frontend
npm install
```

---

### Step 5: Build Frontend (3 min)

```bash
cd /var/www/asset-management/frontend
npm run build
```

This creates the `build/` folder that Nginx will serve.

---

### Step 6: Setup Nginx (2 min)

```bash
# Copy nginx config to sites-available
sudo cp /var/www/asset-management/nginx.conf /etc/nginx/sites-available/asset-management

# Create symbolic link to sites-enabled
sudo ln -s /etc/nginx/sites-available/asset-management /etc/nginx/sites-enabled/asset-management

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Enable Nginx on boot
sudo systemctl enable nginx
```

---

### Step 7: Configure Firewall (1 min)

```bash
# Allow SSH (important!)
sudo ufw allow OpenSSH

# Allow HTTP & HTTPS
sudo ufw allow 'Nginx Full'

# Enable firewall
sudo ufw --force enable

# Check status
sudo ufw status
```

---

### Step 8: Start Backend with PM2 (2 min)

```bash
cd /var/www/asset-management

# Create logs directory
mkdir -p logs

# Start backend
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Copy and run the command that PM2 outputs
```

---

### Step 9: Verify Everything Works (1 min)

```bash
# Check PM2 status
pm2 list

# Check Nginx status
sudo systemctl status nginx

# Test backend directly
curl http://localhost:5000/api/health

# Test through Nginx
curl http://assets.miragebymag.com/api/health
```

**Expected response:**
```json
{"success":true,"message":"Server is running"}
```

---

### Step 10: Setup SSL Certificate (2 min)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d assets.miragebymag.com

# Follow prompts:
# 1. Enter email address
# 2. Agree to terms: Y
# 3. Share email: N (optional)
# 4. Redirect HTTP to HTTPS: 2 (Yes - recommended)
```

Certbot will automatically:
- Obtain SSL certificate
- Update Nginx config for HTTPS
- Setup auto-renewal

**Test auto-renewal:**
```bash
sudo certbot renew --dry-run
```

---

### Step 11: Seed Initial Data (1 min)

```bash
cd /var/www/asset-management/backend
node seed.js
```

**Default admin credentials:**
- Email: `admin@company.com`
- Password: `admin123`

**⚠️ IMPORTANT: Change password immediately after first login!**

---

## ✅ Final Verification

### 1. Check All Services
```bash
# PM2
pm2 list
# Should show: asset-management-backend | online

# Nginx
sudo systemctl status nginx
# Should show: active (running)

# Firewall
sudo ufw status
# Should show: Status: active
```

### 2. Test API Endpoints
```bash
# Health check
curl https://assets.miragebymag.com/api/health

# Should return:
# {"success":true,"message":"Server is running"}
```

### 3. Open in Browser
```
Visit: https://assets.miragebymag.com

Login with:
Email: admin@company.com
Password: admin123
```

---

## 🎯 Architecture Overview

```
User Browser
    ↓
DNS: assets.miragebymag.com → [Your Server IP]
    ↓
Nginx (Port 80/443)
    ├→ Static files → /var/www/asset-management/frontend/build/
    └→ /api/* → Proxy to → http://localhost:5000 (Node.js Backend)
                              ↓
                          MongoDB Atlas (Cloud)
```

**You DON'T need a separate backend subdomain!**
- Frontend: `https://assets.miragebymag.com`
- API: `https://assets.miragebymag.com/api/*`
- Backend runs on `localhost:5000` (not directly accessible - secure!)

---

## 📊 Configuration Summary

| Component | Location/Value |
|-----------|---------------|
| **Domain** | assets.miragebymag.com |
| **Frontend** | /var/www/asset-management/frontend/build |
| **Backend** | localhost:5000 (managed by PM2) |
| **API URL** | https://assets.miragebymag.com/api |
| **Database** | MongoDB Atlas (magcoffee cluster) |
| **SSL** | Let's Encrypt (auto-renewal) |
| **Process Manager** | PM2 |
| **Web Server** | Nginx |

---

## 🔧 Useful Commands

### PM2 Commands
```bash
pm2 list                              # View all processes
pm2 logs asset-management-backend     # View logs
pm2 restart asset-management-backend  # Restart backend
pm2 stop asset-management-backend     # Stop backend
pm2 monit                            # Monitor resources
```

### Nginx Commands
```bash
sudo systemctl status nginx           # Check status
sudo systemctl restart nginx          # Restart
sudo systemctl reload nginx           # Reload config
sudo nginx -t                         # Test config
sudo tail -f /var/log/nginx/asset-management-error.log  # View logs
```

### View Logs
```bash
# Backend logs
pm2 logs

# Nginx access logs
sudo tail -f /var/log/nginx/asset-management-access.log

# Nginx error logs
sudo tail -f /var/log/nginx/asset-management-error.log
```

---

## 🆘 Troubleshooting

### Backend Not Starting
```bash
# Check logs
pm2 logs asset-management-backend

# Check MongoDB connection
# Make sure server IP is whitelisted in MongoDB Atlas

# Restart
pm2 restart asset-management-backend
```

### 502 Bad Gateway
```bash
# Backend is not running
pm2 list
pm2 restart asset-management-backend

# Check if port 5000 is in use
sudo lsof -i :5000
```

### DNS Not Resolving
```bash
# Check DNS propagation
ping assets.miragebymag.com

# Wait 5-30 minutes for DNS propagation
# Use DNS checker: https://dnschecker.org
```

### SSL Certificate Error
```bash
# Make sure DNS is working first
ping assets.miragebymag.com

# Try certbot again
sudo certbot --nginx -d assets.miragebymag.com
```

---

## 🔄 Updating the Application

```bash
# Navigate to project
cd /var/www/asset-management

# Pull latest changes
git pull origin main

# Backend: Install dependencies (if package.json changed)
cd backend
npm install --production

# Frontend: Rebuild
cd ../frontend
npm install
npm run build

# Restart backend
pm2 restart asset-management-backend

# Reload Nginx (if config changed)
sudo systemctl reload nginx
```

---

## 🔐 Security Recommendations

1. **Change default admin password immediately**
2. **Generate strong JWT secret:**
   ```bash
   openssl rand -base64 32
   # Update in backend/.env
   ```
3. **MongoDB Atlas:**
   - Whitelist only your server IP
   - Use strong database password
4. **Keep system updated:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```
5. **Regular backups** of MongoDB Atlas data

---

## ✨ Post-Deployment Tasks

1. Login to system
2. Change admin password
3. Create categories (Laptop, Desktop, Monitor, etc.)
4. Create vendors
5. Add team members
6. Start managing assets!

---

**Total Deployment Time: ~30 minutes**

**Your Asset Management System will be live at:**
# 🚀 https://assets.miragebymag.com

---

## 📞 Support

- GitHub Repo: https://github.com/junaid369/asset-management-app
- MongoDB Atlas: https://cloud.mongodb.com
- Let's Encrypt: https://letsencrypt.org

**Good luck with your deployment! 🎉**

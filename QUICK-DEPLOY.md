# Quick Deployment Checklist

## 🚀 Fast Track Deployment Steps

### 1️⃣ **Server Setup** (5 min)
```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs nginx
sudo npm install -g pm2
```

### 2️⃣ **Clone & Setup Project** (3 min)
```bash
cd /var/www
sudo git clone <your-repo-url> asset-management
sudo chown -R $USER:$USER /var/www/asset-management
cd /var/www/asset-management
```

### 3️⃣ **Configure Environment** (2 min)
```bash
# Backend .env
nano backend/.env
```
```env
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/asset-management
JWT_SECRET=$(openssl rand -base64 32)
PORT=5000
NODE_ENV=production
```

```bash
# Frontend .env
nano frontend/.env.production
```
```env
REACT_APP_API_URL=https://yourdomain.com/api
```

### 4️⃣ **Build Application** (5 min)
```bash
# Backend
cd backend && npm install --production

# Frontend
cd ../frontend && npm install && npm run build
```

### 5️⃣ **Configure Nginx** (2 min)
```bash
# Edit nginx.conf - change yourdomain.com to your actual domain
sudo nano /var/www/asset-management/nginx.conf

# Copy to sites-available
sudo cp /var/www/asset-management/nginx.conf /etc/nginx/sites-available/asset-management

# Create symbolic link
sudo ln -s /etc/nginx/sites-available/asset-management /etc/nginx/sites-enabled/

# Test and restart
sudo nginx -t
sudo systemctl restart nginx
```

### 6️⃣ **Start Backend** (1 min)
```bash
cd /var/www/asset-management
mkdir -p logs
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Run the command it outputs
```

### 7️⃣ **Firewall** (1 min)
```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 8️⃣ **SSL Certificate** (2 min)
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 9️⃣ **Seed Initial Data** (1 min)
```bash
cd /var/www/asset-management/backend
node seed.js
```

**Default Login:**
- Email: `admin@company.com`
- Password: `admin123`

---

## ✅ Quick Verification

```bash
# Check services
pm2 list
sudo systemctl status nginx

# Check logs
pm2 logs
curl https://yourdomain.com/api/health

# Test login at https://yourdomain.com
```

---

## 🔄 Quick Update Commands

```bash
cd /var/www/asset-management
git pull
cd backend && npm install --production
cd ../frontend && npm install && npm run build
pm2 restart asset-management-backend
sudo systemctl restart nginx
```

---

## 📱 Important First Steps After Deployment

1. **Login** with admin credentials
2. **Change admin password** immediately
3. **Create categories** (Laptop, Desktop, Monitor, etc.)
4. **Create vendors** (for purchase orders)
5. **Create users** (managers, employees)
6. **Start adding assets**

---

## 🆘 Quick Troubleshooting

**502 Bad Gateway:**
```bash
pm2 restart asset-management-backend
sudo systemctl restart nginx
```

**Backend not starting:**
```bash
pm2 logs asset-management-backend
# Check MongoDB connection string
```

**Can't access site:**
```bash
# Check DNS
ping yourdomain.com

# Check firewall
sudo ufw status
```

---

**Total Time: ~22 minutes** ⏱️

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed documentation.

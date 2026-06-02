# Subdomain Deployment Guide

## 📌 Scenario
You have a main domain (e.g., `example.com`) and want to deploy the Asset Management System on a subdomain (e.g., `assets.example.com` or `inventory.example.com`)

---

## Step 1: Create Subdomain DNS Record

### Option A: Using cPanel (Most Common)

1. **Login to cPanel**
   - Go to your hosting control panel

2. **Navigate to Domains Section**
   - Find "Subdomains" or "Domains" menu

3. **Create New Subdomain**
   - Subdomain: `assets` (or `inventory`, `manager`, etc.)
   - Domain: `example.com` (your main domain)
   - Document Root: Usually auto-filled, you can ignore this (Nginx will handle it)
   - Click **Create**

4. **Wait for DNS Propagation** (5-30 minutes)
   - Check if it's ready: `ping assets.example.com`

---

### Option B: Using DNS Provider (Cloudflare, GoDaddy, Namecheap, etc.)

1. **Login to DNS Provider Dashboard**

2. **Add DNS Record**
   - **Type**: `A Record`
   - **Name**: `assets` (or your chosen subdomain)
   - **Value/Points to**: Your server IP address (e.g., `123.45.67.89`)
   - **TTL**: Automatic or 3600

3. **Save the Record**

4. **Wait for DNS Propagation** (5-30 minutes)

**Example DNS Records:**
```
Type    Name     Value           TTL
A       assets   123.45.67.89    Auto
A       www      123.45.67.89    Auto   (if you want www.example.com)
```

---

### Option C: Manual DNS Zone File (Advanced)

If you manage DNS manually:

```dns
assets.example.com.    IN    A    123.45.67.89
```

---

## Step 2: Update Nginx Configuration

Edit your nginx configuration file:

```bash
sudo nano /var/www/asset-management/nginx.conf
```

**Change the `server_name` line:**

### Before:
```nginx
server_name yourdomain.com www.yourdomain.com;
```

### After (Subdomain Only):
```nginx
server_name assets.example.com;
```

**Or if you want both www subdomain and without www:**
```nginx
server_name assets.example.com www.assets.example.com;
```

**Complete example configuration:**

```nginx
server {
    listen 80;
    listen [::]:80;

    # Your subdomain
    server_name assets.example.com;

    # Root directory for React build
    root /var/www/asset-management/frontend/build;
    index index.html;

    # Client max body size
    client_max_body_size 50M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_proxied any;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Backend API proxy
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # React app - serve static files
    location / {
        try_files $uri $uri/ /index.html;

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Deny access to hidden files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    # Logging
    access_log /var/log/nginx/asset-management-access.log;
    error_log /var/log/nginx/asset-management-error.log;
}
```

---

## Step 3: Update Environment Variables

### Backend Environment (.env)

```bash
nano /var/www/asset-management/backend/.env
```

**Update CLIENT_URL to match your subdomain:**

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/asset-management
JWT_SECRET=your-super-secret-jwt-key
PORT=5000
NODE_ENV=production
CLIENT_URL=https://assets.example.com
```

### Frontend Environment

```bash
nano /var/www/asset-management/frontend/.env.production
```

```env
REACT_APP_API_URL=https://assets.example.com/api
```

---

## Step 4: Copy Config to Nginx sites-available

```bash
sudo cp /var/www/asset-management/nginx.conf /etc/nginx/sites-available/asset-management
```

---

## Step 5: Create Symbolic Link

```bash
sudo ln -s /etc/nginx/sites-available/asset-management /etc/nginx/sites-enabled/asset-management
```

---

## Step 6: Test Nginx Configuration

```bash
sudo nginx -t
```

**Expected output:**
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

---

## Step 7: Restart Nginx

```bash
sudo systemctl restart nginx
```

---

## Step 8: Verify DNS Propagation

```bash
# Check if subdomain resolves to your server IP
ping assets.example.com

# Or use dig
dig assets.example.com

# Or use nslookup
nslookup assets.example.com
```

**Expected result:**
```
PING assets.example.com (123.45.67.89) 56(84) bytes of data.
```

---

## Step 9: Setup SSL Certificate for Subdomain

```bash
# Install Certbot (if not already installed)
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate for subdomain
sudo certbot --nginx -d assets.example.com

# Or if you want www subdomain too
sudo certbot --nginx -d assets.example.com -d www.assets.example.com
```

**Certbot will:**
- Obtain SSL certificate from Let's Encrypt
- Automatically update your Nginx config for HTTPS
- Set up automatic renewal

**Test SSL renewal:**
```bash
sudo certbot renew --dry-run
```

---

## Step 10: Rebuild Frontend with New API URL

Since you changed the API URL:

```bash
cd /var/www/asset-management/frontend
npm run build
```

---

## Step 11: Restart Backend (if .env changed)

```bash
pm2 restart asset-management-backend
```

---

## ✅ Verification Checklist

```bash
# 1. Check DNS resolution
ping assets.example.com

# 2. Check Nginx is running
sudo systemctl status nginx

# 3. Check backend is running
pm2 list

# 4. Test backend health endpoint
curl http://localhost:5000/api/health

# 5. Test through Nginx
curl http://assets.example.com/api/health

# 6. Test SSL (after certbot)
curl https://assets.example.com/api/health

# 7. Open in browser
# https://assets.example.com
```

---

## 🌐 Common Subdomain Choices

Choose a subdomain that makes sense for your organization:

- `assets.example.com` ✅ (Asset management)
- `inventory.example.com` ✅ (Inventory focus)
- `manager.example.com` ✅ (Management portal)
- `am.example.com` ✅ (Short form)
- `it.example.com` ✅ (IT department)
- `internal.example.com` ✅ (Internal use)

---

## 🔧 Troubleshooting

### Subdomain Not Resolving

**Check DNS:**
```bash
ping assets.example.com
# If it doesn't resolve, DNS is not propagated yet
```

**Solutions:**
- Wait 5-30 minutes for DNS propagation
- Check DNS records in your provider dashboard
- Make sure you used the correct server IP

### 502 Bad Gateway

**Cause:** Backend not running

**Fix:**
```bash
pm2 list
pm2 restart asset-management-backend
```

### Certificate Error "DNS challenge failed"

**Cause:** DNS not propagated yet

**Fix:**
```bash
# Wait for DNS to propagate
ping assets.example.com

# Try certbot again
sudo certbot --nginx -d assets.example.com
```

### CORS Errors

**Cause:** CLIENT_URL in backend .env doesn't match your subdomain

**Fix:**
```bash
nano /var/www/asset-management/backend/.env
# Update CLIENT_URL=https://assets.example.com
pm2 restart asset-management-backend
```

---

## 📝 Complete Command Summary (Subdomain Setup)

```bash
# 1. Update nginx.conf with subdomain
sudo nano /var/www/asset-management/nginx.conf
# Change: server_name assets.example.com;

# 2. Update backend .env
nano /var/www/asset-management/backend/.env
# Set: CLIENT_URL=https://assets.example.com

# 3. Update frontend .env
nano /var/www/asset-management/frontend/.env.production
# Set: REACT_APP_API_URL=https://assets.example.com/api

# 4. Rebuild frontend
cd /var/www/asset-management/frontend
npm run build

# 5. Copy nginx config
sudo cp /var/www/asset-management/nginx.conf /etc/nginx/sites-available/asset-management

# 6. Create symbolic link
sudo ln -s /etc/nginx/sites-available/asset-management /etc/nginx/sites-enabled/asset-management

# 7. Test and restart nginx
sudo nginx -t
sudo systemctl restart nginx

# 8. Restart backend
pm2 restart asset-management-backend

# 9. Setup SSL
sudo certbot --nginx -d assets.example.com

# 10. Test
curl https://assets.example.com/api/health
```

---

## 🎯 Example: Complete Setup

**Your details:**
- Main domain: `mycompany.com`
- Subdomain: `assets.mycompany.com`
- Server IP: `123.45.67.89`

### 1. DNS Record (in Cloudflare/cPanel/etc):
```
Type: A
Name: assets
Value: 123.45.67.89
```

### 2. Nginx config:
```nginx
server_name assets.mycompany.com;
```

### 3. Backend .env:
```env
CLIENT_URL=https://assets.mycompany.com
```

### 4. Frontend .env.production:
```env
REACT_APP_API_URL=https://assets.mycompany.com/api
```

### 5. SSL Command:
```bash
sudo certbot --nginx -d assets.mycompany.com
```

**Done! Access at: https://assets.mycompany.com** 🎉

---

## 🔐 Security Note

Subdomains get their own SSL certificate from Let's Encrypt. The certificate is specific to your subdomain (e.g., `assets.example.com`) and doesn't affect your main domain certificate.

---

## 📱 Mobile/App Configuration

If you plan to create a mobile app later, use your subdomain as the API base URL:

```javascript
// In mobile app
const API_BASE_URL = 'https://assets.example.com/api';
```

---

## 🆘 Need Help?

1. **DNS not working?**
   - Check DNS records in your provider
   - Wait for propagation (can take up to 48 hours, usually 5-30 min)
   - Use online DNS checker: https://dnschecker.org

2. **SSL not working?**
   - Make sure subdomain resolves first (`ping assets.example.com`)
   - Check Nginx logs: `sudo tail -f /var/log/nginx/asset-management-error.log`

3. **Still having issues?**
   - Check all logs: `pm2 logs` and `sudo nginx -t`
   - Verify all environment variables
   - Make sure firewall allows HTTP/HTTPS

---

**Your subdomain deployment is ready! 🚀**

Access your Asset Management System at: **https://assets.yourcompany.com**

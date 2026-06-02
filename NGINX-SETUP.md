# Nginx Configuration Setup

## Step-by-Step Nginx Configuration

### 1. Edit the Nginx Configuration File

Open the `nginx.conf` file in your project:

```bash
nano /var/www/asset-management/nginx.conf
```

**Replace these values:**
- `yourdomain.com` → Your actual domain name
- `www.yourdomain.com` → Your www subdomain (optional)

**Example:**
If your domain is `assets.example.com`, change:
```nginx
server_name yourdomain.com www.yourdomain.com;
```
To:
```nginx
server_name assets.example.com;
```

### 2. Copy Configuration to sites-available

```bash
sudo cp /var/www/asset-management/nginx.conf /etc/nginx/sites-available/asset-management
```

### 3. Create Symbolic Link to sites-enabled

```bash
sudo ln -s /etc/nginx/sites-available/asset-management /etc/nginx/sites-enabled/asset-management
```

**What this does:**
- Creates a symbolic link (shortcut) from `sites-enabled` → `sites-available`
- Nginx reads all configs in `sites-enabled` directory
- This activates your site configuration

### 4. Remove Default Site (Optional)

```bash
sudo rm /etc/nginx/sites-enabled/default
```

### 5. Test Nginx Configuration

```bash
sudo nginx -t
```

**Expected output:**
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### 6. Restart Nginx

```bash
sudo systemctl restart nginx
```

### 7. Enable Nginx to Start on Boot

```bash
sudo systemctl enable nginx
```

### 8. Check Nginx Status

```bash
sudo systemctl status nginx
```

**Expected output:**
```
● nginx.service - A high performance web server and a reverse proxy server
   Loaded: loaded (/lib/systemd/system/nginx.service; enabled)
   Active: active (running)
```

---

## Verify Configuration

### Check if Site is Active

```bash
# List all enabled sites
ls -la /etc/nginx/sites-enabled/

# You should see: asset-management -> /etc/nginx/sites-available/asset-management
```

### Test from Server

```bash
# Test API endpoint
curl http://localhost:5000/api/health

# Test through Nginx
curl http://localhost/api/health
```

---

## Common Nginx Commands

```bash
# Start Nginx
sudo systemctl start nginx

# Stop Nginx
sudo systemctl stop nginx

# Restart Nginx
sudo systemctl restart nginx

# Reload configuration (no downtime)
sudo systemctl reload nginx

# Test configuration
sudo nginx -t

# View status
sudo systemctl status nginx

# Enable autostart
sudo systemctl enable nginx

# Disable autostart
sudo systemctl disable nginx
```

---

## Nginx Logs Location

```bash
# Access logs
sudo tail -f /var/log/nginx/asset-management-access.log

# Error logs
sudo tail -f /var/log/nginx/asset-management-error.log

# All Nginx logs
sudo tail -f /var/log/nginx/*.log
```

---

## Troubleshooting

### Port 80 Already in Use

```bash
# Check what's using port 80
sudo lsof -i :80

# Kill the process (if safe)
sudo kill <PID>
```

### Permission Denied Errors

```bash
# Fix Nginx user permissions
sudo chown -R www-data:www-data /var/www/asset-management/frontend/build

# Check Nginx user
ps aux | grep nginx
```

### 502 Bad Gateway

**Cause:** Backend (port 5000) is not running

**Fix:**
```bash
# Check if backend is running
pm2 list

# Restart backend
pm2 restart asset-management-backend

# Check backend directly
curl http://localhost:5000/api/health
```

### Configuration Test Fails

```bash
# View detailed error
sudo nginx -t

# Common issues:
# - Missing semicolons
# - Wrong file paths
# - Duplicate server_name
```

### Can't Access Site from Browser

1. **Check DNS:** Make sure domain points to server IP
   ```bash
   ping yourdomain.com
   ```

2. **Check Firewall:**
   ```bash
   sudo ufw status
   sudo ufw allow 'Nginx Full'
   ```

3. **Check Nginx is running:**
   ```bash
   sudo systemctl status nginx
   ```

---

## SSL Configuration (After Initial Setup)

Once your site is accessible via HTTP:

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com

# Certbot will automatically:
# - Obtain certificate
# - Update Nginx config
# - Enable HTTPS redirect
```

**Test SSL renewal:**
```bash
sudo certbot renew --dry-run
```

---

## Directory Structure

```
/etc/nginx/
├── nginx.conf                          # Main Nginx config
├── sites-available/
│   └── asset-management               # Your site config (actual file)
└── sites-enabled/
    └── asset-management → ../sites-available/asset-management  # Symbolic link
```

**Why this structure?**
- `sites-available`: Store all site configurations
- `sites-enabled`: Only active sites (via symbolic links)
- Easy to enable/disable sites without deleting configs

---

## Enable/Disable Site

### Disable Site
```bash
sudo rm /etc/nginx/sites-enabled/asset-management
sudo systemctl reload nginx
```

### Enable Site Again
```bash
sudo ln -s /etc/nginx/sites-available/asset-management /etc/nginx/sites-enabled/
sudo systemctl reload nginx
```

---

## Multiple Domains on Same Server

If you have multiple sites:

1. Create separate config files in `sites-available`:
   - `asset-management`
   - `another-site`

2. Create symbolic links for active sites:
   ```bash
   sudo ln -s /etc/nginx/sites-available/asset-management /etc/nginx/sites-enabled/
   sudo ln -s /etc/nginx/sites-available/another-site /etc/nginx/sites-enabled/
   ```

3. Each config file should have unique `server_name`

---

## Quick Reference: Symbolic Link Command

**Create symbolic link:**
```bash
sudo ln -s /etc/nginx/sites-available/asset-management /etc/nginx/sites-enabled/asset-management
```

**Break down:**
- `ln -s`: Create symbolic link
- First path: Source (actual file)
- Second path: Link location

**Verify link:**
```bash
ls -la /etc/nginx/sites-enabled/
```

---

**Your Nginx configuration is now complete! ✅**

Next step: Start your backend with PM2 (see [DEPLOYMENT.md](./DEPLOYMENT.md))

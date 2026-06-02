# Subdomain Architecture Diagram

## 🌐 How Your Subdomain Setup Works

```
┌─────────────────────────────────────────────────────────────┐
│                         INTERNET                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ User visits
                              │ https://assets.company.com
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      DNS PROVIDER                           │
│  (Cloudflare / GoDaddy / Namecheap / cPanel)              │
│                                                             │
│  A Record:                                                  │
│  ┌──────────────────────────────────────┐                  │
│  │ Name:  assets.company.com            │                  │
│  │ Type:  A                             │                  │
│  │ Value: 123.45.67.89 (Server IP)     │                  │
│  └──────────────────────────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ DNS resolves to Server IP
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      YOUR SERVER                            │
│                    (123.45.67.89)                           │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │              NGINX (Port 80/443)                      │ │
│  │  Listens on: assets.company.com                       │ │
│  │                                                        │ │
│  │  Configuration:                                        │ │
│  │  /etc/nginx/sites-available/asset-management          │ │
│  │           ↓ (symbolic link)                           │ │
│  │  /etc/nginx/sites-enabled/asset-management            │ │
│  └───────────────────────────────────────────────────────┘ │
│                              │                              │
│               ┌──────────────┴──────────────┐              │
│               │                              │              │
│               ▼                              ▼              │
│  ┌─────────────────────┐      ┌──────────────────────────┐│
│  │   STATIC FILES      │      │    API REQUESTS          ││
│  │   /*, /*.js, etc    │      │    /api/*                ││
│  │                     │      │                          ││
│  │   Served from:      │      │   Proxied to:            ││
│  │   /var/www/         │      │   http://localhost:5000  ││
│  │   asset-management/ │      │                          ││
│  │   frontend/build/   │      └──────────┬───────────────┘│
│  │                     │                 │                 │
│  │   • index.html      │                 ▼                 │
│  │   • bundle.js       │      ┌──────────────────────────┐│
│  │   • styles.css      │      │   NODE.JS BACKEND       ││
│  │   • images, etc     │      │   (Port 5000)            ││
│  └─────────────────────┘      │                          ││
│                               │   Managed by PM2:         ││
│                               │   asset-management-       ││
│                               │   backend                 ││
│                               │                          ││
│                               │   • API Routes           ││
│                               │   • Business Logic       ││
│                               │   • Auth & JWT          ││
│                               └──────────┬───────────────┘│
│                                          │                 │
│                                          │ Database Queries│
│                                          ▼                 │
│                               ┌──────────────────────────┐│
│                               │   MongoDB Connection     ││
│                               │   (External)             ││
│                               └──────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                                          │
                                          │ Internet
                                          ▼
                               ┌──────────────────────────┐
                               │   MONGODB ATLAS          │
                               │   (Cloud Database)       │
                               │                          │
                               │   • Assets Collection    │
                               │   • Users Collection     │
                               │   • POs Collection       │
                               │   • Vendors Collection   │
                               └──────────────────────────┘
```

---

## 🔄 Request Flow Example

### Example 1: Loading the Login Page

```
1. User types: https://assets.company.com
   ↓
2. DNS resolves: assets.company.com → 123.45.67.89
   ↓
3. Request hits Nginx (Port 443/HTTPS)
   ↓
4. Nginx matches: server_name assets.company.com
   ↓
5. Nginx serves: /var/www/asset-management/frontend/build/index.html
   ↓
6. Browser loads: React application
```

### Example 2: Login API Call

```
1. User submits login form
   ↓
2. React sends POST: https://assets.company.com/api/auth/login
   ↓
3. Nginx receives: /api/auth/login
   ↓
4. Nginx proxies to: http://localhost:5000/api/auth/login
   ↓
5. Node.js backend validates credentials
   ↓
6. Backend queries MongoDB Atlas
   ↓
7. MongoDB returns user data
   ↓
8. Backend generates JWT token
   ↓
9. Response flows back: Backend → Nginx → Browser
   ↓
10. User logged in! 🎉
```

---

## 📂 Directory Structure on Server

```
/var/www/asset-management/
│
├── backend/
│   ├── server.js           # Main backend entry
│   ├── .env                # Environment variables (MongoDB, JWT)
│   ├── models/             # Mongoose models
│   ├── controllers/        # API controllers
│   ├── routes/             # API routes
│   └── node_modules/       # Dependencies
│
├── frontend/
│   ├── build/              # ← Nginx serves from here!
│   │   ├── index.html
│   │   ├── static/
│   │   │   ├── js/
│   │   │   ├── css/
│   │   │   └── media/
│   │   └── asset-manifest.json
│   ├── src/                # React source (not used in production)
│   └── package.json
│
├── logs/                   # PM2 logs
│   ├── backend-error.log
│   ├── backend-out.log
│   └── backend-combined.log
│
├── nginx.conf              # Nginx configuration template
├── ecosystem.config.js     # PM2 configuration
└── DEPLOYMENT.md           # This guide!
```

---

## 🔗 Nginx Sites Structure

```
/etc/nginx/
│
├── nginx.conf              # Main Nginx config
│
├── sites-available/        # All available site configs
│   ├── asset-management    # ← Your config (actual file)
│   ├── other-site
│   └── another-site
│
└── sites-enabled/          # Active sites (symbolic links)
    └── asset-management → ../sites-available/asset-management
```

**The symbolic link command:**
```bash
sudo ln -s /etc/nginx/sites-available/asset-management /etc/nginx/sites-enabled/asset-management
```

**What it does:**
- Creates a "shortcut" from sites-enabled → sites-available
- Nginx only reads configs in sites-enabled
- This activates your site without duplicating files

---

## 🔐 SSL/HTTPS Flow (After Certbot)

```
User Browser
    ↓
    HTTPS (Port 443) - Encrypted
    ↓
Nginx (with SSL certificate from Let's Encrypt)
    │
    ├─→ Static files: Serve directly
    │
    └─→ API requests: Proxy to http://localhost:5000
            ↓
        Node.js Backend (local, no SSL needed)
            ↓
        MongoDB Atlas (SSL/TLS by default)
```

**SSL Certificate Location (after Certbot):**
```
/etc/letsencrypt/live/assets.company.com/
├── fullchain.pem      # Certificate
├── privkey.pem        # Private key
├── chain.pem
└── cert.pem
```

---

## 🚦 Port Usage

| Service | Port | Access | Purpose |
|---------|------|--------|---------|
| Nginx | 80 | Public | HTTP (redirects to HTTPS) |
| Nginx | 443 | Public | HTTPS (encrypted) |
| Node.js | 5000 | Internal | Backend API (localhost only) |
| MongoDB | 27017 | External | Database (MongoDB Atlas) |

**Security:**
- Only ports 80 and 443 are open to public
- Backend port 5000 is only accessible via localhost
- Nginx acts as reverse proxy and security layer

---

## 🎯 Why Subdomain is Better

### ✅ Advantages:

1. **Clean separation**
   - Main site: `company.com` (marketing/website)
   - App: `assets.company.com` (application)

2. **Easy management**
   - Different SSL certificates
   - Independent deployments
   - Separate Nginx configs

3. **Professional**
   - `assets.company.com` looks better than `company.com/assets`
   - Easier to remember

4. **Scalability**
   - Can add more subdomains later:
     - `api.company.com` (dedicated API)
     - `admin.company.com` (admin panel)
     - `reports.company.com` (reporting)

5. **CORS friendly**
   - Subdomains handle CORS better
   - No issues with cookies/sessions

---

## 🌟 Real-World Example

**Your Company:** "MagCoffee"
**Main Domain:** `magcoffee.com`

**Setup:**
```
magcoffee.com              → Main website (marketing)
assets.magcoffee.com       → Asset Management System
inventory.magcoffee.com    → Future inventory system
hr.magcoffee.com           → Future HR portal
```

**DNS Records:**
```
A    magcoffee.com          →  server1_ip
A    assets.magcoffee.com   →  server2_ip (your server)
A    www.magcoffee.com      →  server1_ip
```

---

## 🔍 Testing Your Setup

### 1. DNS Check
```bash
# Check if subdomain resolves
ping assets.company.com

# Detailed DNS info
dig assets.company.com

# Check from different locations
# Visit: https://dnschecker.org
# Enter: assets.company.com
```

### 2. Nginx Check
```bash
# Test configuration
sudo nginx -t

# Check if Nginx is running
sudo systemctl status nginx

# Check which sites are enabled
ls -la /etc/nginx/sites-enabled/
```

### 3. Backend Check
```bash
# Check PM2 status
pm2 list

# Test backend directly
curl http://localhost:5000/api/health

# View backend logs
pm2 logs asset-management-backend
```

### 4. End-to-End Check
```bash
# Test API through Nginx
curl https://assets.company.com/api/health

# Should return:
# {"success":true,"message":"Server is running"}
```

### 5. Browser Check
```
Open: https://assets.company.com
Login: admin@company.com / admin123
```

---

## 📊 Performance Flow

```
CDN (Optional)
    ↓
Nginx (Caching, Gzip Compression)
    ↓
Static Files: Served directly (fast!)
    ↓
API Requests: Proxied to Node.js
    ↓
Node.js Backend (PM2 managed, auto-restart)
    ↓
MongoDB Atlas (Indexed queries, replicated)
```

---

**Your subdomain setup is now clear! 🎉**

**See:**
- [SUBDOMAIN-SETUP.md](./SUBDOMAIN-SETUP.md) - Detailed steps
- [SUBDOMAIN-QUICK-STEPS.md](./SUBDOMAIN-QUICK-STEPS.md) - Fast checklist

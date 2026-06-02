# ⚡ Subdomain Setup - Quick Steps

## Your Situation:
✅ You have a main domain
✅ You want to create a subdomain
✅ Deploy Asset Management on the subdomain

---

## 🎯 Example
**Main domain:** `company.com`
**Subdomain:** `assets.company.com`
**Server IP:** Your server IP (e.g., `123.45.67.89`)

---

## 📋 Step-by-Step Checklist

### ☑️ Step 1: Create DNS Record (5 minutes)

**In cPanel:**
1. Login to cPanel
2. Go to **Domains** → **Subdomains**
3. Create subdomain: `assets`
4. Domain: `company.com`
5. Click **Create**

**OR in DNS Provider (Cloudflare/GoDaddy/Namecheap):**
1. Login to DNS dashboard
2. Add **A Record**:
   - Name: `assets`
   - Value: `Your Server IP`
   - TTL: Auto
3. Save

**Wait 5-30 minutes for DNS propagation**

**Test:**
```bash
ping assets.company.com
```

---

### ☑️ Step 2: Update Nginx Config (2 minutes)

```bash
nano /var/www/asset-management/nginx.conf
```

**Find this line:**
```nginx
server_name yourdomain.com www.yourdomain.com;
```

**Change to:**
```nginx
server_name assets.company.com;
```

**Save and exit:** `Ctrl+X`, `Y`, `Enter`

---

### ☑️ Step 3: Update Backend Environment (1 minute)

```bash
nano /var/www/asset-management/backend/.env
```

**Update these lines:**
```env
CLIENT_URL=https://assets.company.com
```

**Save and exit**

---

### ☑️ Step 4: Update Frontend Environment (1 minute)

```bash
nano /var/www/asset-management/frontend/.env.production
```

**Add/Update:**
```env
REACT_APP_API_URL=https://assets.company.com/api
```

**Save and exit**

---

### ☑️ Step 5: Rebuild Frontend (3 minutes)

```bash
cd /var/www/asset-management/frontend
npm run build
```

---

### ☑️ Step 6: Setup Nginx (1 minute)

```bash
# Copy config
sudo cp /var/www/asset-management/nginx.conf /etc/nginx/sites-available/asset-management

# Create symbolic link (THIS IS WHAT YOU ASKED FOR!)
sudo ln -s /etc/nginx/sites-available/asset-management /etc/nginx/sites-enabled/asset-management

# Test
sudo nginx -t

# Restart
sudo systemctl restart nginx
```

---

### ☑️ Step 7: Restart Backend (30 seconds)

```bash
pm2 restart asset-management-backend
```

---

### ☑️ Step 8: Setup SSL Certificate (2 minutes)

```bash
sudo certbot --nginx -d assets.company.com
```

**Follow prompts:**
- Enter email
- Agree to terms
- Choose redirect HTTP to HTTPS: **Yes**

---

### ☑️ Step 9: Test Everything! (1 minute)

```bash
# Test backend health
curl https://assets.company.com/api/health

# Should return: {"success":true,"message":"Server is running"}
```

**Open browser:**
```
https://assets.company.com
```

**Login with:**
- Email: `admin@company.com`
- Password: `admin123`

---

## 🎉 Done! Total Time: ~15-20 minutes

---

## 📝 Quick Reference: Files You Need to Edit

| File | What to Change | Example |
|------|---------------|---------|
| `nginx.conf` | `server_name` | `assets.company.com` |
| `backend/.env` | `CLIENT_URL` | `https://assets.company.com` |
| `frontend/.env.production` | `REACT_APP_API_URL` | `https://assets.company.com/api` |

---

## 🔍 Verification Commands

```bash
# 1. Check DNS
ping assets.company.com

# 2. Check Nginx
sudo systemctl status nginx

# 3. Check Backend
pm2 list

# 4. Check API
curl https://assets.company.com/api/health

# 5. Check SSL
curl -I https://assets.company.com
```

---

## 🆘 Quick Troubleshooting

**"ping: cannot resolve"**
→ DNS not propagated yet, wait 10-20 minutes

**"502 Bad Gateway"**
→ Backend not running:
```bash
pm2 restart asset-management-backend
```

**"ERR_CERT_COMMON_NAME_INVALID"**
→ SSL not setup yet, run:
```bash
sudo certbot --nginx -d assets.company.com
```

**"CORS error in browser"**
→ Wrong CLIENT_URL in backend .env:
```bash
nano /var/www/asset-management/backend/.env
# Fix CLIENT_URL
pm2 restart asset-management-backend
```

---

## 💡 Pro Tips

1. **Choose a good subdomain name:**
   - `assets.company.com` ✅
   - `inventory.company.com` ✅
   - `manager.company.com` ✅

2. **After deployment:**
   - Change admin password immediately
   - Create categories
   - Add vendors
   - Invite team members

3. **Keep it secure:**
   - Use strong passwords
   - Enable 2FA in MongoDB Atlas
   - Regular backups
   - Keep system updated

---

## 📞 The ONE Command You Asked For

**"Create symbolic link to sites-enabled"**

```bash
sudo ln -s /etc/nginx/sites-available/asset-management /etc/nginx/sites-enabled/asset-management
```

This creates a link from `sites-enabled` → `sites-available`, activating your site.

---

**See [SUBDOMAIN-SETUP.md](./SUBDOMAIN-SETUP.md) for detailed guide**

**Ready to deploy! 🚀**

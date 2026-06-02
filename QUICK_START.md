# Quick Start Guide

## Prerequisites
- Node.js (v14+)
- MongoDB (v4.4+)
- npm or yarn

## Installation (5 minutes)

### Option 1: Automated Setup
```bash
# Make setup script executable
chmod +x setup.sh

# Run setup
./setup.sh
```

### Option 2: Manual Setup
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## Database Setup

### Start MongoDB
```bash
# Linux/Mac
sudo systemctl start mongodb

# Or
mongod
```

### Seed Initial Data
```bash
cd backend
node seed.js
```

This creates:
- 3 users (admin, manager, employee)
- 7 categories
- 4 departments

## Running the Application

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```
Server runs on: http://localhost:5000

### Terminal 2 - Frontend
```bash
cd frontend
npm start
```
App opens on: http://localhost:3000

## Login Credentials

After seeding the database:

**Admin Account:**
- Email: `admin@company.com`
- Password: `admin123`

**Manager Account:**
- Email: `manager@company.com`
- Password: `manager123`

**Employee Account:**
- Email: `employee@company.com`
- Password: `employee123`

## First Steps After Login

### As Admin:

1. **Add Categories** (if not seeded)
   - Navigate to Categories
   - Click "Add Category"
   - Add: Computers, Studio Equipment, Network Equipment, etc.

2. **Add Users**
   - Navigate to Users
   - Click "Add User"
   - Fill in employee details

3. **Add Assets**
   - Navigate to Assets
   - Click "Add Asset"
   - Fill in asset information
   - QR code is generated automatically

4. **Assign Assets**
   - Go to asset details
   - Click "Assign Asset"
   - Select employee
   - Add notes and expected return date

5. **View Dashboard**
   - Check asset statistics
   - View distribution charts
   - Monitor asset values

## Common Tasks

### Adding an Asset
1. Assets → Add Asset
2. Enter Asset Tag (unique)
3. Enter Name
4. Select Category
5. Add specifications
6. Save

### Assigning an Asset
1. Assets → Click on asset
2. Click "Assign Asset"
3. Select user
4. Add notes (optional)
5. Click "Assign"

### Returning an Asset
1. Go to assigned asset
2. Click "Return Asset"
3. Select condition
4. Add return notes
5. Click "Return"

### Managing Users
1. Users → Add User
2. Enter details
3. Select role (admin/manager/employee)
4. Save

## API Testing

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"admin123"}'
```

### Get Assets (with token)
```bash
curl http://localhost:5000/api/assets \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Troubleshooting

### Port 5000 Already in Use
```bash
# Change PORT in backend/.env
PORT=5001
```

### MongoDB Not Running
```bash
# Check status
sudo systemctl status mongodb

# Start MongoDB
sudo systemctl start mongodb
```

### Frontend Port Issue
```bash
# Kill process on port 3000
sudo lsof -ti:3000 | xargs kill -9

# Or set different port
PORT=3001 npm start
```

### Dependencies Error
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Can't Login
1. Verify backend is running (http://localhost:5000/api/health)
2. Check MongoDB is running
3. Run seed script again: `node backend/seed.js`
4. Check console for errors

## Project Structure

```
asset-managment/
├── backend/          # Node.js + Express API
│   ├── config/       # Database connection
│   ├── controllers/  # Business logic
│   ├── models/       # MongoDB schemas
│   ├── routes/       # API endpoints
│   ├── middleware/   # Auth & error handling
│   └── utils/        # Helper functions
│
├── frontend/         # React application
│   ├── src/
│   │   ├── pages/    # Main pages
│   │   ├── components/ # Reusable components
│   │   ├── services/ # API calls
│   │   └── context/  # Global state
│   └── public/       # Static files
│
└── docs/            # Documentation
```

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/asset-management
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
NODE_ENV=development
```

## Development Tips

### Hot Reload
- Backend: Uses nodemon (auto-restart on file change)
- Frontend: Uses React hot reload (auto-refresh)

### Debugging
- Backend logs: Check terminal running backend
- Frontend logs: Check browser console (F12)
- MongoDB logs: Check MongoDB service logs

### Code Editor Setup
Recommended VS Code extensions:
- ES7+ React/Redux/React-Native snippets
- ESLint
- Prettier
- MongoDB for VS Code

## Production Deployment

### Build Frontend
```bash
cd frontend
npm run build
```

### Run Backend in Production
```bash
cd backend
NODE_ENV=production npm start
```

### Important for Production
1. Change JWT_SECRET to strong random string
2. Update MONGODB_URI to production database
3. Enable HTTPS
4. Configure CORS properly
5. Set up process manager (PM2)
6. Enable MongoDB authentication
7. Regular backups

## Support

- Documentation: See [README.md](README.md)
- Project Summary: See [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)
- Issues: Check console logs and error messages

## Next Steps

1. Customize categories for your company
2. Add your departments
3. Import existing assets
4. Train users on the system
5. Set up regular backups
6. Configure email notifications (future)
7. Customize branding (logos, colors)

Happy Asset Managing! 🎉

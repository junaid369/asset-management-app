# Asset Management System

A comprehensive web-based asset management system for tracking company equipment, IT assets, and studio gear. Built with React.js, Node.js, Express, and MongoDB.

## Features

### Asset Management
- Create, read, update, and delete assets
- Track asset details (brand, model, serial number, etc.)
- Asset categorization
- QR code generation for each asset
- Asset assignment to employees
- Track asset status (available, assigned, maintenance, retired)
- Asset lifecycle management
- Depreciation tracking

### User Management
- Role-based access control (Admin, Manager, Employee)
- User profile management
- Employee directory
- Department management

### Dashboard & Analytics
- Real-time asset statistics
- Asset status distribution charts
- Asset value tracking
- Category-wise asset breakdown
- Interactive data visualizations

### Additional Features
- Assignment history tracking
- Maintenance scheduling
- Audit logging
- Search and filtering
- Responsive design for mobile and desktop

## Tech Stack

### Frontend
- **React.js** - UI framework
- **Material-UI (MUI)** - Component library
- **React Router** - Navigation
- **Axios** - HTTP client
- **Recharts** - Data visualization
- **Context API** - State management

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **QRCode** - QR code generation

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

## Installation

### 1. Clone the repository or navigate to the project directory

```bash
cd asset-managment
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file (already exists, but verify settings)
# The .env file should contain:
# PORT=5000
# MONGODB_URI=mongodb://localhost:27017/asset-management
# JWT_SECRET=your_jwt_secret_key
# JWT_EXPIRE=7d
# NODE_ENV=development

# Start MongoDB (if not running)
# On Linux/Mac:
sudo systemctl start mongodb
# Or:
mongod

# Start the backend server
npm run dev
# Or for production:
npm start
```

The backend server will start on `http://localhost:5000`

### 3. Frontend Setup

Open a new terminal window:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The frontend application will start on `http://localhost:3000`

## Default User Credentials

For first-time setup, you'll need to create an admin user. You can do this by:

1. Using the registration endpoint directly:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Admin",
    "lastName": "User",
    "email": "admin@company.com",
    "password": "admin123",
    "role": "admin"
  }'
```

2. Or use a MongoDB client to insert directly into the database.

Then login with:
- **Email**: admin@company.com
- **Password**: admin123

**Important**: Change these credentials after first login!

## Project Structure

```
asset-managment/
├── backend/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── assetController.js   # Asset management
│   │   ├── userController.js    # User management
│   │   └── categoryController.js # Category management
│   ├── models/
│   │   ├── User.js              # User model
│   │   ├── Asset.js             # Asset model
│   │   ├── Category.js          # Category model
│   │   ├── Assignment.js        # Assignment model
│   │   ├── Maintenance.js       # Maintenance model
│   │   ├── Department.js        # Department model
│   │   └── AuditLog.js          # Audit log model
│   ├── routes/
│   │   ├── authRoutes.js        # Auth endpoints
│   │   ├── assetRoutes.js       # Asset endpoints
│   │   ├── userRoutes.js        # User endpoints
│   │   └── categoryRoutes.js    # Category endpoints
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication
│   │   └── errorHandler.js      # Error handling
│   ├── utils/
│   │   ├── generateToken.js     # JWT token generation
│   │   └── auditLogger.js       # Audit logging utility
│   ├── .env                     # Environment variables
│   ├── .env.example             # Example environment file
│   ├── package.json             # Backend dependencies
│   └── server.js                # Entry point
│
└── frontend/
    ├── public/
    │   └── index.html           # HTML template
    ├── src/
    │   ├── components/
    │   │   └── Layout.js        # Main layout with sidebar
    │   ├── context/
    │   │   └── AuthContext.js   # Authentication context
    │   ├── pages/
    │   │   ├── Login.js         # Login page
    │   │   ├── Dashboard.js     # Dashboard with stats
    │   │   ├── Assets.js        # Asset list and management
    │   │   ├── AssetDetail.js   # Asset details and actions
    │   │   ├── Users.js         # User management
    │   │   └── Categories.js    # Category management
    │   ├── services/
    │   │   ├── api.js           # Axios configuration
    │   │   ├── assetService.js  # Asset API calls
    │   │   └── categoryService.js # Category API calls
    │   ├── App.js               # Main app component
    │   └── index.js             # Entry point
    ├── package.json             # Frontend dependencies
    └── .gitignore               # Git ignore file
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/updateprofile` - Update profile
- `PUT /api/auth/updatepassword` - Update password

### Assets
- `GET /api/assets` - Get all assets (with filters)
- `GET /api/assets/:id` - Get single asset
- `POST /api/assets` - Create asset (Admin/Manager)
- `PUT /api/assets/:id` - Update asset (Admin/Manager)
- `DELETE /api/assets/:id` - Delete asset (Admin)
- `POST /api/assets/:id/assign` - Assign asset (Admin/Manager)
- `POST /api/assets/:id/return` - Return asset (Admin/Manager)
- `GET /api/assets/stats/overview` - Get asset statistics

### Users
- `GET /api/users` - Get all users (Admin/Manager)
- `GET /api/users/:id` - Get single user (Admin/Manager)
- `PUT /api/users/:id` - Update user (Admin)
- `DELETE /api/users/:id` - Delete user (Admin)
- `PUT /api/users/:id/toggle-status` - Activate/Deactivate user (Admin)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get single category
- `POST /api/categories` - Create category (Admin/Manager)
- `PUT /api/categories/:id` - Update category (Admin/Manager)
- `DELETE /api/categories/:id` - Delete category (Admin)

## User Roles

### Admin
- Full access to all features
- User management
- Can delete assets and users
- System configuration

### Manager
- Asset management (create, update, assign)
- View users
- Category management
- Reports and analytics

### Employee
- View assets
- View own assigned assets
- Basic dashboard access

## Usage Guide

### Adding Categories
1. Navigate to the Categories page
2. Click "Add Category"
3. Enter category name and description
4. Click "Create"

### Adding Assets
1. Navigate to the Assets page
2. Click "Add Asset"
3. Fill in asset details:
   - Asset Tag (unique identifier)
   - Name
   - Category
   - Brand, Model, Serial Number
   - Purchase information
4. Click "Create"
5. A QR code will be automatically generated

### Assigning Assets
1. Go to asset details page
2. Click "Assign Asset"
3. Select employee
4. Add notes (optional)
5. Set expected return date (optional)
6. Click "Assign"

### Returning Assets
1. Go to assigned asset details page
2. Click "Return Asset"
3. Select return condition
4. Add return notes
5. Click "Return"

## Development

### Running in Development Mode

Backend:
```bash
cd backend
npm run dev  # Uses nodemon for auto-restart
```

Frontend:
```bash
cd frontend
npm start  # Hot reload enabled
```

### Environment Variables

Backend (.env):
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/asset-management
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
```

## Production Deployment

### Backend
```bash
cd backend
npm install --production
npm start
```

### Frontend
```bash
cd frontend
npm run build
# Deploy the 'build' folder to your web server
```

### Important Security Notes for Production:
1. Change JWT_SECRET to a strong random string
2. Enable HTTPS
3. Configure CORS properly
4. Set NODE_ENV=production
5. Use environment-specific MongoDB URI
6. Enable rate limiting
7. Set up proper logging
8. Regular backups of MongoDB

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `sudo systemctl status mongodb`
- Check MongoDB URI in .env file
- Verify MongoDB port (default: 27017)

### Port Already in Use
- Backend: Change PORT in .env
- Frontend: Set PORT environment variable before starting

### Dependencies Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Future Enhancements

- [ ] File upload for asset documents
- [ ] Email notifications
- [ ] Advanced reporting
- [ ] Export to CSV/Excel
- [ ] Barcode scanning
- [ ] Mobile app
- [ ] Maintenance scheduling
- [ ] Purchase order management
- [ ] Vendor management
- [ ] Advanced analytics

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the ISC License.

## Support

For issues and questions:
- Create an issue in the repository
- Contact: admin@company.com

## Acknowledgments

- Material-UI for the component library
- MongoDB for the database
- Express.js community
- React community

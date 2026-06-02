# System Architecture

## Overview
This document describes the architecture of the Asset Management System.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT SIDE                          │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              React Application (Port 3000)            │  │
│  │                                                       │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │  │
│  │  │  Pages   │  │Components│  │ Services │          │  │
│  │  │          │  │          │  │          │          │  │
│  │  │ Login    │  │  Layout  │  │   API    │          │  │
│  │  │Dashboard │  │  Header  │  │  Asset   │          │  │
│  │  │ Assets   │  │ Sidebar  │  │ Category │          │  │
│  │  │  Users   │  │          │  │          │          │  │
│  │  └──────────┘  └──────────┘  └──────────┘          │  │
│  │                                                       │  │
│  │         ┌────────────────────────────┐              │  │
│  │         │    Context API (Auth)      │              │  │
│  │         └────────────────────────────┘              │  │
│  └───────────────────────────────────────────────────────┘  │
│                            │                                 │
│                            │ HTTP/HTTPS                      │
│                            │ REST API                        │
└────────────────────────────┼─────────────────────────────────┘
                             │
┌────────────────────────────┼─────────────────────────────────┐
│                         SERVER SIDE                          │
│                            │                                 │
│  ┌─────────────────────────▼─────────────────────────────┐  │
│  │          Express Server (Port 5000)                   │  │
│  │                                                       │  │
│  │  ┌──────────────────────────────────────────────┐   │  │
│  │  │            Middleware Layer                  │   │  │
│  │  │  • CORS                                      │   │  │
│  │  │  • Body Parser                               │   │  │
│  │  │  • JWT Authentication                        │   │  │
│  │  │  • Error Handler                             │   │  │
│  │  └──────────────────────────────────────────────┘   │  │
│  │                                                       │  │
│  │  ┌──────────────────────────────────────────────┐   │  │
│  │  │              Routes Layer                    │   │  │
│  │  │  • /api/auth                                 │   │  │
│  │  │  • /api/assets                               │   │  │
│  │  │  • /api/users                                │   │  │
│  │  │  • /api/categories                           │   │  │
│  │  └──────────────────────────────────────────────┘   │  │
│  │                                                       │  │
│  │  ┌──────────────────────────────────────────────┐   │  │
│  │  │           Controllers Layer                  │   │  │
│  │  │  • authController                            │   │  │
│  │  │  • assetController                           │   │  │
│  │  │  • userController                            │   │  │
│  │  │  • categoryController                        │   │  │
│  │  └──────────────────────────────────────────────┘   │  │
│  │                                                       │  │
│  │  ┌──────────────────────────────────────────────┐   │  │
│  │  │            Models Layer                      │   │  │
│  │  │  • User (Mongoose Schema)                    │   │  │
│  │  │  • Asset (Mongoose Schema)                   │   │  │
│  │  │  • Category (Mongoose Schema)                │   │  │
│  │  │  • Assignment (Mongoose Schema)              │   │  │
│  │  │  • Maintenance (Mongoose Schema)             │   │  │
│  │  │  • Department (Mongoose Schema)              │   │  │
│  │  │  • AuditLog (Mongoose Schema)                │   │  │
│  │  └──────────────────────────────────────────────┘   │  │
│  └───────────────────────────────────────────────────────┘  │
│                            │                                 │
│                            │ Mongoose ODM                    │
└────────────────────────────┼─────────────────────────────────┘
                             │
┌────────────────────────────┼─────────────────────────────────┐
│                      DATABASE LAYER                          │
│                            │                                 │
│  ┌─────────────────────────▼─────────────────────────────┐  │
│  │           MongoDB (Port 27017)                        │  │
│  │                                                       │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐    │  │
│  │  │   users    │  │   assets   │  │ categories │    │  │
│  │  └────────────┘  └────────────┘  └────────────┘    │  │
│  │                                                       │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐    │  │
│  │  │assignments │  │maintenance │  │departments │    │  │
│  │  └────────────┘  └────────────┘  └────────────┘    │  │
│  │                                                       │  │
│  │  ┌────────────┐                                      │  │
│  │  │ auditlogs  │                                      │  │
│  │  └────────────┘                                      │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Component Interaction Flow

### Authentication Flow
```
1. User enters credentials in Login page
   ↓
2. Frontend sends POST to /api/auth/login
   ↓
3. authController validates credentials
   ↓
4. User model compares password hash
   ↓
5. JWT token generated
   ↓
6. Token sent to frontend
   ↓
7. Token stored in localStorage
   ↓
8. Token added to all subsequent requests
```

### Asset Creation Flow
```
1. User fills asset form in Assets page
   ↓
2. Frontend sends POST to /api/assets
   ↓
3. JWT middleware validates token
   ↓
4. Authorization checks user role
   ↓
5. assetController creates asset
   ↓
6. QR code generated for asset
   ↓
7. Asset saved to MongoDB
   ↓
8. Audit log created
   ↓
9. Asset returned to frontend
   ↓
10. UI updated with new asset
```

### Asset Assignment Flow
```
1. Manager clicks "Assign Asset"
   ↓
2. Selects user from dropdown
   ↓
3. Frontend sends POST to /api/assets/:id/assign
   ↓
4. assetController validates assignment
   ↓
5. Asset status updated to "assigned"
   ↓
6. Assignment record created
   ↓
7. Asset.assignedTo updated
   ↓
8. Audit log created
   ↓
9. Updated asset returned
   ↓
10. UI refreshed
```

## Data Models Relationships

```
┌──────────────┐
│     User     │
│ (employees)  │
└──────┬───────┘
       │
       │ 1:N (has many)
       │
       ▼
┌──────────────┐      ┌──────────────┐
│  Assignment  │◄─────┤    Asset     │
│  (history)   │  N:1 │  (equipment) │
└──────────────┘      └──────┬───────┘
                             │
                             │ N:1 (belongs to)
                             │
                      ┌──────▼───────┐
                      │   Category   │
                      │   (types)    │
                      └──────────────┘

┌──────────────┐      ┌──────────────┐
│     User     │◄─────┤  Department  │
│              │  N:1 │              │
└──────────────┘      └──────────────┘

┌──────────────┐      ┌──────────────┐
│    Asset     │      │ Maintenance  │
│              │─────►│   (records)  │
└──────────────┘ 1:N  └──────────────┘

┌──────────────┐      ┌──────────────┐
│     User     │      │  AuditLog    │
│   (actor)    │─────►│  (actions)   │
└──────────────┘ 1:N  └──────────────┘
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Security Layers                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. Frontend (Client-side)                             │
│     • Token stored in localStorage                     │
│     • Protected routes (React Router)                  │
│     • Role-based component rendering                   │
│     • Axios interceptors for token injection           │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  2. Transport Layer                                    │
│     • HTTPS (Production)                               │
│     • CORS configured                                  │
│     • Token in Authorization header                    │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  3. Backend Middleware                                 │
│     • JWT verification                                 │
│     • Token expiration check                           │
│     • User existence validation                        │
│     • Role-based authorization                         │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  4. Application Layer                                  │
│     • Input validation                                 │
│     • Business logic authorization                     │
│     • Audit logging                                    │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  5. Database Layer                                     │
│     • Password hashing (bcrypt)                        │
│     • Mongoose validation                              │
│     • NoSQL injection prevention                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## API Design Pattern

### RESTful Endpoints Structure
```
/api/auth
  POST   /register          - Register new user
  POST   /login            - Login user
  GET    /me               - Get current user
  PUT    /updateprofile    - Update profile
  PUT    /updatepassword   - Update password

/api/assets
  GET    /                 - List all assets
  GET    /:id              - Get single asset
  POST   /                 - Create asset
  PUT    /:id              - Update asset
  DELETE /:id              - Delete asset
  POST   /:id/assign       - Assign asset
  POST   /:id/return       - Return asset
  GET    /stats/overview   - Get statistics

/api/users
  GET    /                 - List all users
  GET    /:id              - Get single user
  PUT    /:id              - Update user
  DELETE /:id              - Delete user
  PUT    /:id/toggle-status - Activate/Deactivate

/api/categories
  GET    /                 - List all categories
  GET    /:id              - Get single category
  POST   /                 - Create category
  PUT    /:id              - Update category
  DELETE /:id              - Delete category
```

## State Management

### Frontend State Flow
```
┌──────────────────────────────────────────────────────┐
│              React Component Tree                    │
├──────────────────────────────────────────────────────┤
│                                                      │
│  App (Router)                                        │
│    │                                                 │
│    ├─ AuthProvider (Context)                        │
│    │    └─ Global Auth State                        │
│    │       • user                                    │
│    │       • token                                   │
│    │       • isAuthenticated                         │
│    │       • login()                                 │
│    │       • logout()                                │
│    │                                                 │
│    ├─ Layout (Protected)                            │
│    │    ├─ Sidebar                                  │
│    │    ├─ Header                                   │
│    │    └─ Content                                  │
│    │                                                 │
│    └─ Pages (Local State)                           │
│         ├─ Dashboard                                │
│         ├─ Assets (useState for list)               │
│         ├─ Users (useState for list)                │
│         └─ Categories (useState for list)           │
│                                                      │
└──────────────────────────────────────────────────────┘
```

## Deployment Architecture

### Development
```
Developer Machine
  ├─ Backend: localhost:5000
  ├─ Frontend: localhost:3000
  └─ MongoDB: localhost:27017
```

### Production (Recommended)
```
┌─────────────────────────────────────┐
│         Load Balancer / CDN         │
│             (HTTPS)                 │
└──────────────┬──────────────────────┘
               │
    ┌──────────┴──────────┐
    │                     │
┌───▼────┐          ┌────▼────┐
│ Web    │          │  API    │
│ Server │          │ Server  │
│ (Nginx)│          │ (Node)  │
│        │          │         │
│ React  │          │ Express │
│ Static │          │ PM2     │
└────────┘          └────┬────┘
                         │
                    ┌────▼────┐
                    │ MongoDB │
                    │ Cluster │
                    └─────────┘
```

## Technology Stack Details

### Frontend Technologies
- **React 18.2** - UI library
- **React Router 6.20** - Routing
- **Material-UI 5.14** - Component library
- **Axios 1.6** - HTTP client
- **Recharts 2.10** - Charts
- **Context API** - State management

### Backend Technologies
- **Node.js** - Runtime
- **Express 4.18** - Web framework
- **Mongoose 8.0** - MongoDB ODM
- **jsonwebtoken 9.0** - JWT auth
- **bcryptjs 2.4** - Password hashing
- **qrcode 1.5** - QR generation
- **morgan 1.10** - Logging

### Database
- **MongoDB** - NoSQL database
- **Mongoose** - Schema validation

## Performance Considerations

### Frontend Optimization
- Code splitting (React lazy loading)
- Component memoization
- Virtualized lists for large datasets
- Image optimization
- Chunked builds

### Backend Optimization
- Database indexing
- Query optimization
- Pagination
- Caching (future)
- Connection pooling

### Database Optimization
- Indexes on frequently queried fields
- Compound indexes
- Text search indexes
- Aggregation pipelines

## Monitoring & Logging

### Application Logs
- Server startup/shutdown
- API requests (morgan)
- Error logs
- Authentication attempts

### Audit Logs (Database)
- User actions
- Asset changes
- Assignment history
- Access logs

## Scalability

### Horizontal Scaling
- Stateless API (JWT)
- Multiple server instances
- Load balancer
- Shared MongoDB

### Vertical Scaling
- Increase server resources
- Database optimization
- Caching layer
- CDN for static assets

## Future Architecture Enhancements
- Redis for caching
- Message queue (RabbitMQ)
- File storage (S3)
- Email service integration
- Real-time notifications (Socket.io)
- Microservices architecture
- Docker containerization
- Kubernetes orchestration

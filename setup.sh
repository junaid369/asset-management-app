#!/bin/bash

echo "================================"
echo "Asset Management System Setup"
echo "================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null; then
    echo "Warning: MongoDB is not found. Please ensure MongoDB is installed and running."
fi

echo "Installing backend dependencies..."
cd backend
npm install

if [ $? -eq 0 ]; then
    echo "✓ Backend dependencies installed successfully"
else
    echo "✗ Failed to install backend dependencies"
    exit 1
fi

echo ""
echo "Installing frontend dependencies..."
cd ../frontend
npm install

if [ $? -eq 0 ]; then
    echo "✓ Frontend dependencies installed successfully"
else
    echo "✗ Failed to install frontend dependencies"
    exit 1
fi

cd ..

echo ""
echo "================================"
echo "Setup Complete!"
echo "================================"
echo ""
echo "Next steps:"
echo "1. Ensure MongoDB is running"
echo "2. Start the backend: cd backend && npm run dev"
echo "3. In a new terminal, start the frontend: cd frontend && npm start"
echo "4. Create an admin user using the API or MongoDB"
echo ""
echo "See README.md for detailed instructions"

#!/bin/bash

echo "Starting CRM System..."
echo ""

echo "Installing dependencies..."
npm run install-all

echo ""
echo "Starting development servers..."
echo "Frontend will be available at: http://localhost:3000"
echo "Backend API will be available at: http://localhost:3333/api"
echo ""

npm run dev
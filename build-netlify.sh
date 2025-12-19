#!/bin/bash

# Netlify Build Script
echo "🚀 Starting Netlify build process..."

# Set environment variables
export CI=false
export GENERATE_SOURCEMAP=false
export NODE_ENV=production

# Navigate to client directory
cd client

echo "📦 Installing dependencies..."
npm ci --only=production

echo "🏗️ Building React app..."
npm run build

echo "✅ Build completed successfully!"
echo "📁 Build output is in client/build/"

# List build contents
echo "📋 Build contents:"
ls -la build/
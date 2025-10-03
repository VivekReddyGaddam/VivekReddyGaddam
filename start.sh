#!/bin/bash

# StoryForge AI - Startup Script
# This script helps you quickly start the application

set -e

echo "🚀 Starting StoryForge AI..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found${NC}"
    echo "Creating from .env.example..."
    cp .env.example .env
    echo -e "${YELLOW}Please edit .env with your API keys before continuing${NC}"
    echo "Press Enter when ready..."
    read
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
    cd client && npm install && cd ..
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${GREEN}✅ Dependencies already installed${NC}"
fi

# Check if MongoDB is running
echo ""
echo "🔍 Checking services..."
if ! nc -z localhost 27017 2>/dev/null; then
    echo -e "${RED}❌ MongoDB is not running on localhost:27017${NC}"
    echo "Start MongoDB with: docker run -d -p 27017:27017 --name mongodb mongo:6.0"
    echo "Or use MongoDB Atlas (update MONGODB_URI in .env)"
    exit 1
else
    echo -e "${GREEN}✅ MongoDB is running${NC}"
fi

# Check if Redis is running
if ! nc -z localhost 6379 2>/dev/null; then
    echo -e "${YELLOW}⚠️  Redis is not running on localhost:6379${NC}"
    echo "Redis is optional but recommended for caching"
    echo "Start with: docker run -d -p 6379:6379 --name redis redis:7.0"
else
    echo -e "${GREEN}✅ Redis is running${NC}"
fi

echo ""
echo -e "${GREEN}🎉 All checks passed!${NC}"
echo ""
echo "Starting application..."
echo "- Backend API: http://localhost:5000"
echo "- Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop"
echo ""

# Start the application
npm run dev

# Quick Start Guide - StoryForge AI

Get up and running with StoryForge AI in under 10 minutes!

## Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js 18+ installed (`node --version`)
- ✅ MongoDB running (or Docker installed)
- ✅ Redis running (or Docker installed)
- ✅ Hugging Face account and API key

## 5-Minute Setup

### Step 1: Clone and Install (2 min)

```bash
# Clone the repository
git clone <your-repo-url>
cd storyforge-ai

# Install all dependencies
npm install
cd client && npm install && cd ..
```

### Step 2: Start Services (1 min)

**Option A: Using Docker (Recommended)**
```bash
# Start MongoDB and Redis
docker run -d -p 27017:27017 --name mongodb mongo:6.0
docker run -d -p 6379:6379 --name redis redis:7.0
```

**Option B: Using Local Installation**
```bash
# If you have MongoDB and Redis installed locally
# MongoDB: mongod --dbpath /path/to/data
# Redis: redis-server
```

### Step 3: Configure Environment (1 min)

```bash
# Copy example environment file
cp .env.example .env

# Edit with your favorite editor
nano .env
```

**Minimum required configuration:**
```env
# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=your_generated_secret_here

# Hugging Face API Key (get from: https://huggingface.co/settings/tokens)
HUGGINGFACE_API_KEY=hf_your_api_key_here
```

### Step 4: Launch Application (1 min)

```bash
# Start both backend and frontend
npm run dev
```

This will start:
- Backend API: http://localhost:5000
- Frontend: http://localhost:3000

## First Story in 2 Minutes

1. **Open browser** → http://localhost:3000
2. **Register account** → Click "Get Started"
3. **Create story** → Click "Create Story"
4. **Enter prompt**: "A space explorer discovers an ancient alien artifact"
5. **Click "Create Story"** → Wait 10-15 seconds
6. **Start playing!** → Make choices and watch your story unfold

## Troubleshooting

### MongoDB Connection Error
```bash
# Check if MongoDB is running
docker ps | grep mongodb
# Or for local: mongosh
```

### Redis Connection Error
```bash
# Check if Redis is running
docker ps | grep redis
# Or for local: redis-cli ping
```

### Port Already in Use
```bash
# Check what's using port 5000
lsof -i :5000
# Kill the process or change PORT in .env
```

### AI Generation Fails
- Verify Hugging Face API key is correct
- Check API key has sufficient credits
- Try a different model in `server/services/aiService.js`

## What's Next?

✅ **You're ready to create stories!**

Check out:
- [README.md](README.md) - Full documentation
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - API reference
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deploy to production

## Need Help?

- Check logs in terminal for error messages
- Visit GitHub Issues
- Join our Discord community

---

**Time to first story: ~7 minutes** ⚡️

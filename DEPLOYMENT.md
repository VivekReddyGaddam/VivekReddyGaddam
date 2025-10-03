# Deployment Guide for StoryForge AI

This guide covers deployment options for StoryForge AI.

## Deployment Architecture

StoryForge AI consists of:
1. **Frontend**: React application (Static site)
2. **Backend**: Node.js/Express API server
3. **Database**: MongoDB
4. **Cache**: Redis
5. **AI Services**: Hugging Face API (external)

## Deployment Options

### Option 1: Vercel + MongoDB Atlas + Redis Cloud (Recommended for MVP)

#### Frontend Deployment (Vercel)

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Deploy Frontend**
```bash
cd client
vercel --prod
```

3. **Configure Environment Variables in Vercel Dashboard**
- `REACT_APP_API_URL`: Your backend API URL

#### Backend Deployment (Vercel Serverless)

1. **Deploy Backend**
```bash
vercel --prod
```

2. **Environment Variables** (in Vercel Dashboard):
```
NODE_ENV=production
MONGODB_URI=<your-mongodb-atlas-uri>
REDIS_URL=<your-redis-cloud-uri>
JWT_SECRET=<secure-random-string>
HUGGINGFACE_API_KEY=<your-key>
CLIENT_URL=<your-frontend-url>
```

#### Database Setup (MongoDB Atlas)

1. Create account at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Create a free cluster
3. Configure network access (allow your IPs or 0.0.0.0/0 for Vercel)
4. Create database user
5. Get connection string
6. Add to environment variables

#### Redis Setup (Redis Cloud)

1. Create account at [redis.com/try-free](https://redis.com/try-free)
2. Create a free database
3. Get connection URL
4. Add to environment variables

**Estimated Cost**: $0/month (free tiers)

---

### Option 2: Railway (Full Stack)

1. **Create Railway Account**
   - Sign up at [railway.app](https://railway.app)

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your repository

3. **Add Services**
   - Add MongoDB service
   - Add Redis service
   - Both available in Railway's service catalog

4. **Configure Environment Variables**
```
NODE_ENV=production
PORT=5000
MONGODB_URI=${{MongoDB.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
JWT_SECRET=<generate-secure-string>
HUGGINGFACE_API_KEY=<your-key>
CLIENT_URL=https://your-app.up.railway.app
```

5. **Deploy**
   - Railway automatically builds and deploys
   - Get public URL from dashboard

**Estimated Cost**: $5-20/month depending on usage

---

### Option 3: AWS (Production-Ready)

#### Frontend (S3 + CloudFront)

1. **Build Client**
```bash
cd client
npm run build
```

2. **Create S3 Bucket**
```bash
aws s3 mb s3://storyforge-frontend
aws s3 sync build/ s3://storyforge-frontend
```

3. **Configure CloudFront**
   - Create distribution pointing to S3
   - Enable HTTPS
   - Configure custom domain

#### Backend (EC2 or ECS)

**Option A: EC2**

1. Launch EC2 instance (t3.small or larger)
2. Install Node.js, MongoDB, Redis
3. Clone repository
4. Install dependencies
5. Configure PM2 for process management
6. Set up Nginx as reverse proxy
7. Configure SSL with Let's Encrypt

**Option B: ECS (Fargate)**

1. Create Docker container
2. Push to ECR
3. Create ECS cluster and service
4. Configure load balancer
5. Set environment variables in task definition

#### Database (DocumentDB or MongoDB Atlas)

- Use AWS DocumentDB for MongoDB-compatible database
- Or use MongoDB Atlas with AWS region

#### Redis (ElastiCache)

- Create ElastiCache cluster
- Use Redis engine
- Configure in same VPC as backend

**Estimated Cost**: $50-200/month depending on configuration

---

### Option 4: DigitalOcean App Platform

1. **Create Account** at [digitalocean.com](https://digitalocean.com)

2. **Create App**
   - Connect GitHub repository
   - Detect Node.js automatically

3. **Add Components**
   - Web Service (for backend)
   - Static Site (for frontend)
   - MongoDB Database
   - Redis Database

4. **Configure Build Settings**

Backend:
```
Build Command: npm install
Run Command: npm start
```

Frontend:
```
Build Command: cd client && npm install && npm run build
Output Directory: client/build
```

5. **Environment Variables** - Same as Option 1

**Estimated Cost**: $10-30/month

---

## Pre-Deployment Checklist

### Security
- [ ] All environment variables set
- [ ] JWT_SECRET is secure random string
- [ ] API keys are not in code
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] HTTPS enabled
- [ ] Database access restricted

### Performance
- [ ] Redis caching configured
- [ ] Database indexes created
- [ ] Static assets optimized
- [ ] API response times < 2s
- [ ] CDN configured for frontend

### Monitoring
- [ ] Error tracking (Sentry)
- [ ] Logging configured (Winston)
- [ ] Uptime monitoring
- [ ] Database backups enabled

### Testing
- [ ] All tests passing
- [ ] Production build works locally
- [ ] API endpoints tested
- [ ] Frontend tested in production mode

---

## Post-Deployment

### Verify Deployment

1. **Health Check**
```bash
curl https://your-api-url/health
```

2. **Test User Flow**
   - Register new user
   - Create story
   - Play story
   - Export story

3. **Check Logs**
   - Monitor for errors
   - Check API response times
   - Verify database connections

### Monitoring Setup

1. **Uptime Monitoring**
   - Use UptimeRobot or Pingdom
   - Monitor /health endpoint

2. **Error Tracking**
```bash
npm install @sentry/node
```

Add to server/index.js:
```javascript
const Sentry = require("@sentry/node");
Sentry.init({ dsn: process.env.SENTRY_DSN });
```

3. **Analytics**
   - Set up Google Analytics
   - Configure user tracking
   - Monitor key metrics

---

## Continuous Deployment

### GitHub Actions (Automated)

Already configured in `.github/workflows/ci.yml`

To enable:
1. Add deployment secrets to GitHub
2. Update deployment step in workflow
3. Push to main branch triggers deploy

### Manual Deployment

**Vercel:**
```bash
vercel --prod
```

**Railway:**
```bash
railway up
```

**AWS:**
```bash
# Using AWS CLI
aws s3 sync client/build s3://bucket-name
# Backend deployment depends on your setup
```

---

## Database Migrations

When schema changes are needed:

1. Create migration script
2. Test on staging environment
3. Backup production database
4. Run migration
5. Verify data integrity

---

## Scaling Considerations

### When to Scale

Monitor these metrics:
- Response time > 2s consistently
- CPU usage > 80%
- Memory usage > 85%
- Error rate > 1%

### Horizontal Scaling

1. **Backend**: Add more server instances behind load balancer
2. **Database**: Enable MongoDB replica sets
3. **Redis**: Use Redis cluster mode
4. **Frontend**: Already scaled via CDN

### Vertical Scaling

Increase server resources:
- More CPU cores
- More RAM
- Faster storage

---

## Rollback Procedure

If deployment fails:

**Vercel:**
```bash
vercel rollback
```

**Railway:**
- Use Railway dashboard to rollback to previous deployment

**Manual:**
1. Revert to previous git commit
2. Redeploy
3. Restore database backup if needed

---

## Support

For deployment issues:
- Check logs first
- Review environment variables
- Verify service connectivity
- Contact platform support

---

**Recommended Setup for Launch**: Vercel + MongoDB Atlas + Redis Cloud
- Free tier available
- Easy to set up
- Scales automatically
- Good performance
- Can migrate to AWS/Railway later

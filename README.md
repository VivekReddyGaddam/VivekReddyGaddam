# StoryForge AI - AI-Powered Narrative Engine

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## Overview

**StoryForge AI** is an AI-powered narrative engine for creating dynamic, interactive stories. Built as a SaaS platform, it leverages generative AI to create branching narratives that adapt in real-time to user inputs while maintaining consistency in world-building, character development, and emotional arcs.

## Features

### Core Features (MVP - Phase 1)
- ✅ **Narrative Generation Engine**: AI-powered story generation with customizable parameters
- ✅ **Branching & Interactivity**: Real-time story branching based on user choices
- ✅ **Consistency Checks**: World-building module to ensure narrative coherence
- ✅ **User Authentication**: Secure JWT-based authentication
- ✅ **Story Management**: Create, edit, delete, and export stories
- ✅ **Multiple Domains**: Support for gaming, education, therapy, and general storytelling

### Planned Features (Phase 2-4)
- 🔄 Voice synthesis integration (ElevenLabs)
- 🔄 Advanced personalization & emotional adaptation
- 🔄 OAuth integration (Google, Apple)
- 🔄 Multiplayer collaborative storytelling
- 🔄 Unity WebGL export
- 🔄 Multimodal content (images, AR)

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (with Mongoose ODM)
- **Cache**: Redis
- **AI/ML**: 
  - Hugging Face Transformers
  - LangChain for orchestration
- **Authentication**: JWT + Passport.js
- **Real-time**: Socket.io

### Frontend
- **Framework**: React 18
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **Notifications**: React Toastify
- **Visualizations**: D3.js (for story tree)

### DevOps
- **Deployment**: Vercel (Frontend) / AWS/Railway (Backend)
- **CI/CD**: GitHub Actions
- **Monitoring**: Winston (logging)

## Installation

### Prerequisites
- Node.js 18+ and npm
- MongoDB 6.0+
- Redis 7.0+
- Hugging Face API key

### Setup Instructions

1. **Clone the repository**
```bash
git clone <repository-url>
cd storyforge-ai
```

2. **Install dependencies**
```bash
# Install root dependencies
npm install

# Install client dependencies
cd client && npm install && cd ..
```

3. **Environment Configuration**
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your credentials
nano .env
```

Required environment variables:
```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/storyforge
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRE=7d

# AI Services
HUGGINGFACE_API_KEY=your_huggingface_api_key

# Client
CLIENT_URL=http://localhost:3000
```

4. **Start MongoDB and Redis**
```bash
# MongoDB (if using Docker)
docker run -d -p 27017:27017 --name mongodb mongo:6.0

# Redis (if using Docker)
docker run -d -p 6379:6379 --name redis redis:7.0
```

5. **Run the application**
```bash
# Development mode (runs both server and client)
npm run dev

# Or run separately:
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run client
```

6. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health check: http://localhost:5000/health

## Project Structure

```
storyforge-ai/
├── server/                 # Backend
│   ├── config/            # Database and Redis configuration
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Auth, rate limiting, etc.
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── services/         # Business logic (AI, narrative engine)
│   └── index.js          # Server entry point
├── client/                # Frontend
│   ├── public/           # Static assets
│   └── src/
│       ├── components/   # React components
│       ├── pages/        # Page components
│       ├── store/        # Zustand state management
│       ├── App.jsx       # Main app component
│       └── index.js      # Entry point
├── .env.example          # Environment variables template
├── package.json          # Root dependencies
└── README.md            # This file
```

## API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword"
}
```

### Story Endpoints

#### Create Story
```http
POST /api/stories
Authorization: Bearer <token>
Content-Type: application/json

{
  "initialPrompt": "A cyberpunk detective story...",
  "parameters": {
    "genre": "cyberpunk",
    "tone": "dark",
    "length": "medium",
    "branchingComplexity": 5,
    "emotionalIntensity": 7
  },
  "domain": "general",
  "loreBook": "Optional world-building details..."
}
```

#### Get User Stories
```http
GET /api/stories?genre=fantasy&status=active&page=1&limit=20
Authorization: Bearer <token>
```

#### Continue Story
```http
POST /api/stories/:id/continue
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentNodeId": "node-0",
  "choiceIndex": 1
}
```

#### Export Story
```http
GET /api/stories/:id/export
Authorization: Bearer <token>
```

## Usage Guide

### Creating Your First Story

1. **Register/Login**: Create an account or sign in
2. **Navigate to Create**: Click "Create Story" button
3. **Configure Story**:
   - Enter a starting prompt (10-500 characters)
   - Select genre (fantasy, sci-fi, etc.)
   - Choose tone (serious, humorous, etc.)
   - Set branching complexity (3-10 choices)
   - Adjust emotional intensity (1-10)
   - Optionally add lore book for consistency
4. **Generate**: Click "Create Story" and wait for AI generation
5. **Play**: Make choices to progress through the story

### Story Parameters Explained

- **Genre**: Determines the overall setting and themes
- **Tone**: Sets the emotional atmosphere (serious, humorous, dark, lighthearted)
- **Length**: Controls segment length (short, medium, long)
- **Branching Complexity**: Number of choices per decision point (3-10)
- **Emotional Intensity**: How emotionally charged the scenes are (1-10)
- **Domain**: Special modes (general, gaming, education, therapy)
- **Lore Book**: Custom rules and background to maintain consistency

## Subscription Tiers

### Free Tier
- 5 stories per month
- Basic story generation
- Export stories as JSON
- Community features

### Pro Tier ($9.99/month)
- Unlimited stories
- Advanced AI models
- Priority generation
- Voice synthesis (Phase 2)
- Custom domains

### Enterprise Tier ($99/month)
- Everything in Pro
- API access
- White-label options
- Dedicated support
- Custom integrations

## Development

### Running Tests
```bash
npm test
```

### Code Linting
```bash
npm run lint
```

### Building for Production
```bash
# Build client
cd client && npm run build

# Start production server
NODE_ENV=production npm start
```

## Deployment

### Frontend (Vercel)
```bash
cd client
vercel deploy --prod
```

### Backend (Railway/AWS)
1. Set environment variables in platform dashboard
2. Connect GitHub repository
3. Configure build command: `npm install`
4. Configure start command: `npm start`

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `docker ps` or `mongosh`
- Check connection string in `.env`
- Verify network access/firewall settings

### Redis Connection Issues
- Ensure Redis is running: `redis-cli ping`
- Check Redis URL in `.env`

### AI Generation Errors
- Verify Hugging Face API key is valid
- Check API rate limits
- Ensure sufficient credits/quota

### Rate Limiting
- Default: 10 requests/minute for general API
- AI endpoints: 5 requests/minute
- Auth endpoints: 5 requests/15 minutes

## Contributing

This project is currently in active development. Contributions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Roadmap

### Phase 1 (MVP) - ✅ Complete
- Core narrative engine
- Basic branching
- User authentication
- Story management

### Phase 2 (Months 4-6)
- Voice synthesis
- OAuth integration
- Advanced personalization
- Mobile optimization

### Phase 3 (Months 7-9)
- Multiplayer features
- External integrations (Unity, LMS)
- Beta launch
- Public story feed

### Phase 4 (Post-Launch)
- Multimodal content
- AR/VR support
- Advanced analytics
- Enterprise features

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Authors

**Vivek Reddy Gaddam**

## Acknowledgments

- Hugging Face for AI models
- MongoDB for database
- React and Tailwind CSS communities
- All contributors and beta testers

## Support

For support, email support@storyforge.ai or join our Discord community.

## Security

For security issues, please email security@storyforge.ai instead of using the issue tracker.

---

**Built with ❤️ for storytellers everywhere**

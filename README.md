# StoryForge AI - AI-Powered Narrative Engine

A comprehensive web-based SaaS platform that leverages generative AI to create dynamic, interactive stories. Users can generate branching narratives that adapt in real-time to inputs, maintaining consistency in world-building, character development, and emotional arcs.

## 🚀 Features

### Core Features
- **AI-Powered Story Generation**: Create dynamic, branching stories with advanced AI
- **Real-time Adaptation**: Stories adapt based on user emotions and preferences
- **Multiple Domains**: Support for gaming, education, therapy, and general storytelling
- **Consistency Engine**: Maintains narrative coherence across all branches
- **Interactive Branching**: Create complex story trees with multiple choice paths
- **World Building Tools**: Comprehensive lore management and character profiles

### User Experience
- **Intuitive Dashboard**: Clean, modern interface for story management
- **Story Creator**: Step-by-step wizard for creating interactive narratives
- **Story Player**: Immersive reading experience with choice selection
- **Public Library**: Discover and play stories created by the community
- **User Profiles**: Track statistics and manage account settings

### Technical Features
- **Real-time Collaboration**: Multiple users can work on stories together
- **Export Options**: Export stories in various formats
- **API Access**: RESTful API for integration with external tools
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Authentication**: Secure user authentication and authorization

## 🏗️ Architecture

### Frontend (React)
- **React 18** with Hooks and Context API
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Zustand** for state management
- **Axios** for API communication
- **Socket.io** for real-time features

### Backend (Node.js)
- **Express.js** web framework
- **MongoDB** with Mongoose for data persistence
- **Redis** for caching and session management
- **Socket.io** for real-time communication
- **JWT** for authentication
- **Helmet** for security

### AI Services
- **OpenAI GPT** for story generation
- **Hugging Face** for NLP tasks
- **Pinecone** for vector database and consistency checking
- **Sentiment Analysis** for emotional adaptation

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- Redis (v6 or higher)
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd storyforge-ai
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment Configuration**
   ```bash
   # Copy environment template
   cp server/.env.example server/.env
   
   # Edit server/.env with your configuration
   nano server/.env
   ```

4. **Database Setup**
   ```bash
   # Start MongoDB and Redis services
   # Update connection strings in .env file
   ```

5. **Start Development Servers**
   ```bash
   # Start both frontend and backend
   npm run dev
   
   # Or start individually
   npm run server  # Backend on port 5000
   npm run client  # Frontend on port 3000
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `server` directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/storyforge
REDIS_URL=redis://localhost:6379

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key

# AI Services
OPENAI_API_KEY=your-openai-api-key
HUGGINGFACE_API_KEY=your-huggingface-api-key
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_ENVIRONMENT=your-pinecone-environment

# External Services
ELEVENLABS_API_KEY=your-elevenlabs-api-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Frontend Configuration

Create a `.env` file in the `client` directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/password` - Change password

### Story Endpoints
- `GET /api/stories` - Get user's stories
- `GET /api/stories/public` - Get public stories
- `GET /api/stories/:id` - Get specific story
- `POST /api/stories` - Create new story
- `PUT /api/stories/:id` - Update story
- `DELETE /api/stories/:id` - Delete story
- `POST /api/stories/:id/nodes` - Generate story node

### AI Endpoints
- `POST /api/ai/generate` - Generate story segment
- `POST /api/ai/sentiment` - Analyze sentiment
- `POST /api/ai/consistency` - Check consistency
- `POST /api/ai/branches` - Generate multiple branches
- `POST /api/ai/characters` - Generate character suggestions
- `POST /api/ai/settings` - Generate setting suggestions

## 🎯 Usage

### Creating a Story

1. **Sign up** for an account or log in
2. **Navigate** to the Dashboard
3. **Click** "Create New Story"
4. **Fill out** the story creation form:
   - Basic info (title, genre, tone)
   - Settings (complexity, length)
   - World building (characters, lore)
   - Initial prompt
5. **Generate** the initial story segment
6. **Add branches** by making choices
7. **Publish** your story

### Playing a Story

1. **Browse** the Story Library
2. **Select** a story to play
3. **Read** the story text
4. **Make choices** to advance the narrative
5. **Experience** branching storylines

## 🧪 Testing

```bash
# Run all tests
npm test

# Run backend tests
cd server && npm test

# Run frontend tests
cd client && npm test
```

## 🚀 Deployment

### Production Build

```bash
# Build frontend
npm run build

# Start production server
npm start
```

### Docker Deployment

```bash
# Build Docker image
docker build -t storyforge-ai .

# Run container
docker run -p 5000:5000 storyforge-ai
```

### Environment-Specific Deployment

- **Development**: `npm run dev`
- **Staging**: `npm run build && npm start`
- **Production**: Use PM2 or similar process manager

## 📊 Monitoring

- **Error Tracking**: Sentry integration
- **Performance**: New Relic monitoring
- **Analytics**: Google Analytics
- **Logging**: Winston logger

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [Wiki](https://github.com/your-repo/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discord**: [Community Server](https://discord.gg/your-server)
- **Email**: support@storyforge.ai

## 🗺️ Roadmap

### Phase 1 (MVP) - Completed ✅
- Core text-based engine with basic branching
- User authentication and story management
- Basic AI integration

### Phase 2 (Months 4-6) - In Progress 🚧
- Voice synthesis integration
- Advanced personalization features
- Domain-specific modes

### Phase 3 (Months 7-9) - Planned 📋
- Real-time multiplayer collaboration
- Advanced analytics and insights
- Beta launch with community feedback

### Phase 4 (Post-Launch) - Future 🔮
- Multimodal content (images, AR)
- Advanced monetization features
- Enterprise integrations

## 🙏 Acknowledgments

- OpenAI for GPT models
- Hugging Face for NLP models
- Pinecone for vector database
- The React and Node.js communities
- All beta testers and contributors

---

**StoryForge AI** - Democratizing interactive storytelling through AI innovation.
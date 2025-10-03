# StoryForge AI - Interactive Narrative Engine

An AI-powered SaaS platform for creating dynamic, interactive stories with branching narratives that adapt in real-time to user inputs.

## Features (MVP Phase 1)

- **AI-Powered Story Generation**: Generate interactive stories based on user prompts
- **Branching Narratives**: Create stories with multiple choice paths
- **Genre Support**: Fantasy, Sci-Fi, Mystery, and more
- **Customizable Parameters**: Tone, length, and complexity settings
- **Real-time Story Playback**: Interactive story experience with choice selection

## Tech Stack

### Frontend
- React.js with Vite
- Tailwind CSS for styling
- React Router for navigation
- Axios for API communication

### Backend
- Node.js with Express
- JWT authentication
- CORS support
- Rate limiting and security middleware

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd storyforge-ai
```

2. Install dependencies:
```bash
npm run install-server
npm run install-client
```

3. Set up environment variables:
```bash
cd backend
cp .env.example .env
# Edit .env file with your configuration
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Project Structure

```
storyforge-ai/
├── backend/                 # Node.js API server
│   ├── routes/             # API route handlers
│   ├── utils/              # Utility functions
│   ├── middleware/         # Express middleware
│   └── server.js           # Main server file
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   └── utils/         # Utility functions
│   └── index.html         # Main HTML file
└── package.json           # Root package configuration
```

## API Endpoints

### Stories
- `POST /api/stories/generate` - Generate a new story
- `GET /api/stories/:storyId` - Get a specific story
- `POST /api/stories/:storyId/save` - Save/update a story

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

## Development Roadmap

### Phase 1 (MVP) ✅
- [x] Basic project setup
- [x] Core narrative generation engine
- [x] Branching and interactivity system
- [x] User interface (dashboard, creation, playback)
- [x] Basic API structure

### Phase 2 (Next)
- [ ] Voice synthesis integration
- [ ] Advanced personalization features
- [ ] Domain-specific modes (education, therapy)
- [ ] Enhanced consistency checking

### Phase 3 (Future)
- [ ] Multiplayer functionality
- [ ] Image/AR integration
- [ ] Advanced analytics
- [ ] API marketplace

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@storyforge.ai or join our Discord community.

---

Built with ❤️ by the StoryForge AI team
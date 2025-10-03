# StoryForge AI - API Documentation

Version: 1.0.0  
Base URL: `http://localhost:5000/api` (development) or `https://your-domain.com/api` (production)

## Table of Contents
1. [Authentication](#authentication)
2. [Stories](#stories)
3. [Error Handling](#error-handling)
4. [Rate Limiting](#rate-limiting)

---

## Authentication

### Register User

Create a new user account.

**Endpoint:** `POST /auth/register`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:** `201 Created`
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "subscription": {
    "tier": "free",
    "storiesPerMonth": 5,
    "storiesUsed": 0,
    "resetDate": "2025-11-03T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**
- `400 Bad Request` - Missing required fields or user already exists
- `500 Internal Server Error` - Server error

---

### Login User

Authenticate an existing user.

**Endpoint:** `POST /auth/login`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:** `200 OK`
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "subscription": {
    "tier": "free",
    "storiesPerMonth": 5,
    "storiesUsed": 2,
    "resetDate": "2025-11-03T00:00:00.000Z"
  },
  "preferences": {
    "defaultGenre": "fantasy",
    "defaultTone": "serious",
    "emotionalIntensity": 5
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**
- `400 Bad Request` - Missing email or password
- `401 Unauthorized` - Invalid credentials

---

### Get Current User

Get authenticated user's profile.

**Endpoint:** `GET /auth/me`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "subscription": { ... },
  "preferences": { ... },
  "createdAt": "2025-10-03T10:00:00.000Z",
  "lastActive": "2025-10-03T15:30:00.000Z"
}
```

**Errors:**
- `401 Unauthorized` - Invalid or missing token

---

### Update User Preferences

Update user's default story preferences.

**Endpoint:** `PUT /auth/preferences`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "defaultGenre": "sci-fi",
  "defaultTone": "dark",
  "emotionalIntensity": 7
}
```

**Response:** `200 OK`
```json
{
  "defaultGenre": "sci-fi",
  "defaultTone": "dark",
  "emotionalIntensity": 7
}
```

---

## Stories

### Create Story

Create a new interactive story.

**Endpoint:** `POST /stories`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "initialPrompt": "A cyberpunk detective story about loss, set in a neon-lit city where memories can be stolen",
  "parameters": {
    "genre": "cyberpunk",
    "tone": "dark",
    "length": "medium",
    "branchingComplexity": 5,
    "emotionalIntensity": 7
  },
  "domain": "general",
  "loreBook": "The year is 2077. Memory theft is a serious crime punished by mindwipe."
}
```

**Parameters:**
- `initialPrompt` (string, required): Starting prompt, 10-500 characters
- `parameters` (object, required):
  - `genre` (string): fantasy | sci-fi | historical | mystery | horror | romance | cyberpunk
  - `tone` (string): serious | humorous | dark | lighthearted
  - `length` (string): short | medium | long
  - `branchingComplexity` (number): 3-10
  - `emotionalIntensity` (number): 1-10
- `domain` (string): general | gaming | education | therapy
- `loreBook` (string, optional): World-building details

**Response:** `201 Created`
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "title": "A cyberpunk detective story about...",
  "author": "507f1f77bcf86cd799439011",
  "initialPrompt": "A cyberpunk detective story about loss...",
  "parameters": { ... },
  "domain": "general",
  "nodes": [
    {
      "id": "node-0",
      "text": "The neon lights of Neo-Tokyo reflected off the rain-soaked streets...",
      "choices": [
        {
          "label": "Investigate the memory chip",
          "toNodeId": "node-pending-0"
        },
        {
          "label": "Contact your informant",
          "toNodeId": "node-pending-1"
        }
      ],
      "metadata": {
        "emotionalTone": "dark",
        "importance": 10
      }
    }
  ],
  "currentNodeId": "node-0",
  "worldState": {},
  "status": "active",
  "createdAt": "2025-10-03T15:30:00.000Z"
}
```

**Errors:**
- `400 Bad Request` - Missing required fields or invalid parameters
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Monthly story limit reached (free tier)
- `500 Internal Server Error` - AI generation failed

---

### Get User Stories

Retrieve user's stories with filtering and pagination.

**Endpoint:** `GET /stories`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `genre` (string, optional): Filter by genre
- `status` (string, optional): Filter by status (draft | active | completed | archived)
- `limit` (number, optional): Items per page (default: 20, max: 100)
- `page` (number, optional): Page number (default: 1)

**Example:** `GET /stories?genre=fantasy&status=active&limit=10&page=1`

**Response:** `200 OK`
```json
{
  "stories": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "title": "A cyberpunk detective story...",
      "initialPrompt": "A cyberpunk detective...",
      "parameters": { ... },
      "nodes": [ ... ],
      "status": "active",
      "plays": 15,
      "likes": 3,
      "createdAt": "2025-10-03T15:30:00.000Z",
      "updatedAt": "2025-10-03T16:45:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

---

### Get Story by ID

Retrieve a specific story.

**Endpoint:** `GET /stories/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "title": "A cyberpunk detective story...",
  "author": "507f1f77bcf86cd799439011",
  "initialPrompt": "A cyberpunk detective...",
  "parameters": { ... },
  "nodes": [ ... ],
  "currentNodeId": "node-0",
  "worldState": {
    "Detective": {
      "name": "Jake",
      "status": "alive",
      "inventory": ["badge", "memory chip"]
    }
  },
  "loreBook": "The year is 2077...",
  "status": "active",
  "createdAt": "2025-10-03T15:30:00.000Z"
}
```

**Errors:**
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not authorized to view this story
- `404 Not Found` - Story doesn't exist

---

### Continue Story

Make a choice and generate the next story segment.

**Endpoint:** `POST /stories/:id/continue`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "currentNodeId": "node-0",
  "choiceIndex": 0
}
```

**Parameters:**
- `currentNodeId` (string, required): ID of the current node
- `choiceIndex` (number, required): Index of the selected choice (0-based)

**Response:** `200 OK`
```json
{
  "node": {
    "id": "node-a1b2c3d4",
    "text": "You pick up the memory chip carefully. As you examine it...",
    "choices": [
      {
        "label": "Try to read the chip",
        "toNodeId": "node-pending-a1b2c3d4-0"
      },
      {
        "label": "Take it to a specialist",
        "toNodeId": "node-pending-a1b2c3d4-1"
      }
    ],
    "metadata": {
      "emotionalTone": "dark",
      "importance": 5
    }
  },
  "story": {
    "_id": "507f1f77bcf86cd799439012",
    "currentNodeId": "node-a1b2c3d4",
    "nodes": [ ... ],
    "updatedAt": "2025-10-03T16:50:00.000Z"
  }
}
```

**Errors:**
- `400 Bad Request` - Missing required fields or invalid choice
- `401 Unauthorized` - Not authenticated
- `404 Not Found` - Story or node not found
- `500 Internal Server Error` - AI generation failed

---

### Get Story Tree

Get visualization data for the story's branching structure.

**Endpoint:** `GET /stories/:id/tree`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "nodes": [
    {
      "id": "node-0",
      "text": "The neon lights of Neo-Tokyo...",
      "choices": 2
    },
    {
      "id": "node-a1b2c3d4",
      "text": "You pick up the memory chip...",
      "choices": 2
    }
  ],
  "edges": [
    {
      "from": "node-0",
      "to": "node-a1b2c3d4",
      "label": "Investigate the memory chip"
    }
  ]
}
```

---

### Update Story

Update story metadata (title, lore book, visibility, status).

**Endpoint:** `PUT /stories/:id`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Updated Story Title",
  "loreBook": "Updated lore...",
  "isPublic": true,
  "status": "completed"
}
```

**Allowed Fields:**
- `title` (string): Story title
- `loreBook` (string): World-building details
- `isPublic` (boolean): Whether story is publicly visible
- `status` (string): draft | active | completed | archived

**Response:** `200 OK`
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "title": "Updated Story Title",
  "isPublic": true,
  "status": "completed",
  ...
}
```

---

### Delete Story

Delete a story permanently.

**Endpoint:** `DELETE /stories/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "message": "Story deleted successfully"
}
```

**Errors:**
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not authorized to delete this story
- `404 Not Found` - Story doesn't exist

---

### Export Story

Export story as JSON for backup or sharing.

**Endpoint:** `GET /stories/:id/export`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "title": "A cyberpunk detective story...",
  "initialPrompt": "A cyberpunk detective...",
  "parameters": {
    "genre": "cyberpunk",
    "tone": "dark",
    "length": "medium",
    "branchingComplexity": 5,
    "emotionalIntensity": 7
  },
  "nodes": [ ... ],
  "loreBook": "The year is 2077...",
  "worldState": { ... }
}
```

---

### Get Public Stories

Browse publicly shared stories (no authentication required).

**Endpoint:** `GET /stories/public/feed`

**Query Parameters:**
- `genre` (string, optional): Filter by genre
- `limit` (number, optional): Items per page (default: 20)
- `page` (number, optional): Page number (default: 1)

**Example:** `GET /stories/public/feed?genre=fantasy&limit=10`

**Response:** `200 OK`
```json
{
  "stories": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "title": "The Dragon's Quest",
      "author": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "John Doe"
      },
      "initialPrompt": "A young knight embarks...",
      "parameters": { ... },
      "plays": 150,
      "likes": 45,
      "createdAt": "2025-10-02T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

---

## Error Handling

All errors follow this format:

```json
{
  "message": "Error description"
}
```

### HTTP Status Codes

- `200 OK` - Request succeeded
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request parameters
- `401 Unauthorized` - Authentication required or failed
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource doesn't exist
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

---

## Rate Limiting

### Limits

- **General API**: 10 requests per minute per IP
- **AI Generation** (`/stories`, `/stories/:id/continue`): 5 requests per minute per user
- **Authentication** (`/auth/login`, `/auth/register`): 5 requests per 15 minutes per IP

### Response Headers

When rate limited, you'll receive:

**Status:** `429 Too Many Requests`

**Headers:**
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1696346400
Retry-After: 60
```

**Response:**
```json
{
  "message": "Too many requests from this IP, please try again later."
}
```

---

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

Get the token from `/auth/login` or `/auth/register` responses.

Token expires in 7 days (default) - refresh by logging in again.

---

## WebSocket Events (Phase 3 - Coming Soon)

For real-time features like multiplayer storytelling:

**Connect:**
```javascript
const socket = io('http://localhost:5000');
```

**Events:**
- `join-story`: Join a story session
- `leave-story`: Leave a story session
- `story-update`: Receive real-time story updates
- `player-choice`: Notify other players of choices

---

## Versioning

Current version: 1.0.0

API versioning may be added in future releases (e.g., `/api/v2/...`).

---

## Support

For API support or questions:
- Email: support@storyforge.ai
- GitHub Issues: [repository-url]/issues

---

**Last Updated:** October 3, 2025

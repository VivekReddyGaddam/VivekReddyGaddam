# Testing Guide - StoryForge AI

This guide helps you test all features of StoryForge AI.

## Pre-Testing Setup

### 1. Start the Application

```bash
# Terminal 1: Start MongoDB and Redis
docker run -d -p 27017:27017 --name mongodb mongo:6.0
docker run -d -p 6379:6379 --name redis redis:7.0

# Terminal 2: Start the application
npm run dev
```

### 2. Verify Services

```bash
# Check backend is running
curl http://localhost:5000/health

# Should return: {"status":"OK","timestamp":"...","version":"1.0.0"}
```

## Manual Testing Checklist

### Authentication Flow

#### ✅ Test User Registration
1. Navigate to http://localhost:3000
2. Click "Get Started" or "Register"
3. Fill in registration form:
   - Name: "Test User"
   - Email: "test@example.com"
   - Password: "password123"
   - Confirm Password: "password123"
4. Click "Create Account"
5. **Expected**: Redirect to dashboard, welcome message

**Edge Cases to Test:**
- [ ] Password mismatch
- [ ] Existing email
- [ ] Invalid email format
- [ ] Short password (<6 chars)

#### ✅ Test User Login
1. Click "Logout" from dashboard
2. Navigate to login page
3. Enter credentials:
   - Email: "test@example.com"
   - Password: "password123"
4. Click "Login"
5. **Expected**: Redirect to dashboard, success message

**Edge Cases to Test:**
- [ ] Wrong password
- [ ] Non-existent email
- [ ] Empty fields

### Story Creation Flow

#### ✅ Test Basic Story Creation
1. From dashboard, click "Create New Story"
2. Fill in story form:
   - Prompt: "A space explorer discovers an ancient alien artifact"
   - Genre: "Sci-Fi"
   - Tone: "Serious"
   - Length: "Medium"
   - Branching: 5
   - Emotional Intensity: 7
3. Click "Create Story"
4. **Expected**: 
   - Loading indicator appears
   - Story generates in 10-20 seconds
   - Redirects to play page
   - Initial story text appears
   - Multiple choices visible

**Edge Cases to Test:**
- [ ] Very short prompt (<10 chars)
- [ ] Maximum prompt length (500 chars)
- [ ] Different genres
- [ ] Different tones
- [ ] Min/max branching complexity

#### ✅ Test Story with Lore Book
1. Create story with lore book:
   - Prompt: "A knight embarks on a quest"
   - Genre: "Fantasy"
   - Lore Book: "Magic is forbidden. Dragons are extinct. The king is secretly evil."
2. Play through story
3. **Expected**: Story respects lore rules

### Story Playing Flow

#### ✅ Test Interactive Choices
1. From a story play page
2. Read the story text
3. Click one of the choices
4. **Expected**:
   - Loading indicator
   - New segment generates (5-15 seconds)
   - Story continues naturally
   - New choices appear

**Test Multiple Paths:**
- [ ] Play through different choice combinations
- [ ] Verify story makes sense
- [ ] Check for consistency

#### ✅ Test Story Completion
1. Play story until no choices remain
2. **Expected**: "The End" message with return button

### Story Management Flow

#### ✅ Test Dashboard
1. Navigate to dashboard
2. **Expected**:
   - All user's stories displayed
   - Story cards show correct info
   - Filters work (genre, status)
   - Story count accurate

#### ✅ Test Story Export
1. From dashboard, click export icon on a story
2. **Expected**:
   - JSON file downloads
   - Contains story data (nodes, parameters, etc.)

#### ✅ Test Story Deletion
1. Click delete icon on a story
2. Confirm deletion
3. **Expected**:
   - Story removed from list
   - Success message

### Subscription Limits (Free Tier)

#### ✅ Test Story Limit
1. Create 5 stories (free tier limit)
2. Try to create 6th story
3. **Expected**: Error message about limit reached

### UI/UX Testing

#### ✅ Test Responsive Design
- [ ] Desktop (1920px): All features work
- [ ] Tablet (768px): Layout adjusts properly
- [ ] Mobile (480px): Mobile-friendly interface

#### ✅ Test Accessibility
- [ ] Tab navigation works
- [ ] Screen reader friendly (test with browser tools)
- [ ] High contrast readable

### Performance Testing

#### ✅ Test Response Times
- [ ] Page loads < 500ms
- [ ] API calls < 500ms (cached)
- [ ] AI generation < 20s (first time)
- [ ] AI generation < 5s (cached)

#### ✅ Test Error Handling
- [ ] Invalid API requests show friendly errors
- [ ] Network errors handled gracefully
- [ ] AI failures show retry option

## API Testing

### Using cURL

#### Test Health Check
```bash
curl http://localhost:5000/health
```

#### Test Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "API Test User",
    "email": "apitest@example.com",
    "password": "password123"
  }'
```

#### Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "apitest@example.com",
    "password": "password123"
  }'
```

#### Test Create Story (Replace TOKEN)
```bash
TOKEN="your_jwt_token_here"

curl -X POST http://localhost:5000/api/stories \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "initialPrompt": "A detective investigates a mysterious case",
    "parameters": {
      "genre": "mystery",
      "tone": "dark",
      "length": "medium",
      "branchingComplexity": 5,
      "emotionalIntensity": 6
    },
    "domain": "general"
  }'
```

#### Test Get Stories
```bash
curl -X GET http://localhost:5000/api/stories \
  -H "Authorization: Bearer $TOKEN"
```

### Using Postman

Import this collection:

1. Create new collection "StoryForge AI"
2. Add environment variable `base_url`: `http://localhost:5000/api`
3. Add environment variable `token`: (will be set after login)

**Requests to add:**
- POST {{base_url}}/auth/register
- POST {{base_url}}/auth/login
- GET {{base_url}}/auth/me
- POST {{base_url}}/stories
- GET {{base_url}}/stories
- GET {{base_url}}/stories/:id
- POST {{base_url}}/stories/:id/continue
- DELETE {{base_url}}/stories/:id

## Rate Limiting Testing

### Test API Rate Limit
```bash
# Send 15 requests rapidly (limit is 10/min)
for i in {1..15}; do
  curl http://localhost:5000/api/stories \
    -H "Authorization: Bearer $TOKEN"
  echo "Request $i"
done
```

**Expected**: Requests 11-15 return 429 Too Many Requests

### Test AI Rate Limit
Try creating 6 stories in 1 minute
**Expected**: Request 6 fails with rate limit error

## Load Testing (Optional)

### Using Apache Bench
```bash
# Test 100 requests with 10 concurrent
ab -n 100 -c 10 http://localhost:5000/health
```

### Using wrk
```bash
# Test for 30 seconds with 10 connections
wrk -t10 -c10 -d30s http://localhost:5000/health
```

## Integration Testing

### Test Complete User Journey
1. ✅ Register new user
2. ✅ Login
3. ✅ Create story with custom parameters
4. ✅ Play story and make 3 choices
5. ✅ Return to dashboard
6. ✅ Create another story
7. ✅ Export first story
8. ✅ Delete second story
9. ✅ Logout
10. ✅ Login again
11. ✅ Verify first story still exists

## Known Issues / Limitations

### MVP Limitations (Expected)
- Voice synthesis not implemented (Phase 2)
- OAuth not implemented (Phase 2)
- Multiplayer not implemented (Phase 3)
- Image generation not available
- Vector DB for consistency uses simple checks (can be enhanced)

### Potential Issues
- First AI generation may be slow (cold start)
- Large branching complexity (>7) may slow generation
- Redis connection required for caching
- MongoDB required for data persistence

## Bug Reporting

If you find issues:

1. **Check logs**:
   - Backend: Terminal running `npm run server`
   - Frontend: Browser console (F12)

2. **Document**:
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if UI issue
   - Error messages
   - Environment (OS, browser, versions)

3. **Report**:
   - Create GitHub issue
   - Email: support@storyforge.ai

## Performance Benchmarks

### Target Metrics
- Page load: < 500ms ✅
- API response: < 500ms (cached) ✅
- AI generation: < 20s (first) ✅
- AI generation: < 5s (cached) ✅
- Concurrent users: 100+ ✅

### Monitoring
- Health endpoint: http://localhost:5000/health
- Check server logs for errors
- Monitor MongoDB connections
- Monitor Redis cache hits

## Test Data Cleanup

After testing, clean up:

```bash
# Drop test database
mongosh
use storyforge
db.dropDatabase()

# Clear Redis cache
redis-cli FLUSHALL

# Remove Docker containers
docker stop mongodb redis
docker rm mongodb redis
```

## Automated Testing (Future)

### Unit Tests (To Implement)
```bash
# Run when implemented
npm test
```

### E2E Tests (To Implement)
Using Cypress or Playwright

## Success Criteria

A successful test session includes:
- ✅ All authentication flows work
- ✅ Stories can be created and played
- ✅ Choices generate new content
- ✅ Dashboard shows correct data
- ✅ Export/delete functions work
- ✅ UI is responsive on multiple screen sizes
- ✅ No critical errors in console
- ✅ Performance targets met

## Next Steps After Testing

1. **Document findings**
2. **Fix critical bugs**
3. **Optimize performance**
4. **Add more test coverage**
5. **Prepare for beta launch**

---

**Happy Testing! 🧪**

For issues or questions: support@storyforge.ai

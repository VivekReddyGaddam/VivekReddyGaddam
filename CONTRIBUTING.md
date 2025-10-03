# Contributing to StoryForge AI

Thank you for your interest in contributing to StoryForge AI! This document provides guidelines and instructions for contributing.

## Code of Conduct

Be respectful, inclusive, and professional in all interactions.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in Issues
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details (OS, Node version, etc.)

### Suggesting Features

1. Check existing issues/discussions for similar suggestions
2. Create a new issue with:
   - Clear description of the feature
   - Use cases and benefits
   - Potential implementation approach
   - Any mockups or examples

### Pull Requests

1. **Fork the repository** and create a new branch from `main`
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow existing code style and conventions
   - Add tests for new functionality
   - Update documentation as needed

3. **Commit your changes**
   ```bash
   git commit -m "Brief description of changes"
   ```
   Follow conventional commits format:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation
   - `refactor:` for code refactoring
   - `test:` for test updates
   - `chore:` for maintenance

4. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request**
   - Provide a clear title and description
   - Reference any related issues
   - Ensure all tests pass
   - Request review from maintainers

## Development Setup

See the [README.md](README.md) for detailed setup instructions.

## Code Style Guidelines

### JavaScript/React
- Use ES6+ syntax
- Prefer functional components with hooks
- Use meaningful variable and function names
- Add comments for complex logic
- Follow ESLint configuration

### CSS/Tailwind
- Use Tailwind utility classes
- Follow mobile-first approach
- Maintain consistent spacing
- Use theme colors

### Backend
- Follow RESTful API conventions
- Validate all inputs
- Handle errors gracefully
- Add JSDoc comments for functions

## Testing

- Write unit tests for new features
- Ensure existing tests pass
- Test on multiple browsers/devices when applicable

## Documentation

- Update README.md for significant changes
- Add JSDoc comments for new functions
- Update API documentation for endpoint changes
- Include examples where helpful

## Questions?

Feel free to open an issue for questions or reach out to the maintainers.

Thank you for contributing! 🎉

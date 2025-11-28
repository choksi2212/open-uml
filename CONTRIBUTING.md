# Contributing to Open UML

Thank you for your interest in contributing to Open UML! This document provides guidelines and instructions for contributing.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/open-uml.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Follow the setup instructions in [SETUP.md](SETUP.md)

## Development Workflow

1. Make your changes
2. Test your changes: `npm run electron:dev`
3. Ensure code quality: `npm run lint`
4. Commit using semantic commits (see below)
5. Push to your fork: `git push origin feature/your-feature-name`
6. Open a Pull Request

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Examples:
```
feat: add diagram templates menu
fix: resolve SVG rendering issue on Windows
docs: update installation instructions
style: format code with prettier
```

## Code Style

- Use TypeScript for all new code
- Follow existing code patterns
- Use functional components with hooks
- Keep components small and focused
- Add comments for complex logic

## Testing

Before submitting a PR:

- [ ] Test on Windows (if possible)
- [ ] Test on macOS (if possible)
- [ ] Verify PlantUML rendering works
- [ ] Check error handling
- [ ] Test keyboard shortcuts
- [ ] Verify theme switching
- [ ] Test file operations (open/save)

## Pull Request Process

1. Update CHANGELOG.md with your changes
2. Ensure all checks pass
3. Request review from maintainers
4. Address any feedback
5. Once approved, your PR will be merged

## Feature Requests

Open an issue with:
- Clear description of the feature
- Use case / motivation
- Proposed implementation (if applicable)

## Bug Reports

Include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- OS and version
- App version

## Questions?

Feel free to open an issue for questions or discussions!


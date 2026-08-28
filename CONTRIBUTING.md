# Contributing to PayLens

Thank you for your interest in contributing to PayLens! This document provides guidelines and instructions for contributing to the project.

## 🚀 Getting Started

### Prerequisites

- Docker & Docker Compose
- Python 3.11+
- Node.js 18+
- Git

### Setup Development Environment

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/paylens.git
   cd paylens
   ```

2. **Set up development environment**
   ```bash
   make install-dev
   make up-dev
   ```

3. **Configure environment variables**
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env.local
   cp tests/.env.example tests/.env
   ```

4. **Start development services**
   ```bash
   # Start infrastructure services
   make up-dev
   
   # In separate terminal, start backend
   cd backend
   uvicorn app.main:app --reload
   
   # In another terminal, start frontend
   cd frontend
   npm run dev
   ```

## 📋 Development Workflow

### Branch Strategy

- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/*`: Feature branches
- `bugfix/*`: Bug fix branches
- `hotfix/*`: Urgent production fixes

### Creating a Feature Branch

```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

### Making Changes

1. **Make your changes** following the coding standards
2. **Test your changes** locally
3. **Commit your changes** with clear messages
4. **Push to your fork**
5. **Create a Pull Request**

### Commit Message Format

Follow conventional commits format:

```
type(scope): subject

body

footer
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Maintenance tasks

Example:
```
feat(agents): add new root cause category for network issues

- Add E6001 category for DNS resolution failures
- Update EvidenceAgent to detect DNS-related log patterns
- Add corresponding runbook for DNS issues

Closes #123
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
cd tests && npm test

# Run specific test suite
cd tests && npx playwright test tests/api/payment.spec.ts

# Run tests in UI mode
cd tests && npm run test:ui
```

### Writing Tests

- Add tests for new features
- Ensure all tests pass before submitting PR
- Aim for >80% code coverage

### Test Structure

```
tests/
├── tests/
│   ├── api/              # API endpoint tests
│   └── ui/               # UI component tests
└── fixtures/             # Test data fixtures
```

## 📝 Code Style

### Python (Backend)

- Follow PEP 8 guidelines
- Use Black for formatting
- Use type hints where appropriate
- Maximum line length: 100 characters

```bash
# Format code
cd backend
black app/

# Check linting
flake8 app/

# Type checking
mypy app/
```

### TypeScript (Frontend)

- Follow ESLint rules
- Use Prettier for formatting
- Use strict TypeScript settings

```bash
# Format code
cd frontend
npm run lint

# Type checking
npm run type-check
```

## 🏗️ Architecture Guidelines

### Adding New Agents

1. Create agent class inheriting from `BaseAgent`
2. Implement the `process` method
3. Add agent to the workflow in `workflow.py`
4. Add tests for the new agent
5. Update documentation

### Adding New API Endpoints

1. Create endpoint function in appropriate API module
2. Add request/response models
3. Add error handling
4. Add API tests
5. Update API documentation

### Adding New UI Components

1. Create component in `components/` directory
2. Follow existing component patterns
3. Add TypeScript types
4. Add UI tests
5. Update component documentation

## 📖 Documentation

### Updating Documentation

- Keep README.md up to date
- Update API documentation for new endpoints
- Add comments for complex logic
- Update CHANGELOG.md for significant changes

### Documentation Files

- `README.md`: Main project documentation
- `docs/SPECS.md`: Technical specifications
- `docs/TICKETS.md`: Development tickets
- `docs/API.md`: API documentation
- `docs/DEPLOYMENT.md`: Deployment guide

## 🐛 Bug Reporting

### Creating a Bug Report

1. Check existing issues first
2. Use the bug report template
3. Provide:
   - Clear description
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Environment details
   - Screenshots/logs if applicable

### Bug Report Template

```markdown
**Description**
A clear description of the bug.

**Steps to Reproduce**
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected Behavior**
What you expected to happen.

**Actual Behavior**
What actually happened.

**Environment**
- OS: [e.g. Ubuntu 20.04]
- Python version: [e.g. 3.11]
- Node version: [e.g. 18.0]

**Additional Context**
Add any other context about the problem here.
```

## ✨ Feature Requests

### Proposing a Feature

1. Check existing feature requests
2. Use the feature request template
3. Provide:
   - Clear description
   - Use cases
   - Potential implementation approach
   - Impact on existing functionality

## 🔍 Pull Request Process

### Before Submitting

- [ ] Code follows project style guidelines
- [ ] Tests pass locally
- [ ] Documentation is updated
- [ ] Commit messages are clear
- [ ] PR description is comprehensive

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing performed

## Checklist
- [ ] Code follows style guidelines
- [ ] Tests pass
- [ ] Documentation updated
- [ ] No merge conflicts

## Related Issues
Closes #123, #456
```

### Review Process

1. Automated checks must pass
2. At least one maintainer approval required
3. Address review comments
4. Update PR as needed
5. Maintainer merges to develop branch

## 📢 Release Process

### Version Bumping

- Follow semantic versioning (MAJOR.MINOR.PATCH)
- Update version in:
  - `backend/pyproject.toml`
  - `frontend/package.json`
  - `README.md`

### Release Checklist

- [ ] All tests passing
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version numbers updated
- [ ] Git tag created
- [ ] Release notes published

## 🤝 Community Guidelines

### Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Resolve conflicts professionally

### Communication

- Use GitHub issues for bugs and features
- Use discussions for questions and ideas
- Be patient with maintainers and contributors

## 🎯 Areas for Contribution

We welcome contributions in:

- New agent implementations
- Additional root cause categories
- UI/UX improvements
- Performance optimizations
- Documentation improvements
- Test coverage
- Bug fixes
- Integration with additional services

## 📚 Resources

- [Project Documentation](docs/)
- [API Documentation](http://localhost:8000/docs)
- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)

## ❓ Questions?

Feel free to:
- Open a GitHub discussion
- Ask in existing issues
- Contact maintainers directly

Thank you for contributing to PayLens! 🎉
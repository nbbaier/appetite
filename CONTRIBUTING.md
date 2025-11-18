# Contributing to Appetite

Thank you for your interest in contributing to Appetite! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style](#code-style)
- [Testing](#testing)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)

## Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code. Please be respectful and constructive in all interactions.

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- A Supabase account (for database and authentication)

### Initial Setup

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/appetite.git
   cd appetite
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Run tests:**
   ```bash
   npm test
   ```

## Development Workflow

### Branch Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features (branch from `develop`)
- `fix/*` - Bug fixes (branch from `develop`)
- `hotfix/*` - Critical fixes (branch from `main`)

### Creating a Feature Branch

```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

### Making Changes

1. Make your changes in your feature branch
2. Write or update tests as needed
3. Ensure all tests pass: `npm test`
4. Ensure code is properly formatted: `npm run check:fix`
5. Commit your changes (see [Commit Messages](#commit-messages))

### Pre-commit Hooks

This project uses Husky and lint-staged for pre-commit hooks. When you commit:

- Code is automatically formatted with Biome
- Linting rules are enforced
- Staged files are checked for quality

If the hooks fail, fix the issues before committing.

## Code Style

### TypeScript

- Use TypeScript strict mode
- Prefer explicit types over implicit
- Use interfaces for object shapes
- Use type aliases for unions/intersections
- Avoid `any` - use `unknown` if type is truly unknown

### React

- Use functional components with hooks
- Use TypeScript for props and state
- Extract complex logic into custom hooks
- Use React.memo for expensive components
- Prefer composition over inheritance

### Naming Conventions

- **Components:** PascalCase (`UserProfile.tsx`)
- **Hooks:** camelCase starting with `use` (`useAuth.ts`)
- **Utilities:** camelCase (`formatDate.ts`)
- **Constants:** UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`)
- **Types/Interfaces:** PascalCase (`User`, `ApiResponse`)

### File Structure

```
src/
├── components/     # React components
│   ├── ui/        # Reusable UI components
│   └── [feature]/ # Feature-specific components
├── contexts/      # React Context providers
├── hooks/         # Custom React hooks
├── lib/           # Utility libraries
│   └── validation/ # Zod schemas
├── pages/         # Page components
├── types/         # TypeScript type definitions
└── main.tsx       # Application entry point
```

### Import Order

1. External dependencies (React, libraries)
2. Internal absolute imports (types, contexts)
3. Relative imports (local components, utilities)
4. Styles (CSS imports)

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Writing Tests

- Write tests for all new features
- Aim for >80% code coverage
- Test edge cases and error scenarios
- Use descriptive test names

### Test Structure

```typescript
describe('ComponentName', () => {
  it('should render correctly', () => {
    // Arrange
    const props = { ... };

    // Act
    render(<ComponentName {...props} />);

    // Assert
    expect(screen.getByText('...')).toBeInTheDocument();
  });
});
```

### Testing Best Practices

- Use React Testing Library for component tests
- Test behavior, not implementation
- Avoid testing internal component state
- Mock external dependencies (API calls, Supabase)
- Use `act()` for state updates in tests

## Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat:** New feature
- **fix:** Bug fix
- **docs:** Documentation changes
- **style:** Code style changes (formatting, no logic change)
- **refactor:** Code refactoring
- **test:** Adding or updating tests
- **chore:** Build process or tooling changes
- **perf:** Performance improvements

### Examples

```bash
feat(pantry): add ingredient expiration notifications

Implements automatic notifications when ingredients are nearing expiration.
Uses the NotificationContext to display alerts 3 days before expiration.

Closes #123
```

```bash
fix(auth): resolve session persistence issue

Fixed issue where user session was not persisting after page refresh.
Updated AuthContext to properly handle session restoration.

Fixes #456
```

## Pull Request Process

### Before Submitting

1. ✅ All tests pass (`npm test`)
2. ✅ Code is properly formatted (`npm run check:fix`)
3. ✅ No TypeScript errors (`npm run build`)
4. ✅ Tests added for new features
5. ✅ Documentation updated (if needed)
6. ✅ Commit messages follow convention

### PR Template

When creating a PR, include:

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing completed
- [ ] All tests passing

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
```

### Review Process

1. **Submit PR** against `develop` branch
2. **Automated checks** will run (tests, linting)
3. **Code review** by maintainers
4. **Address feedback** if requested
5. **Merge** once approved and checks pass

### Merge Requirements

- ✅ At least one approval from a maintainer
- ✅ All CI checks passing
- ✅ No merge conflicts
- ✅ Branch up to date with base

## Issue Reporting

### Bug Reports

When reporting a bug, include:

- **Description:** Clear description of the issue
- **Steps to Reproduce:** Detailed steps to reproduce the bug
- **Expected Behavior:** What should happen
- **Actual Behavior:** What actually happens
- **Environment:** Browser, OS, Node version
- **Screenshots:** If applicable
- **Error Messages:** Full error messages or stack traces

### Feature Requests

When requesting a feature, include:

- **Problem:** What problem does this solve?
- **Solution:** Proposed solution
- **Alternatives:** Alternative solutions considered
- **Additional Context:** Any other relevant information

### Issue Labels

- **bug:** Something isn't working
- **enhancement:** New feature or request
- **documentation:** Documentation improvements
- **good first issue:** Good for newcomers
- **help wanted:** Extra attention needed
- **question:** Further information requested

## Development Best Practices

### Performance

- Use React.memo for expensive components
- Implement virtualization for long lists (react-window)
- Lazy load routes and heavy components
- Optimize images and assets
- Monitor bundle size (`npm run build:analyze`)

### Security

- Never commit secrets or API keys
- Validate all user inputs with Zod schemas
- Use Supabase RLS policies for data access
- Sanitize user-generated content
- Follow OWASP security guidelines

### Accessibility

- Use semantic HTML elements
- Add ARIA labels where needed
- Ensure keyboard navigation works
- Maintain proper color contrast
- Test with screen readers

### Code Quality

- Keep functions small and focused
- Extract complex logic into utilities
- Avoid deeply nested code
- Use meaningful variable names
- Comment complex algorithms
- Remove dead code and unused imports

## Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [Vitest Documentation](https://vitest.dev)
- [Biome Documentation](https://biomejs.dev)

## Questions?

If you have questions about contributing:

- Check existing issues and discussions
- Create a new discussion for general questions
- Create an issue for specific problems

Thank you for contributing to Appetite! 🎉

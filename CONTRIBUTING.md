# Contributing to Meme Generator

Thank you for your interest in contributing to Meme Generator! We appreciate contributions from everyone, whether you're fixing bugs, adding features, or improving documentation.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Submitting Changes](#submitting-changes)
- [Reporting Bugs](#reporting-bugs)
- [Requesting Features](#requesting-features)

## Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please be respectful and considerate in all interactions.

**Expected behavior:**
- Be respectful of different viewpoints and experiences
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards others

**Unacceptable behavior:**
- Harassment, trolling, or discriminatory comments
- Personal attacks or insults
- Publishing others' private information
- Any conduct inappropriate in a professional setting

## Getting Started

### Prerequisites

- Node.js 22.x (check `.nvmrc` file)
- npm (comes with Node.js)
- Git

### Installation

Follow the installation steps in the [README](README.md). Make sure you:

1. Fork and clone the repository
2. Install dependencies with `npm install`
3. Set up environment variables if needed (see README for details)
4. Start the dev server with `npm run dev`

### Development Commands

```bash
npm run dev          # Start development server
npm test             # Run tests once
npm run test:watch   # Run tests in watch mode
npm run lint         # Check for linting errors
npm run build        # Build for production
```

## Development Workflow

### Before You Start

1. Check existing issues to avoid duplicate work
2. For major changes, open an issue first to discuss your approach
3. Comment on the issue you want to work on so others know it's taken

### Creating a Branch

Use descriptive branch names:

```bash
git checkout -b feat/add-meme-search
git checkout -b fix/pagination-bug
git checkout -b docs/update-readme
```

Branch prefixes:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation
- `refactor/` - Code refactoring
- `test/` - Adding tests

### Making Changes

1. Write clean, readable code
2. Add tests for new features or bug fixes
3. Update documentation if needed
4. Keep commits focused and atomic
5. Test your changes thoroughly

### Commit Messages

Follow conventional commit format:

```
type: brief description

Longer explanation if needed
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
```bash
git commit -m "feat: add keyboard navigation to templates"
git commit -m "fix: resolve mobile pagination issue"
git commit -m "docs: update API documentation"
```

## Coding Standards

### JavaScript/React

- Use ES6+ features (arrow functions, destructuring, etc.)
- Prefer functional components with hooks
- Use meaningful variable and function names
- Keep functions small and focused
- Add comments for complex logic

### Code Style

- Indentation: 2 spaces
- Quotes: Single quotes for JS, double for JSX
- Semicolons: Required
- Max line length: 100 characters (soft limit)

### CSS/Styling

- Use TailwindCSS utility classes when possible
- Follow mobile-first responsive design
- Ensure dark mode compatibility
- Maintain WCAG AA color contrast standards

### Accessibility

- Use semantic HTML elements
- Add ARIA labels where appropriate
- Ensure keyboard navigation works
- Test with screen readers when possible

## Submitting Changes

### Pull Request Checklist

Before submitting, ensure:

- [ ] Code follows project style guidelines
- [ ] All tests pass (`npm test`)
- [ ] No linting errors (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] Self-reviewed your code
- [ ] Added/updated tests if needed
- [ ] Updated documentation if needed
- [ ] Tested in multiple browsers (for UI changes)

### Creating a Pull Request

1. Push your branch to your fork
2. Open a PR against the main repository
3. Fill out the PR template with:
   - Clear description of changes
   - Related issue number (if applicable)
   - Screenshots for UI changes
   - Testing steps

### PR Review Process

- Maintainers will review within a few days
- Address any feedback by pushing new commits
- Once approved, your PR will be merged
- Your contribution will be recognized in the project

## Reporting Bugs

Before reporting a bug:
1. Check if it's already reported in [issues](https://github.com/avinash201199/MemeGenerator/issues)
2. Try the latest version to see if it's fixed
3. Gather relevant information

When reporting, include:
- Clear, descriptive title
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Environment details (OS, browser, Node version)
- Console errors if any

## Requesting Features

We welcome feature suggestions! When requesting:

- Check if it's already suggested
- Explain the problem it solves
- Describe your proposed solution
- Consider alternative approaches
- Add mockups or examples if helpful

Open an issue with the `enhancement` label.

## Finding Issues to Work On

Look for issues labeled:
- `good first issue` - Great for newcomers
- `help wanted` - Contributions welcome
- `documentation` - Documentation improvements

## Getting Help

Need assistance?
- Comment on the issue you're working on
- Check existing documentation and issues
- Reach out to [@avinash201199](https://github.com/avinash201199)

## Recognition

All contributors are recognized in:
- GitHub contributors list
- Project README (for significant contributions)
- Release notes

## Resources

- [Project README](README.md)
- [GitHub Repository](https://github.com/avinash201199/MemeGenerator)
- [Live Demo](https://meme-generator-three-psi.vercel.app/)
- [React Documentation](https://react.dev/)
- [TailwindCSS Docs](https://tailwindcss.com/docs)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Meme Generator! Your efforts help make this project better for everyone.

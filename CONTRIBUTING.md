# Contributing to BAAA Hub

Thank you for your interest in contributing to BAAA Hub! This document outlines
the process and standards for contributing to this project.

## Table of Contents

- [How to Propose Changes](#how-to-propose-changes)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Testing Requirements](#testing-requirements)
- [Review Process](#review-process)
- [Community Guidelines](#community-guidelines)

## How to Propose Changes

### Reporting Issues

Before creating an issue, please:

1. **Search existing issues** to avoid duplicates
2. **Use the appropriate issue template** (bug report, feature request, or
   question)
3. **Provide detailed information** including:
   - Clear description of the issue or feature
   - Steps to reproduce (for bugs)
   - Expected vs. actual behavior
   - Environment details (browser, OS, Node version)
   - Screenshots or code snippets when relevant

### Submitting Pull Requests

1. **Fork the repository** and create a new branch from `main`
2. **Follow the branch naming convention**: `feature/description` or
   `fix/description`
3. **Make your changes** following our coding standards
4. **Test your changes** thoroughly
5. **Run mandatory quality checks** (see below)
6. **Update documentation** if needed
7. **Submit a pull request** using the PR template
8. **Link related issues** in your PR description

#### Mandatory Pre-PR Quality Checks

**Before submitting any Pull Request**, you must run these commands and fix all
issues:

```bash
pnpm fe:lint          # Fix linting issues
pnpm fe:format        # Format code
pnpm fe:type-check    # Check TypeScript types
pnpm fe:test --coverage  # Run tests with coverage
```

All commands must complete successfully. For detailed guidelines, see
[`.github/copilot-instructions.md`](.github/copilot-instructions.md).

> **Note for AI/Copilot users:** These checks are mandatory and must pass before
> creating a PR. The CI/CD pipeline will fail if these checks don't pass locally
> first.

## Development Setup

### Requirements

- **Git**
- **Node 22.x LTS**
- **pnpm** (package manager v9.0+)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/MattiaPette/BAAA-hub.git
   cd BAAA-hub
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Start the development server:

   ```bash
   pnpm fe:dev
   ```

### Available Scripts

The project uses pnpm workspaces. Common scripts include:

#### Monorepo-wide Scripts

- `pnpm lint` - Run ESLint on all packages
- `pnpm format` - Format all code with Prettier
- `pnpm format:check` - Check code formatting without making changes

#### Package-specific Scripts

- `pnpm fe:dev` - Start frontend development server
- `pnpm fe:lint` - Run ESLint on frontend only
- `pnpm fe:format` - Format frontend code with Prettier
- `pnpm fe:test` - Run frontend tests
- `pnpm fe:build` - Build frontend for production
- `pnpm fe:type-checking` - Type checking

## Coding Standards

### Code Style

This project uses strict code quality tools with centralized configuration:

- **ESLint v9** with modern flat config for JavaScript/TypeScript linting
- **Airbnb** style guide as the base configuration
- **Prettier** for consistent code formatting across all packages
- **TypeScript** for type safety
- **Functional programming** principles where applicable (via
  eslint-plugin-functional)

All configuration is shared at the monorepo root level to ensure consistency
across packages.

### Linting and Formatting

**Before submitting a PR**, ensure your code passes all checks:

```bash
# Lint and fix all packages in the monorepo
pnpm lint
pnpm fe:lint

# Format all code
pnpm format
pnpm fe:format

# Or run package-specific commands
pnpm fe:lint
pnpm fe:format
```

Pre-commit hooks will automatically run linting and formatting on staged files.

### Code Conventions

- Use **arrow functions** for components and callbacks
- Follow **functional programming** principles (immutability, pure functions)
- Use **TypeScript** types/interfaces (avoid `any`)
- Write **descriptive variable and function names**
- Keep functions small and focused
- Add **comments** only when necessary to explain complex logic

### Component Guidelines

- Use **arrow function components**
- Implement **proper error boundaries**
- Follow **React hooks** best practices
- Use **Material-UI** components consistently
- Implement **responsive design**
- Ensure **accessibility** (a11y) compliance

### File Organization

- Place components in appropriate directories
- Use index files for clean imports
- Keep test files alongside source files (`.test.ts` or `.spec.ts`)
- Use meaningful file and folder names

## Testing Requirements

### Writing Tests

- Write tests for **new features** and **bug fixes**
- Use **Vitest** as the testing framework
- Follow **Testing Library** best practices
- Aim for **meaningful test coverage**
- Test user interactions and edge cases

### Running Tests

```bash
# Run all tests
pnpm fe:test

# Run tests with UI
pnpm fe:test:ui

# Run tests with coverage
pnpm fe:test:coverage
```

### Test Guidelines

- Write clear test descriptions
- Test behavior, not implementation
- Use `describe` blocks to group related tests
- Mock external dependencies appropriately
- Ensure tests are deterministic and isolated

## Review Process

### Pull Request Review

1. **Automated checks** must pass:
   - Linting (ESLint)
   - Formatting (Prettier)
   - Type checking (TypeScript)
   - Tests (Vitest)

2. **Code review** by maintainers:
   - Code quality and adherence to standards
   - Test coverage and quality
   - Documentation updates
   - No breaking changes (unless intentional)

3. **Feedback and iteration**:
   - Address reviewer comments
   - Make requested changes
   - Re-request review after updates

4. **Approval and merge**:
   - At least one approval required
   - All conversations resolved
   - Squash and merge preferred

### Response Times

- We aim to respond to PRs within **3-5 business days**
- Urgent fixes may be reviewed faster
- Complex changes may take longer

## Community Guidelines

### Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Provide constructive feedback
- Focus on collaboration
- Assume good intentions

### Getting Help

- Check the **README.md** for basic information
- Search **existing issues** for similar questions
- Create a **new issue** using the question template
- Be patient and respectful when asking for help

### Recognition

Contributors will be recognized in:

- Git commit history
- Release notes (for significant contributions)
- Project documentation

## Questions?

If you have questions about contributing, please:

1. Check this guide first
2. Search existing issues
3. Create a new issue with the "question" template

Thank you for contributing to BAAA Hub! 🎉

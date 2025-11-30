# BAAA Hub

![Test and Coverage](https://github.com/MattiaPette/BAAA-hub/workflows/Test%20and%20Coverage/badge.svg)
[![codecov](https://codecov.io/gh/MattiaPette/BAAA-hub/graph/badge.svg)](https://codecov.io/gh/MattiaPette/BAAA-hub)

A modern monorepo for PWA AI-powered applications built with React and Koa,
featuring TypeScript, Vite, and pnpm workspaces.

## Why pnpm?

This project uses [pnpm](https://pnpm.io) as its package manager for several key
benefits:

- ⚡ **Faster CI/CD**: Installation times reduced by up to 21x compared to yarn
- 💾 **Disk efficiency**: Shared dependencies across projects save disk space
- 🔒 **Strict dependencies**: Better isolation prevents phantom dependencies
- 🚀 **Modern monorepo**: Excellent workspace support and filtering capabilities

See [docs/PNPM_INSTALLATION.md](docs/PNPM_INSTALLATION.md) for installation
instructions and migration notes.

## Table of Contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Docker Deployment](#docker-deployment)
- [Available Commands](#available-commands)
- [Project Structure](#project-structure)
- [Development](#development)
- [Testing](#testing)
- [Building](#building)

## Requirements

- **Git**: Version control system ([Download](https://git-scm.com/downloads))
- **Node.js**: v20.x LTS or v24.x (recommended: v20.x or v24.11.1)
  - We recommend using [nvm](https://github.com/nvm-sh/nvm) or
    [fnm](https://github.com/Schniz/fnm) to manage Node versions
  - The project requires Node.js >= 20.0.0
- **pnpm**: Package manager (v9.0+)
  - Install globally: `npm install -g pnpm`
  - Or use Corepack (included with Node.js 16.13+): `corepack enable`
- **Docker**: For running MongoDB locally (optional but recommended)

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/MattiaPette/BAAA-hub.git
   cd BAAA-hub
   ```

2. **Use the correct Node version:**

   ```bash
   # If using nvm
   nvm use

   # If using fnm
   fnm use

   # Or manually install Node 20.x LTS or 24.x
   ```

3. **Install dependencies:**

   ```bash
   pnpm install
   ```

4. **Set up environment variables:**

   ```bash
   # Copy the example environment file
   cp environments/.env.example environments/.env.dev

   # Edit the .env.dev file with your configuration
   # Update Keycloak settings, ports, and other settings as needed
   ```

## Quick Start

### Frontend Only

After installation, you can start the frontend:

```bash
# Start the development server
pnpm fe:dev

# The application will be available at http://localhost:5173
```

### Full Stack (Recommended)

To run the complete application with backend and database:

```bash
# Start MongoDB, backend, and frontend concurrently
pnpm dev

# The application will be available at:
# - Frontend: http://localhost:5173
# - Backend API: http://localhost:3000
# - API Docs: http://localhost:3000/api/docs
```

## Docker Deployment

For production deployments, Docker images are automatically built and pushed to
GitHub Container Registry (GHCR) on merges to master.

```bash
# Deploy from GHCR images
cd deployment
cp .env.example .env
# Edit .env with your configuration
docker compose pull
docker compose up -d

# Access:
# - Application: http://localhost:8080
# - Health Check: http://localhost:8080/health
# - API Docs: http://localhost:8080/api/docs
```

**Common operations:**

```bash
cd deployment

docker compose pull && docker compose up -d  # Update to latest
docker compose logs -f                        # View logs
docker compose ps                             # Check status
docker compose down                           # Stop
```

The Docker deployment includes:

- ✅ Pre-built images from GHCR (automatic CI/CD)
- ✅ Frontend (React + Vite) served by nginx
- ✅ Backend (Node.js + Koa) API server
- ✅ MongoDB database + MinIO object storage
- ✅ nginx reverse proxy for unified endpoint
- ✅ Health checks and container orchestration

See [docs/README.md](docs/README.md) for complete deployment documentation.

## Available Commands

### Development commands

- `pnpm dev` - Start both frontend and backend with MongoDB (recommended for
  full stack development)
- `pnpm fe:dev` - Start frontend development server with hot module replacement
  (HMR)
- `pnpm be:dev` - Start backend development server with hot reload
- `pnpm db:start` - Start MongoDB container with Docker Compose
- `pnpm db:stop` - Stop MongoDB container

### Code Quality

#### Monorepo-wide Commands

- `pnpm lint` - Run ESLint on all packages and fix issues automatically
- `pnpm format` - Format all code with Prettier
- `pnpm format:check` - Check code formatting without making changes

#### Frontend Commands

- `pnpm fe:lint` - Run ESLint on frontend package only
- `pnpm fe:format` - Format frontend package code with Prettier
- `pnpm fe:type-check` - TypeScript type checking for frontend

#### Backend Commands

- `pnpm be:lint` - Run ESLint on backend package only
- `pnpm be:format` - Format backend package code with Prettier
- `pnpm be:type-check` - TypeScript type checking for backend

### Internationalization

- `pnpm fe:extract` - Extract translatable strings from source code
- `pnpm fe:compile` - Compile translation files

### Testing commands

#### Frontend

- `pnpm fe:test` - Run frontend tests in watch mode
- `pnpm fe:test:coverage` - Run frontend tests with coverage reporting

#### Backend

- `pnpm be:test` - Run backend tests in watch mode
- `pnpm be:test:coverage` - Run backend tests with coverage reporting

### Building commands

#### Frontend

- `pnpm fe:build` - Build the frontend application for production
  - TypeScript compilation
  - Vite bundling and optimization
  - PWA service worker generation

#### Backend

- `pnpm be:build` - Build the backend application for production
- `pnpm be:start` - Start the production backend server

## Project Structure

```txt
baaa-hub/
├── apps/
│   ├── Client.Web/          # Frontend React application
│   │   ├── src/             # Source code
│   │   │   ├── components/  # Reusable UI components
│   │   │   ├── containers/  # Page-level components
│   │   │   ├── helpers/     # Utility functions
│   │   │   ├── hooks/       # Custom React hooks
│   │   │   ├── locales/     # Translation files
│   │   │   ├── providers/   # React context providers
│   │   │   ├── services/    # API service layer
│   │   │   ├── types/       # TypeScript type definitions
│   │   │   └── theme/       # Material-UI theme configuration
│   │   ├── public/          # Static assets
│   │   └── package.json     # Frontend dependencies
│   └── Server.API/          # Backend Koa application
│       ├── src/             # Source code
│       │   ├── config/      # Configuration and database setup
│       │   ├── controllers/ # Route controllers
│       │   ├── middleware/  # Custom middleware
│       │   ├── models/      # Mongoose models
│       │   ├── routes/      # API routes
│       │   ├── types/       # TypeScript types and Zod schemas
│       │   └── utils/       # Utility functions
│       └── package.json     # Backend dependencies
├── docker-compose.yml       # MongoDB container configuration
├── package.json             # Root workspace configuration
└── README.md               # This file
```

## Development

The application consists of two parts:

### Frontend (React Application)

The frontend is built with:

- **React 19** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Material-UI (MUI)** - Component library
- **React Router** - Client-side routing
- **TanStack Query** - Server state management
- **Lingui** - Internationalization (i18n)
- **Vitest** - Unit testing framework

### Backend (Koa API Server)

The backend is built with:

- **Koa.js** - Lightweight web framework
- **TypeScript** - Type-safe JavaScript
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **Zod** - Schema validation
- **Vitest** - Unit testing framework

### Full Stack Development Workflow

1. **Start all services (recommended):**

   ```bash
   pnpm dev
   ```

   This starts:
   - MongoDB on port 27017
   - Backend API on port 3000
   - Frontend on port 5173

2. **Or start services individually:**

   ```bash
   # Terminal 1: Start MongoDB
   pnpm db:start

   # Terminal 2: Start backend
   pnpm be:dev

   # Terminal 3: Start frontend
   pnpm fe:dev
   ```

3. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - API Documentation: http://localhost:3000/api/docs

4. **Make your changes** - Both frontend and backend auto-reload when you save
   files

5. **Check code quality:**

   ```bash
   # Frontend
   pnpm fe:lint
   pnpm fe:type-check
   pnpm fe:test

   # Backend
   pnpm be:lint
   pnpm be:type-check
   pnpm be:test
   ```

6. **Build for production:**

   ```bash
   pnpm fe:build
   pnpm be:build
   ```

### Code Quality Enforcement

This project uses ESLint and Prettier to maintain consistent code style and
quality across the entire monorepo:

- **Centralized Configuration**: ESLint and Prettier configs are defined at the
  root level and shared across all packages for consistency
- **Pre-commit hooks**: Automatically lint and format staged files before each
  commit using [Husky](https://typicode.github.io/husky/) and
  [lint-staged](https://github.com/okonet/lint-staged)
- **CI/CD**: GitHub Actions run linting and formatting checks on all pull
  requests
- **VSCode Integration**: The workspace is configured to auto-format on save
  using Prettier

The hooks are automatically installed when you run `pnpm install`.

#### Configuration Files

- `.prettierrc.json` - Root Prettier configuration
- `.prettierignore` - Files to exclude from formatting
- `eslint.config.base.js` - Shared ESLint base configuration
- `apps/Client.Web/eslint.config.js` - Frontend-specific ESLint rules

## Testing

The project uses Vitest for testing with React Testing Library.

### Run Tests

```bash
# Run tests in watch mode (default)
pnpm fe:test

# Run tests with coverage
pnpm fe:test:coverage
```

For additional testing options, you can run the workspace commands directly:

```bash
# Run tests with UI (requires running in the Client.Web workspace)
cd apps/Client.Web && pnpm test:ui

# Run tests once without watch mode
cd apps/Client.Web && pnpm test run
```

### Test Files

Tests are located alongside their source files with the `.test.ts` or
`.spec.tsx` extension.

The project includes comprehensive unit tests for core logic including:

- Helper functions (request handling, error descriptions)
- Custom hooks (navigation blocking)
- Context providers (authentication, breadcrumbs)

Coverage reports are generated automatically on pull requests and can be viewed
in the CI workflow artifacts.

## Building

To create a production build:

```bash
pnpm fe:build
```

This will:

1. Type-check the TypeScript code
2. Bundle the application with Vite
3. Generate optimized assets in the `apps/Client.Web/build` directory
4. Create a PWA service worker for offline support

### Preview Production Build

After building, you can preview the production build locally:

```bash
cd apps/Client.Web
pnpm preview
```

## Examples

Looking for code examples? Check out the **[examples/](./examples/)** directory
for comprehensive guides:

- **[Basic Initialization](./examples/01-basic-initialization.md)** - Set up the
  application with all providers
- **[Authentication](./examples/02-authentication.md)** - Keycloak integration,
  login/logout flows
- **[Theme and Styling](./examples/03-theme-and-styling.md)** - Material-UI
  theming and customization
- **[Data Fetching](./examples/04-data-fetching.md)** - API requests with
  TanStack Query
- **[Navigation and Routing](./examples/05-navigation-and-routing.md)** -
  Breadcrumbs and navigation blocking

These examples cover typical workflows and API usage to help you get started
quickly.

## Basic Usage Example

Here's a simple example of the typical full stack development cycle:

```bash
# 1. Clone and setup
git clone https://github.com/MattiaPette/BAAA-hub.git
cd BAAA-hub
nvm use  # or fnm use
pnpm install

# 2. Start full stack development (MongoDB + Backend + Frontend)
pnpm dev

# 3. Open the application
# - Frontend: http://localhost:5173
# - Backend API: http://localhost:3000/api/docs
# - Navigate to Books page to see the CRUD demo

# 4. Make changes to files in:
# - apps/Client.Web/src/ (Frontend)
# - apps/Server.API/src/ (Backend)

# 5. Verify your changes
pnpm fe:lint
pnpm fe:test
pnpm be:lint
pnpm be:test

# 6. Build for production
pnpm fe:build
pnpm be:build
```

## Features

### Book Library Demo

The application includes a complete Book/Library management system to
demonstrate full stack capabilities:

- **RESTful API** - Backend exposes RESTful endpoints for CRUD operations
- **MongoDB Integration** - Books are stored in MongoDB with Mongoose ODM
- **Frontend UI** - React-based interface with Material-UI DataGrid
- **Form Validation** - Client and server-side validation with Zod
- **Real-time Updates** - TanStack Query for optimistic updates
- **Error Handling** - Comprehensive error handling and user feedback

## Contributing

When contributing to this project:

1. Ensure all tests pass:
   - `pnpm fe:test`
   - `pnpm be:test`
2. Lint your code:
   - `pnpm fe:lint`
   - `pnpm be:lint`
3. Format your code:
   - `pnpm fe:format`
   - `pnpm be:format`
4. Type-check your code:
   - `pnpm fe:type-check`
   - `pnpm be:type-check`
5. Build successfully:
   - `pnpm fe:build`
   - `pnpm be:build`

---

For more specific information:

- Frontend application: [apps/Client.Web/README.md](apps/Client.Web/README.md)
- Backend API: [apps/Server.API/README.md](apps/Server.API/README.md)

## Automation Configuration

This repository includes an `ai-config.json` manifest file that provides
machine-readable information about the project structure, build commands, and
automation workflows. This file helps AI agents and automation tools better
understand and interact with the repository.

### GitHub Copilot Development

When using GitHub Copilot or AI-assisted development tools, please refer to
[`.github/copilot-instructions.md`](.github/copilot-instructions.md) for
mandatory quality checks that must be run before submitting any Pull Request.
These checks ensure code quality and prevent CI/CD failures.

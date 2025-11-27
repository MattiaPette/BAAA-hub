# Docker Deployment Guide

This guide explains how to deploy the Activity Tracker application using Docker
containers for staging and production environments.

> **Note:** All deployment files are now organized in the `deployment/` folder.
> For a quick start guide, see [deployment/README.md](../deployment/README.md).

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Building the Docker Image](#building-the-docker-image)
- [Running with Docker Compose](#running-with-docker-compose)
- [Running Standalone Container](#running-standalone-container)
- [Production Deployment](#production-deployment)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)
- [Architecture](#architecture)

## Overview

The Activity Tracker application is containerized as a single Docker image that
includes:

- **Frontend**: React application built with Vite, served by nginx
- **Backend**: Node.js/Koa API server
- **Nginx Reverse Proxy**: Routes requests to frontend or backend

The deployment uses:

- A multi-stage Dockerfile for optimized build and minimal image size
- nginx as a reverse proxy to serve the frontend and proxy API requests to the
  backend
- Docker Compose for orchestrating the application and MongoDB containers
- **Single `.env` file** for all configuration (no more confusion!)
- Automated deployment script for easy management

All deployment files are organized in the `deployment/` folder for clarity.

## Prerequisites

- Docker Engine 20.10 or higher
- Docker Compose V2 or higher
- At least 2GB of available RAM
- At least 5GB of available disk space

## Quick Start

### Option 1: Using the deployment script (Recommended)

1. **Navigate to deployment folder**:

   ```bash
   cd deployment
   ```

2. **Create environment file**:

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Deploy**:

   ```bash
   ./deploy.sh build
   ./deploy.sh start
   ```

4. **Access the application**:
   - Application: http://localhost:8080
   - Health Check: http://localhost:8080/health
   - API Documentation: http://localhost:8080/api/docs

### Option 2: Using Docker Compose directly

1. **Navigate to deployment folder**:

   ```bash
   cd deployment
   ```

2. **Create environment file**:

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Build and start containers**:

   ```bash
   docker compose up -d
   ```

4. **Access the application**:
   - Application: http://localhost:8080
   - Health Check: http://localhost:8080/health
   - API Documentation: http://localhost:8080/api/docs

## Configuration

### Environment Variables

The application requires environment variables for both build-time (frontend)
and runtime (backend). **All configuration is now in a single `.env` file** in
the `deployment/` folder.

Create a `.env` file from the example:

```bash
cd deployment
cp .env.example .env
```

Edit `.env` with your values:

```bash
# Frontend (build-time)
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your_client_id
VITE_AUTH0_REDIRECT_URI=http://localhost:8080/callback
VITE_AUTH0_AUDIENCE=your_audience
VITE_API_BASE_URL=http://localhost:8080

# Backend (runtime)
CORS_ORIGIN=http://localhost:8080
DEBUG=false
```

See [Environment Variables](#environment-variables-reference) section for
detailed information.

## Building the Docker Image

All commands should be run from the `deployment/` folder.

### Using the deployment script (Recommended)

```bash
cd deployment
./deploy.sh build
```

### Using Docker Compose

Docker Compose will automatically build the image:

```bash
cd deployment
docker compose build
```

### Manual Build

Build the image manually with specific environment variables:

```bash
cd deployment
docker build \
  --build-arg VITE_AUTH0_DOMAIN=your-tenant.auth0.com \
  --build-arg VITE_AUTH0_CLIENT_ID=your_client_id \
  --build-arg VITE_AUTH0_REDIRECT_URI=http://localhost:8080/callback \
  --build-arg VITE_AUTH0_AUDIENCE=your_audience \
  --build-arg VITE_API_BASE_URL=http://localhost:8080 \
  -f Dockerfile \
  -t baaa-hub:latest \
  ..
```

### Build Arguments

The following build arguments are required:

- `VITE_AUTH0_DOMAIN`: Your Auth0 tenant domain
- `VITE_AUTH0_CLIENT_ID`: Your Auth0 application client ID
- `VITE_AUTH0_REDIRECT_URI`: Callback URL after authentication
- `VITE_AUTH0_AUDIENCE`: Auth0 API audience
- `VITE_API_BASE_URL`: Base URL for API requests

## Running with Docker Compose

All commands should be run from the `deployment/` folder.

### Using the deployment script (Recommended)

```bash
cd deployment

# Start containers
./deploy.sh start

# Stop containers
./deploy.sh stop

# Restart containers
./deploy.sh restart

# View logs (follow mode)
./deploy.sh logs

# Check status
./deploy.sh status
```

### Using Docker Compose directly

#### Start Containers

```bash
cd deployment

# Start in background
docker compose up -d

# Start with logs
docker compose up

# Rebuild and start
docker compose up -d --build
```

#### Stop Containers

```bash
cd deployment

# Stop containers
docker compose down

# Stop and remove volumes (WARNING: This deletes database data)
docker compose down -v
```

#### View Logs

```bash
cd deployment

# All services
docker compose logs -f

# Specific service
docker compose logs -f app
docker compose logs -f mongodb
```

#### Check Status

```bash
cd deployment
docker compose ps
```

Or using the deployment script:

```bash
cd deployment
./deploy.sh status
```

## Running Standalone Container

If you prefer to run the application container without Docker Compose:

### 1. Start MongoDB

```bash
docker run -d \
  --name mongodb-prod \
  -p 27017:27017 \
  -e MONGO_INITDB_DATABASE=baaa-hub \
  -v mongodb_data:/data/db \
  mongo:8.0
```

### 2. Run Application Container

```bash
docker run -d \
  --name app-prod \
  -p 8080:8080 \
  -e BACKEND_PORT=3000 \
  -e NODE_ENV=production \
  -e MONGODB_URI=mongodb://host.docker.internal:27017/baaa-hub \
  -e CORS_ORIGIN=http://localhost:8080 \
  -e DEBUG=false \
  baaa-hub:latest
```

**Note**: Replace `host.docker.internal` with the appropriate MongoDB hostname
for your environment.

## Production Deployment

### Using Pre-built Images from GitHub Container Registry (Recommended)

Docker images are automatically built and pushed to GitHub Container Registry on
every push to the master branch. This is the recommended approach for production
deployments.

**Available Images:**

- Frontend: `ghcr.io/mattiapette/baaa-hub/frontend:latest`
- Backend: `ghcr.io/mattiapette/baaa-hub/backend:latest`

**To deploy using pre-built images:**

1. **Prepare Environment Variables:**

   ```bash
   cd deployment
   cp .env.example .env
   # Edit .env with your production configuration
   ```

2. **Pull and Start:**

   ```bash
   docker compose pull
   docker compose up -d
   ```

3. **To update to a new version:**

   ```bash
   docker compose pull
   docker compose down
   docker compose up -d
   ```

### Manual Build (Alternative)

If you prefer to build images locally:

#### 1. Prepare Environment Variables

Update `deployment/.env` with your production domain:

```bash
cd deployment
# Edit .env
VITE_AUTH0_REDIRECT_URI=https://your-domain.com/callback
VITE_API_BASE_URL=https://your-domain.com
CORS_ORIGIN=https://your-domain.com
```

#### 2. Build Production Image

Using the deployment script:

```bash
cd deployment
./deploy.sh build
```

Or using Docker Compose:

```bash
cd deployment
docker compose build --no-cache
```

#### 3. Tag Image for Registry

```bash
docker tag baaa-hub:latest your-registry.com/baaa-hub:v1.0.0
docker tag baaa-hub:latest your-registry.com/baaa-hub:latest
```

#### 4. Push to Registry

```bash
docker push your-registry.com/baaa-hub:v1.0.0
docker push your-registry.com/baaa-hub:latest
```

#### 5. Deploy to Server

On your production server, copy the `deployment/` folder and:

```bash
cd deployment

# Pull the image
docker pull your-registry.com/baaa-hub:latest

# Create .env file with production values
cp .env.example .env
# Edit .env with production configuration

# Start containers
./deploy.sh start
```

Or using Docker Compose directly:

```bash
cd deployment

# Pull the image
docker pull your-registry.com/baaa-hub:latest

# Stop old containers
docker compose down

# Start new containers
docker compose up -d
```

### Easy Updates on Production Server

Using the deployment script makes updates simple:

```bash
cd deployment
./deploy.sh update
```

This will automatically:

1. Pull latest code (if using git)
2. Rebuild images
3. Restart containers

### Using External MongoDB

For production, you may want to use a managed MongoDB service (like MongoDB
Atlas):

Update `deployment/.env`:

```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/baaa-hub
```

Update `deployment/docker-compose.yml` to remove the MongoDB service if using
external database.

## Environment Variables Reference

### Frontend Variables (Build-time)

These variables are embedded in the frontend JavaScript bundle at build time.
Changes require rebuilding the Docker image.

| Variable                  | Description                       | Example                          |
| ------------------------- | --------------------------------- | -------------------------------- |
| `VITE_AUTH0_DOMAIN`       | Auth0 tenant domain               | `your-tenant.auth0.com`          |
| `VITE_AUTH0_CLIENT_ID`    | Auth0 application client ID       | `abc123xyz`                      |
| `VITE_AUTH0_REDIRECT_URI` | Callback URL after authentication | `http://localhost:8080/callback` |
| `VITE_AUTH0_AUDIENCE`     | Auth0 API audience identifier     | `https://api.yourapp.com`        |
| `VITE_API_BASE_URL`       | Base URL for API requests         | `http://localhost:8080`          |

### Backend Variables (Runtime)

These variables are used when the container starts. Changes take effect after
container restart.

| Variable       | Description               | Default                            | Example               |
| -------------- | ------------------------- | ---------------------------------- | --------------------- |
| `BACKEND_PORT` | Port for backend server   | `3000`                             | `3000`                |
| `NODE_ENV`     | Node environment          | `production`                       | `production`          |
| `MONGODB_URI`  | MongoDB connection string | `mongodb://mongodb:27017/baaa-hub` | See below             |
| `CORS_ORIGIN`  | Allowed CORS origin       | `http://localhost:8080`            | `https://yourapp.com` |
| `DEBUG`        | Enable debug logging      | `false`                            | `true` or `false`     |

### MongoDB URI Examples

```bash
# Local MongoDB (Docker Compose)
MONGODB_URI=mongodb://mongodb:27017/baaa-hub

# MongoDB with authentication
MONGODB_URI=mongodb://username:password@mongodb:27017/baaa-hub

# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/baaa-hub

# MongoDB replica set
MONGODB_URI=mongodb://host1:27017,host2:27017,host3:27017/baaa-hub?replicaSet=rs0
```

## Troubleshooting

### Container Won't Start

Check container logs:

```bash
docker compose -f docker-compose.prod.yml logs app
```

### Cannot Connect to MongoDB

Verify MongoDB is running:

```bash
docker compose -f docker-compose.prod.yml ps mongodb
```

Check MongoDB connection from app container:

```bash
docker compose -f docker-compose.prod.yml exec app sh
# Inside container
wget -O- http://localhost:3000/health
```

### Frontend Not Loading

Check nginx logs:

```bash
docker compose -f docker-compose.prod.yml exec app cat /var/log/nginx/error.log
```

### API Requests Failing

Check backend is running:

```bash
docker compose -f docker-compose.prod.yml exec app ps aux | grep node
```

Test backend directly:

```bash
curl http://localhost:8080/health
curl http://localhost:8080/api/books
```

### Port Already in Use

If port 8080 is already in use, modify `docker-compose.prod.yml`:

```yaml
services:
  app:
    ports:
      - '9090:8080' # Change external port to 9090
```

### Rebuild Image After Configuration Changes

If you change build-time environment variables:

```bash
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d
```

### Check Health Status

```bash
# Check container health
docker compose -f docker-compose.prod.yml ps

# Manual health check
curl http://localhost:8080/health
```

Expected response:

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456
}
```

## Architecture

### Container Architecture

```
┌─────────────────────────────────────────┐
│   Docker Container (Port 8080)          │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  Nginx (Port 8080)                 │ │
│  │  - Serves static frontend files    │ │
│  │  - Proxies /api/* to backend       │ │
│  │  - Proxies /health to backend      │ │
│  └─────────────┬──────────────────────┘ │
│                │                         │
│                ▼                         │
│  ┌────────────────────────────────────┐ │
│  │  Backend API (Port 3000)           │ │
│  │  - Koa.js server                   │ │
│  │  - REST API endpoints              │ │
│  │  - MongoDB connection              │ │
│  └─────────────┬──────────────────────┘ │
│                │                         │
└────────────────┼─────────────────────────┘
                 │
                 ▼
        ┌──────────────────┐
        │  MongoDB         │
        │  (Port 27017)    │
        └──────────────────┘
```

### Request Flow

1. **Frontend Requests**: `http://localhost:8080/` → nginx serves static files
2. **API Requests**: `http://localhost:8080/api/*` → nginx proxies to backend on
   port 3000
3. **Health Check**: `http://localhost:8080/health` → nginx proxies to backend
4. **Backend**: Processes requests and interacts with MongoDB

### File Structure in Container

```
/app/
├── backend/
│   ├── dist/              # Compiled backend code
│   ├── package.json
│   └── node_modules/
├── packages/
│   └── shared-types/
├── environments/
│   └── .env.production    # Backend runtime config
└── package.json

/usr/share/nginx/html/     # Frontend static files
├── index.html
├── assets/
│   ├── *.js
│   └── *.css
└── ...

/etc/nginx/nginx.conf      # Nginx configuration
```

### Multi-Stage Build Process

1. **Stage 1 - Frontend Builder**: Builds React app with Vite
2. **Stage 2 - Backend Builder**: Compiles TypeScript to JavaScript
3. **Stage 3 - Runtime**:
   - Installs nginx
   - Copies built frontend to nginx html directory
   - Copies built backend and production dependencies
   - Configures nginx as reverse proxy
   - Sets up entrypoint script to run both services

### Optimization Features

- **Multi-stage builds**: Reduces final image size by excluding build tools
- **Production dependencies only**: Backend includes only production npm
  packages
- **Static asset caching**: nginx caches static files with appropriate headers
- **Gzip compression**: nginx compresses responses
- **Health checks**: Docker monitors application health
- **Non-root user**: Runs as `node` user for security

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [nginx Documentation](https://nginx.org/en/docs/)
- [MongoDB Docker Hub](https://hub.docker.com/_/mongo)

## Support

For issues or questions:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review container logs
3. Open an issue on GitHub

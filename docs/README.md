# BAAA Hub Deployment Guide

Complete documentation for deploying BAAA Hub using Docker containers.

## Overview

BAAA Hub uses an automated CI/CD pipeline:

1. **On merge to master**: GitHub Actions builds Docker images and pushes to
   GHCR
2. **On server**: Pull images and run with `docker compose up -d`

```
┌─────────────────────────────────────────────────────────────────────┐
│  GitHub Actions (on merge to master)                                │
│  ┌──────────────────┐     ┌──────────────────────────────────────┐  │
│  │ Build Frontend   │     │ Build Backend                        │  │
│  │ (VITE_* secrets) │     │ (no build-time secrets)              │  │
│  └────────┬─────────┘     └───────────────┬──────────────────────┘  │
│           │                               │                         │
│           └───────────────┬───────────────┘                         │
│                           ▼                                         │
│              ┌────────────────────────┐                             │
│              │  Push to GHCR          │                             │
│              │  ghcr.io/mattiapette/  │                             │
│              │  baaa-hub/{frontend,   │                             │
│              │  backend}:latest       │                             │
│              └────────────────────────┘                             │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  Production Server                                                  │
│                                                                     │
│  docker compose pull && docker compose up -d                        │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  nginx (port 8080)                                          │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │    │
│  │  │  frontend   │  │  backend    │  │  keycloak   │          │    │
│  │  │  (static)   │  │  (API)      │  │  (auth)     │          │    │
│  │  └─────────────┘  └──────┬──────┘  └─────────────┘          │    │
│  │                          │                                   │    │
│  │                          ├──> mongodb                        │    │
│  │                          └──> minio                          │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

## Quick Start

### 1. Configure Environment

```bash
cd deployment
cp .env.example .env
# Edit .env with your values
```

### 2. Deploy

```bash
docker compose pull
docker compose up -d
```

### 3. Access

- **Application**: http://localhost:8080
- **Health Check**: http://localhost:8080/health
- **API Docs**: http://localhost:8080/api/docs

## Update Deployment

```bash
cd deployment
docker compose pull
docker compose up -d
```

## Environment Configuration

### Production Environment (`deployment/.env`)

| Variable                   | Description                                     | Required |
| -------------------------- | ----------------------------------------------- | -------- |
| `APP_PORT`                 | Port to expose (default: 8080)                  | No       |
| `CORS_ORIGIN`              | Allowed CORS origin                             | Yes      |
| `DEBUG`                    | Enable debug logging                            | No       |
| `KEYCLOAK_REALM`           | Keycloak realm name                             | Yes      |
| `KEYCLOAK_CLIENT_ID`       | Keycloak client ID                              | Yes      |
| `KEYCLOAK_WEBHOOK_SECRET`  | Webhook authentication secret                   | Yes      |
| `KEYCLOAK_ADMIN`           | Keycloak admin username                         | Yes      |
| `KEYCLOAK_ADMIN_PASSWORD`  | Keycloak admin password                         | Yes      |
| `KEYCLOAK_DB_USER`         | PostgreSQL user for Keycloak                    | Yes      |
| `KEYCLOAK_DB_PASSWORD`     | PostgreSQL password for Keycloak                | Yes      |
| `MINIO_ACCESS_KEY`         | MinIO access key                                | Yes      |
| `MINIO_SECRET_KEY`         | MinIO secret key                                | Yes      |
| `MINIO_BUCKET`             | MinIO bucket name                               | No       |

### Frontend Build Variables (CI/CD)

Frontend variables are baked in at build time via GitHub repository secrets:

| Secret                   | Description               |
| ------------------------ | ------------------------- |
| `VITE_KEYCLOAK_URL`      | Keycloak server URL       |
| `VITE_KEYCLOAK_REALM`    | Keycloak realm name       |
| `VITE_KEYCLOAK_CLIENT_ID`| Keycloak client ID        |
| `VITE_API_URL`           | API base URL              |

To update frontend config, update GitHub secrets and trigger a new build.

## Architecture

### Containers

| Container              | Image                                   | Purpose            |
| ---------------------- | --------------------------------------- | ------------------ |
| `baaa-hub-nginx`       | `nginx:alpine`                          | Reverse proxy      |
| `baaa-hub-frontend`    | `ghcr.io/mattiapette/baaa-hub/frontend` | Static frontend    |
| `baaa-hub-backend`     | `ghcr.io/mattiapette/baaa-hub/backend`  | API server         |
| `baaa-hub-keycloak`    | `quay.io/keycloak/keycloak:26.0`        | Identity provider  |
| `baaa-hub-keycloak-db` | `postgres:16-alpine`                    | Keycloak database  |
| `baaa-hub-mongodb`     | `mongo:8.0`                             | Database           |
| `baaa-hub-minio`       | `minio/minio:latest`                    | Object storage     |

### Ports

- **8080**: Application (nginx reverse proxy)
- Internal only: frontend (80), backend (3000), keycloak (8080), mongodb (27017), minio
  (9000/9001)

### Network

All containers communicate via the internal `baaa-hub-network` bridge network.

## HTTPS with Nginx Proxy Manager

### 1. Create Shared Network

```bash
docker network create npm-network
```

### 2. Update docker-compose.yml

```yaml
networks:
  baaa-hub-network:
    external: true
    name: npm-network
```

### 3. Configure NPM Proxy Host

- **Domain**: your-domain.com
- **Forward Host**: `baaa-hub-nginx`
- **Forward Port**: `8080`
- **SSL**: Request Let's Encrypt certificate
- **Force SSL**: Enabled
- **Websockets**: Enabled

### 4. Update Environment

```bash
# deployment/.env
CORS_ORIGIN=https://your-domain.com
```

### 5. Update Keycloak

In Keycloak Admin Console, update the client settings:

- **Valid Redirect URIs**: `https://your-domain.com/*`
- **Valid Post Logout Redirect URIs**: `https://your-domain.com/*`
- **Web Origins**: `https://your-domain.com`

### 6. Update GitHub Secrets

Update these secrets and trigger a new build:

- `VITE_KEYCLOAK_URL=https://your-domain.com/auth`
- `VITE_API_URL=https://your-domain.com`

## Common Operations

### View Logs

```bash
# All containers
docker compose logs -f

# Specific container
docker logs -f baaa-hub-backend
```

### Check Status

```bash
docker compose ps
curl http://localhost:8080/health
```

### Stop

```bash
docker compose down
```

### Restart

```bash
docker compose restart
```

### Clean Restart

```bash
docker compose down
docker compose pull
docker compose up -d
```

### MongoDB Backup

```bash
docker exec baaa-hub-mongodb mongodump --out=/data/backup
docker cp baaa-hub-mongodb:/data/backup ./mongodb-backup
```

### MongoDB Restore

```bash
docker cp ./mongodb-backup baaa-hub-mongodb:/data/backup
docker exec baaa-hub-mongodb mongorestore /data/backup
```

## Troubleshooting

### 502 Bad Gateway

Check if backend is healthy:

```bash
docker compose ps
docker logs baaa-hub-backend
```

### Frontend Not Loading

Check nginx and frontend:

```bash
docker logs baaa-hub-nginx
docker logs baaa-hub-frontend
```

### API Errors

```bash
# Check backend logs
docker logs baaa-hub-backend

# Test health endpoint
curl http://localhost:8080/health

# Test API directly
docker exec baaa-hub-nginx wget -O- http://backend:3000/health
```

### MongoDB Connection Issues

```bash
docker logs baaa-hub-mongodb
docker exec baaa-hub-backend ping mongodb
```

### Port Already in Use

Change the port in `.env`:

```bash
APP_PORT=9090
```

## Security Notes

1. **Change default credentials** in production:
   - MinIO: `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`
   - Generate with: `openssl rand -base64 32`

2. **Never commit `.env` files** with real credentials

3. **Use HTTPS in production** via Nginx Proxy Manager

4. **Firewall rules**:
   - Expose only ports 80/443 (via NPM)
   - Block direct access to port 8080

## CI/CD Workflow

The Docker build workflow (`.github/workflows/docker-build-push.yml`):

1. Triggers on push/PR to master
2. Builds frontend with VITE\_\* secrets as build-args
3. Builds backend
4. Pushes to GHCR on merge to master
5. Tags: `latest` and commit SHA

### Manual Image Build (Development)

```bash
# From repository root
docker build -f deployment/Dockerfile.frontend \
  --build-arg VITE_KEYCLOAK_URL=... \
  --build-arg VITE_KEYCLOAK_REALM=... \
  --build-arg VITE_KEYCLOAK_CLIENT_ID=... \
  --build-arg VITE_API_URL=... \
  -t baaa-hub-frontend .

docker build -f deployment/Dockerfile.backend \
  -t baaa-hub-backend .
```

## File Structure

```
deployment/
├── docker-compose.yml     # Production compose with GHCR images
├── .env.example           # Environment template
├── nginx-proxy.conf       # Nginx reverse proxy config
├── nginx-frontend.conf    # Frontend nginx config
├── Dockerfile.frontend    # Frontend build (used by CI)
└── Dockerfile.backend     # Backend build (used by CI)
```

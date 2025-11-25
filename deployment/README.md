# Production Deployment

This folder contains everything you need to deploy the Activity Tracker
application to production.

## 📁 What's in this folder?

- **docker-compose.yml** - Production container orchestration
- **Dockerfile** - Multi-stage build for the application
- **nginx.conf** - Nginx reverse proxy configuration
- **docker-entrypoint.sh** - Container startup script
- **.env.example** - Environment variables template
- **deploy.sh** - Automated deployment script
- **README.md** - This file

## 🚀 Quick Start

### First-time Deployment

1. **Configure environment variables:**

   ```bash
   cd deployment
   cp .env.example .env
   # Edit .env with your configuration (Auth0, domains, etc.)
   ```

2. **Deploy:**

   ```bash
   ./deploy.sh build
   ./deploy.sh start
   ```

3. **Access your application:**
   - Application: http://localhost:8080
   - Health Check: http://localhost:8080/health
   - API Docs: http://localhost:8080/api/docs

That's it! 🎉

## 🔧 Deployment Commands

The `deploy.sh` script provides simple commands for managing your deployment:

```bash
# Build Docker images
./deploy.sh build

# Start the application
./deploy.sh start

# Stop the application
./deploy.sh stop

# Restart the application
./deploy.sh restart

# View logs (live)
./deploy.sh logs

# Check status and health
./deploy.sh status

# Update to latest version (pull, rebuild, restart)
./deploy.sh update

# Clean up containers and images (keeps data)
./deploy.sh clean
```

### Common Workflows

**First deployment:**

```bash
./deploy.sh build && ./deploy.sh start
```

**Update to latest version:**

```bash
./deploy.sh update
```

**Check if everything is working:**

```bash
./deploy.sh status
```

**View live logs:**

```bash
./deploy.sh logs
```

## ⚙️ Configuration

### Environment Variables

All configuration is done through a **single `.env` file** in this folder.

#### Required Variables

```bash
# Auth0 Configuration
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your_client_id
VITE_AUTH0_REDIRECT_URI=http://localhost:8080/callback
VITE_AUTH0_AUDIENCE=your_audience

# Application URL
VITE_API_BASE_URL=http://localhost:8080
CORS_ORIGIN=http://localhost:8080
```

#### Production Deployment

For production deployment, update URLs to use your domain:

```bash
VITE_AUTH0_REDIRECT_URI=https://your-domain.com/callback
VITE_API_BASE_URL=https://your-domain.com
CORS_ORIGIN=https://your-domain.com
```

#### External MongoDB (Optional)

By default, MongoDB runs in a container. To use an external MongoDB (e.g.,
MongoDB Atlas):

```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/baaa-hub
```

Then remove the `mongodb` service from `docker-compose.yml`.

## 🏗️ Architecture

The application is now deployed as **4 separate Docker containers** for better
debugging, scaling, and deployment:

```
         ┌─────────────────────────────────────────┐
         │  Nginx Reverse Proxy (Port 8080)        │
         │  - Routes traffic to frontend/backend   │
         │  - Handles /api/* and /health routes    │
         └─────────────┬───────────────────────────┘
                       │
         ┌─────────────┴─────────────┐
         ▼                           ▼
┌─────────────────┐       ┌──────────────────────┐
│  Frontend       │       │  Backend API         │
│  Container      │       │  Container           │
│  - Nginx        │       │  - Node.js/Koa       │
│  - Static files │       │  - REST API          │
│  - Port 80      │       │  - Port 3000         │
└─────────────────┘       └──────────┬───────────┘
                                     │
                                     ▼
                          ┌──────────────────────┐
                          │  MongoDB Container   │
                          │  - Database          │
                          │  - Port 27017        │
                          └──────────────────────┘
```

### Container Details:

- **nginx-prod**: Reverse proxy that routes HTTP traffic (exposed on port 8080)
- **frontend-prod**: Nginx serving static React frontend files (internal)
- **backend-prod**: Node.js API server with Koa.js (internal)
- **mongodb-prod**: MongoDB database (internal)

All containers communicate through a private Docker network (`app-network`) and
only the nginx reverse proxy is exposed to the host.

## 📊 Container Names

Containers use short, simple names:

- `nginx-prod` - Nginx reverse proxy (main entry point)
- `frontend-prod` - Frontend static files served by nginx
- `backend-prod` - Backend API server
- `mongodb-prod` - MongoDB database

## 🔍 Troubleshooting

### Check if containers are running

```bash
./deploy.sh status
```

or

```bash
docker compose ps
```

### View logs

```bash
./deploy.sh logs
```

or

```bash
docker compose logs -f nginx     # Nginx reverse proxy logs
docker compose logs -f frontend  # Frontend logs
docker compose logs -f backend   # Backend API logs
docker compose logs -f mongodb   # MongoDB logs
```

### Health check

```bash
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

### Port already in use

If port 8080 is in use, edit `docker-compose.yml`:

```yaml
services:
  app:
    ports:
      - '9090:8080' # Change to different port
```

### Rebuild after configuration changes

Frontend environment variables are built into the image. After changing them:

```bash
./deploy.sh build
./deploy.sh restart
```

or

```bash
docker compose build --no-cache
docker compose up -d
```

## 🔄 Updates and Maintenance

### Update to latest version

```bash
./deploy.sh update
```

This will:

1. Pull latest code from git (if applicable)
2. Rebuild Docker images
3. Restart containers

### Manual update process

```bash
git pull                          # Get latest code
docker compose build --no-cache   # Rebuild images
docker compose down               # Stop containers
docker compose up -d              # Start with new images
```

### Backup database

```bash
# Backup
docker compose exec mongodb mongodump --out=/data/backup

# Copy backup to host
docker cp mongodb-prod:/data/backup ./mongodb-backup

# Restore
docker cp ./mongodb-backup mongodb-prod:/data/backup
docker compose exec mongodb mongorestore /data/backup
```

## 🔐 Security Notes

1. **Never commit `.env` files** - They contain secrets
2. **Use HTTPS in production** - Configure your reverse proxy (nginx, Traefik,
   etc.)
3. **Update MongoDB credentials** - Use authentication in production
4. **Keep images updated** - Regularly rebuild with latest dependencies

## 📝 Advanced Usage

### Using with Nginx Proxy Manager (NPM)

For production deployments with SSL/HTTPS, we recommend using **Nginx Proxy
Manager** (NPM).

The application listens on port 8080 and can be easily configured with NPM:

**See the comprehensive guide:** [NPM_SETUP_GUIDE.md](./NPM_SETUP_GUIDE.md)

Quick summary:

1. Ensure both NPM and Activity Tracker are in the same Docker network
2. Create a proxy host in NPM pointing to `nginx-prod:8080`
3. Enable SSL with Let's Encrypt
4. Update your `.env` file with the production domain
5. Rebuild the application

For detailed step-by-step instructions, troubleshooting, and security best
practices, see the [NPM Setup Guide](./NPM_SETUP_GUIDE.md).

### Custom network configuration

To use a custom Docker network:

```yaml
networks:
  app-network:
    external: true
    name: your-network-name
```

### Resource limits

Add resource limits to `docker-compose.yml`:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.25'
          memory: 256M

  frontend:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 256M
        reservations:
          cpus: '0.1'
          memory: 64M
```

## 🔄 Migration from Old Structure

If you were using the old deployment structure (files in root directory), here's
how to migrate:

### Quick Migration

1. **Backup your current `.env.production` file:**

   ```bash
   cp .env.production .env.production.backup
   ```

2. **Create new `.env` file in deployment folder:**

   ```bash
   cd deployment
   cp .env.example .env
   # Copy values from your old .env.production.backup to the new .env
   ```

3. **Stop old containers:**

   ```bash
   cd ..
   docker compose -f docker-compose.prod.yml down
   ```

4. **Start with new structure:**
   ```bash
   cd deployment
   ./deploy.sh build
   ./deploy.sh start
   ```

### What Changed

| Old Structure                         | New Structure                                                                        |
| ------------------------------------- | ------------------------------------------------------------------------------------ |
| `.env.production` (root)              | `deployment/.env`                                                                    |
| `docker-compose.prod.yml`             | `deployment/docker-compose.yml`                                                      |
| `Dockerfile` (root, single container) | Separate Dockerfiles for each service                                                |
| Container: `baaa-hub-app-prod`        | 4 separate containers: `nginx-prod`, `frontend-prod`, `backend-prod`, `mongodb-prod` |
| Container: `baaa-hub-mongodb-prod`    | Container: `mongodb-prod`                                                            |
| Network: `baaa-hub-network`           | Network: `app-network`                                                               |
| Manual docker commands                | `./deploy.sh` script                                                                 |

### Benefits of New Structure

- ✅ **Single `.env` file** - No more confusion about which env file to use
- ✅ **Organized** - All deployment files in one folder
- ✅ **Simpler** - Shorter container and network names
- ✅ **Automated** - deploy.sh script handles everything
- ✅ **Clear** - Separation between local dev and production
- ✅ **Separated Containers** - Better debugging, scaling, and deployment
  - Individual container logs and monitoring
  - Independent scaling of frontend/backend
  - Easier troubleshooting and maintenance
  - No environment file permission issues

### Backward Compatibility

The old files are still present and marked as deprecated. They will continue to
work, but we recommend migrating to the new structure for:

- Better organization
- Easier deployment management
- Simplified configuration

## 🆘 Support

For more detailed documentation, see:

- [Main README](../README.md)
- [Docker Deployment Guide](../docs/DOCKER_DEPLOYMENT.md)

For issues or questions, open an issue on GitHub.

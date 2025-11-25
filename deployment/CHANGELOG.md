# Deployment Changelog

## Version 2.0.0 - Multi-Container Architecture (2025-11-21)

### Major Changes

#### 🏗️ Architecture Refactor: Separated Docker Containers

The application deployment has been completely restructured from a monolithic
single-container approach to a **4-container microservices architecture**:

**Previous Architecture:**

- Single `app-prod` container running:
  - Nginx (reverse proxy + static files)
  - Backend API (Node.js)
  - Both services in one container

**New Architecture:**

- `nginx-prod` - Dedicated reverse proxy (port 8080 exposed)
- `frontend-prod` - Nginx serving static frontend files (internal)
- `backend-prod` - Node.js API server (internal)
- `mongodb-prod` - MongoDB database (internal, unchanged)

### Benefits

✅ **Better Debugging**: Individual container logs and monitoring  
✅ **Independent Scaling**: Scale frontend and backend separately  
✅ **Easier Maintenance**: Update/restart services independently  
✅ **Improved Security**: Better isolation between services  
✅ **No Permission Issues**: Environment files created inside containers at
runtime

### New Files

- `deployment/Dockerfile.frontend` - Frontend build and nginx serve
- `deployment/Dockerfile.backend` - Backend build and runtime
- `deployment/nginx-frontend.conf` - Frontend nginx configuration
- `deployment/nginx-proxy.conf` - Reverse proxy configuration
- `deployment/NPM_SETUP_GUIDE.md` - Complete Nginx Proxy Manager setup guide

### Modified Files

- `deployment/docker-compose.yml` - Complete rewrite for multi-container
  architecture
- `deployment/README.md` - Updated documentation with new architecture
- `deployment/.env.example` - Updated with NPM deployment instructions

### Breaking Changes

⚠️ **Container Names Changed:**

- `app-prod` → Split into: `nginx-prod`, `frontend-prod`, `backend-prod`

⚠️ **Docker Compose Configuration:**

- Must rebuild all containers: `./deploy.sh build`
- Old containers will be orphaned and can be removed manually

### Migration Guide

For existing deployments:

```bash
# 1. Stop old containers
docker compose down

# 2. Remove old containers (optional)
docker rm app-prod

# 3. Pull latest changes
git pull

# 4. Update your .env file (no changes needed, same variables)
cd deployment

# 5. Build new containers
./deploy.sh build

# 6. Start new multi-container setup
./deploy.sh start

# 7. Verify all containers are running
./deploy.sh status
```

### Environment Variables

No changes to environment variable names or usage. All existing `.env` files are
compatible.

### Fixed Issues

✅ **Environment File Permission Errors**:

- Environment files are now created inside containers at build/runtime
- Proper ownership and permissions set in Dockerfiles
- No more "permission denied" errors when accessing env files

✅ **Backend Build Issues**:

- Backend is built in a dedicated build stage
- Dependencies properly installed in production stage
- Build artifacts correctly copied between stages

✅ **Missing Backend Dependencies**:

- Production dependencies installed separately from dev dependencies
- All required packages included in final image
- Proper workspace configuration for monorepo

### New Features

#### 🔒 Nginx Proxy Manager (NPM) Support

Complete guide for production HTTPS deployment with NPM:

- SSL/TLS termination setup
- Domain configuration (e.g., https://dev1.pette.dev)
- Docker network integration
- Auth0 callback configuration
- Troubleshooting guide

See: `deployment/NPM_SETUP_GUIDE.md`

#### 📊 Individual Container Health Checks

Each service now has its own health check:

- `backend-prod`: Checks `/health` endpoint
- `frontend-prod`: Checks root `/` endpoint
- `nginx-prod`: Checks proxied `/health` endpoint
- `mongodb-prod`: Checks database ping

#### 🔄 Service Dependencies

Proper startup ordering:

1. MongoDB starts first
2. Backend waits for MongoDB health check
3. Frontend builds independently
4. Nginx waits for both backend and frontend health checks

### Technical Details

#### Container Communication

All containers communicate through the `app-network` Docker bridge network:

- Internal DNS resolution by container name
- No ports exposed except nginx reverse proxy (8080)
- Improved security through network isolation

#### Build Optimization

- Multi-stage Docker builds for smaller images
- Separate builder and runtime stages
- Production-only dependencies in final images
- Shared base images reduce build time

### Testing

Verified functionality:

- ✅ Docker Compose syntax validation
- ✅ Environment variable substitution
- ✅ Service dependencies configuration
- ✅ Network configuration
- ✅ Health check definitions

### Documentation

Updated/Added documentation:

- ✅ Deployment README with new architecture diagram
- ✅ NPM setup guide with step-by-step instructions
- ✅ Environment file examples with NPM configuration
- ✅ Troubleshooting section updated
- ✅ Migration guide from old structure

### Known Limitations

- Build requires network access for package installation
- Initial build may take 5-10 minutes depending on network speed
- Requires Docker Compose v2.0+

### Next Steps

Recommended actions after deploying:

1. **Monitor Logs**: `./deploy.sh logs`
2. **Check Health**: `./deploy.sh status`
3. **Configure NPM**: Follow `NPM_SETUP_GUIDE.md` for production
4. **Set Up Monitoring**: Consider adding Prometheus/Grafana
5. **Configure Backups**: Regular MongoDB backups recommended

### Support

For issues or questions:

- Review logs: `docker compose logs [service-name]`
- Check health: `curl http://localhost:8080/health`
- Verify network: `docker network inspect app-network`
- See: `deployment/README.md` and `deployment/NPM_SETUP_GUIDE.md`

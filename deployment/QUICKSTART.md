# Quick Start Guide - Separated Docker Containers

This guide provides a quick reference for deploying the application with the new
separated container architecture.

## 🚀 Quick Deploy (Local Testing)

```bash
# 1. Navigate to deployment folder
cd deployment

# 2. Create environment file
cp .env.example .env
# Edit .env with your Auth0 credentials

# 3. Build containers
./deploy.sh build

# 4. Start all containers
./deploy.sh start

# 5. Check status
./deploy.sh status

# Access: http://localhost:8080
```

## 📦 Container Architecture

```
nginx-prod (port 8080) ──┬──> frontend-prod (nginx:alpine)
                         └──> backend-prod (node:20-alpine) ──> mongodb-prod
```

## 🔍 Common Commands

```bash
# View all logs
./deploy.sh logs

# View specific container logs
docker logs -f frontend-prod
docker logs -f backend-prod
docker logs -f nginx-prod
docker logs -f mongodb-prod

# Restart containers
./deploy.sh restart

# Stop containers
./deploy.sh stop

# Check health
curl http://localhost:8080/health
```

## 🌐 Production Deployment with NPM

For HTTPS production deployment (e.g., https://dev1.pette.dev):

### 1. Configure Environment

```bash
# Edit deployment/.env
VITE_AUTH0_REDIRECT_URI=https://dev1.pette.dev/callback
VITE_API_BASE_URL=https://dev1.pette.dev
CORS_ORIGIN=https://dev1.pette.dev
```

### 2. Set Up Network

```bash
# Create shared network
docker network create npm-network

# Update deployment/docker-compose.yml
networks:
  app-network:
    external: true
    name: npm-network
```

### 3. Configure NPM

In Nginx Proxy Manager:

- **Domain**: dev1.pette.dev
- **Forward Host**: nginx-prod
- **Forward Port**: 8080
- **Enable SSL**: Yes (Let's Encrypt)
- **Force SSL**: Yes
- **Websockets**: Yes

### 4. Deploy

```bash
./deploy.sh build
./deploy.sh start
```

**Complete guide**: See `NPM_SETUP_GUIDE.md`

## 🛠️ Troubleshooting

### Containers won't start

```bash
# Check logs
docker compose logs

# Rebuild without cache
docker compose build --no-cache
```

### Can't access application

```bash
# Check if all containers are running
docker compose ps

# Check nginx is forwarding correctly
docker exec -it nginx-prod wget -O- http://frontend
docker exec -it nginx-prod wget -O- http://backend:3000/health
```

### Backend can't connect to MongoDB

```bash
# Check MongoDB is healthy
docker inspect mongodb-prod | grep Health

# Check network connectivity
docker exec -it backend-prod ping mongodb
```

### Permission errors with env files

**Fixed in v2.0**: Environment files are now created inside containers with
proper permissions. No manual intervention needed.

## 📊 Container Details

| Container     | Purpose       | Internal Port | Exposed Port |
| ------------- | ------------- | ------------- | ------------ |
| nginx-prod    | Reverse proxy | 8080          | 8080         |
| frontend-prod | Static files  | 80            | -            |
| backend-prod  | API server    | 3000          | -            |
| mongodb-prod  | Database      | 27017         | -            |

## 🔒 Security Notes

- Only nginx-prod is exposed to the host
- All inter-container communication is internal
- No direct access to backend or database from host
- Environment variables are managed inside containers

## 📚 Additional Resources

- **Full Documentation**: `README.md`
- **NPM Setup**: `NPM_SETUP_GUIDE.md`
- **Changes**: `CHANGELOG.md`
- **Environment Variables**: `.env.example`

## 💡 Tips

1. **Use the deploy script**: `./deploy.sh` handles all common operations
2. **Check health regularly**: `./deploy.sh status`
3. **Monitor logs**: `./deploy.sh logs` for real-time monitoring
4. **Backup MongoDB**: Regular backups of `mongodb_data` volume
5. **Update regularly**: `./deploy.sh update` pulls and rebuilds

## 🆘 Getting Help

If you encounter issues:

1. Check logs: `docker compose logs [service-name]`
2. Verify network: `docker network inspect app-network`
3. Test health: `curl http://localhost:8080/health`
4. Review documentation in `deployment/README.md`
5. Check NPM setup: `deployment/NPM_SETUP_GUIDE.md`

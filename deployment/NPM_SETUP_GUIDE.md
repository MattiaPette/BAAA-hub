# Nginx Proxy Manager (NPM) Setup Guide

This guide explains how to configure **Nginx Proxy Manager** (NPM) to handle
SSL/HTTPS and route traffic to the BAAA-Hub application deployed at
`https://dev1.pette.dev`.

## Prerequisites

- Docker and Docker Compose installed on your server
- Nginx Proxy Manager installed and running
- Domain name configured (dev1.pette.dev) pointing to your server's IP
- BAAA-Hub containers running on the same Docker host

## Architecture Overview

```
Internet (HTTPS)
        ↓
Nginx Proxy Manager (Port 443) → SSL Termination
        ↓
BAAA-Hub Nginx Container (Port 8080) → HTTP
        ↓
    ┌───────────────┴────────────────┐
    ↓                                ↓
Frontend Container              Backend Container
    ↓                                ↓
    └────────────────┬───────────────┘
                     ↓
              MongoDB Container
```

## Step 1: Ensure Both Applications are in the Same Network

### Option A: Using External Docker Network (Recommended)

1. **Create a shared Docker network:**

```bash
docker network create npm-network
```

2. **Update NPM's docker-compose.yml** to use the network:

```yaml
# In your NPM docker-compose.yml
services:
  npm:
    # ... other configuration ...
    networks:
      - npm-network

networks:
  npm-network:
    external: true
```

3. **Update BAAA-Hub's docker-compose.yml** to use the same network:

```yaml
# In deployment/docker-compose.yml
networks:
  app-network:
    external: true
    name: npm-network
```

4. **Restart both applications:**

```bash
# Restart NPM
cd /path/to/npm
docker compose down
docker compose up -d

# Restart BAAA-Hub
cd /path/to/baaa-hub/deployment
./deploy.sh stop
./deploy.sh start
```

### Option B: Connect to Existing Network

If NPM is already running with its own network:

1. **Find NPM's network name:**

```bash
docker network ls
# Look for something like: npm_default or nginxproxymanager_default
```

2. **Update BAAA-Hub's docker-compose.yml:**

```yaml
# In deployment/docker-compose.yml
networks:
  app-network:
    external: true
    name: npm_default # Replace with your NPM network name
```

3. **Restart BAAA-Hub:**

```bash
cd /path/to/BAAA-hub/deployment
./deploy.sh stop
./deploy.sh start
```

## Step 2: Configure Nginx Proxy Manager

### Access NPM Admin Panel

1. Open NPM in your browser (typically at http://your-server-ip:81)
2. Login with your admin credentials
3. Navigate to **Proxy Hosts**

### Create a New Proxy Host

1. Click **Add Proxy Host**

2. **Fill in the Details tab:**
   - **Domain Names:** `dev1.pette.dev`
   - **Scheme:** `http`
   - **Forward Hostname / IP:** `nginx-prod` (the container name)
   - **Forward Port:** `8080`
   - **Cache Assets:** ✓ (checked)
   - **Block Common Exploits:** ✓ (checked)
   - **Websockets Support:** ✓ (checked - important for the app)

3. **Configure the SSL tab:**
   - **SSL Certificate:** Select "Request a new SSL Certificate"
   - **Force SSL:** ✓ (checked)
   - **HTTP/2 Support:** ✓ (checked)
   - **HSTS Enabled:** ✓ (checked)
   - **HSTS Subdomains:** ✓ (optional)
   - **Email Address for Let's Encrypt:** your-email@example.com
   - **I Agree to the Let's Encrypt Terms of Service:** ✓ (checked)

4. **Add Custom Locations (Optional but Recommended):**

   Click on the **Custom Locations** tab and add:

   **Location 1: API**
   - **Define Location:** `/api/`
   - **Scheme:** `http`
   - **Forward Hostname / IP:** `nginx-prod`
   - **Forward Port:** `8080`

   **Location 2: Health Check**
   - **Define Location:** `/health`
   - **Scheme:** `http`
   - **Forward Hostname / IP:** `nginx-prod`
   - **Forward Port:** `8080`

5. **Click Save**

## Step 3: Update BAAA-Hub Configuration

Update your `.env` file in the `deployment/` directory with the production
domain:

```bash
# In deployment/.env

# Frontend Build-time Variables
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your_auth0_client_id
VITE_AUTH0_REDIRECT_URI=https://dev1.pette.dev/callback
VITE_AUTH0_AUDIENCE=your_auth0_audience
VITE_API_BASE_URL=https://dev1.pette.dev

# Backend Runtime Variables
CORS_ORIGIN=https://dev1.pette.dev
DEBUG=false
```

**Important:** Changes to `VITE_*` variables require rebuilding the frontend:

```bash
cd deployment
./deploy.sh build
./deploy.sh restart
```

## Step 4: Update Auth0 Configuration

In your Auth0 dashboard:

1. Go to **Applications** → Select your application
2. Update **Allowed Callback URLs:**
   ```
   https://dev1.pette.dev/callback
   ```
3. Update **Allowed Logout URLs:**
   ```
   https://dev1.pette.dev
   ```
4. Update **Allowed Web Origins:**
   ```
   https://dev1.pette.dev
   ```
5. Click **Save Changes**

## Step 5: Verify the Setup

1. **Check DNS Resolution:**

   ```bash
   nslookup dev1.pette.dev
   # Should return your server's IP
   ```

2. **Check Container Status:**

   ```bash
   cd deployment
   ./deploy.sh status
   ```

3. **Test HTTPS Access:**
   - Open https://dev1.pette.dev in your browser
   - Verify SSL certificate is valid (green padlock)
   - Check that the application loads correctly

4. **Test API Endpoint:**
   ```bash
   curl https://dev1.pette.dev/health
   # Should return: {"status":"ok",...}
   ```

## Troubleshooting

### Issue: 502 Bad Gateway

**Cause:** NPM cannot reach the BAAA-Hub nginx container.

**Solutions:**

1. Verify containers are in the same network:

   ```bash
   docker network inspect npm-network
   # Should show both NPM and BAAA-Hub containers
   ```

2. Check if containers can communicate:

   ```bash
   docker exec -it npm-container ping nginx-prod
   ```

3. Verify the BAAA-Hub nginx is running:
   ```bash
   docker ps | grep nginx-prod
   ```

### Issue: SSL Certificate Not Generating

**Solutions:**

1. Ensure port 80 is accessible from the internet (Let's Encrypt needs it)
2. Verify DNS is correctly pointing to your server
3. Check NPM logs:
   ```bash
   docker logs npm-container
   ```

### Issue: Frontend Loads but API Requests Fail (CORS)

**Cause:** CORS configuration doesn't match the domain.

**Solution:**

1. Update `CORS_ORIGIN` in `.env`:

   ```bash
   CORS_ORIGIN=https://dev1.pette.dev
   ```

2. Restart backend:
   ```bash
   ./deploy.sh restart
   ```

### Issue: Authentication Redirect Fails

**Cause:** Auth0 callback URL not configured correctly.

**Solution:**

1. Rebuild with correct `VITE_AUTH0_REDIRECT_URI`:

   ```bash
   # Update .env file
   VITE_AUTH0_REDIRECT_URI=https://dev1.pette.dev/callback

   # Rebuild
   ./deploy.sh build
   ./deploy.sh restart
   ```

2. Verify Auth0 settings match

### Issue: Can't Access Container by Name

**Cause:** Containers not in the same network.

**Solution:** Use Docker network inspection to debug:

```bash
# List all networks
docker network ls

# Inspect a network
docker network inspect npm-network

# Connect a container to a network manually
docker network connect npm-network nginx-prod
```

## Advanced Configuration

### Custom Nginx Headers in NPM

To add custom headers in NPM, go to the proxy host's **Advanced** tab and add:

```nginx
# Security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

# Proxy headers for proper client IP forwarding
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
proxy_set_header X-Forwarded-Host $host;
```

### Using a Custom Network Name

If you want to use a custom network name:

```bash
# Create network
docker network create --driver bridge baaa-hub-network

# Update both docker-compose.yml files to use this network
# Then restart both applications
```

### Monitoring and Logs

View logs for debugging:

```bash
# NPM logs
docker logs -f npm-container

# BAAA-Hub logs
cd deployment
./deploy.sh logs

# Individual service logs
docker logs -f nginx-prod
docker logs -f backend-prod
docker logs -f frontend-prod
docker logs -f mongodb-prod
```

## Security Best Practices

1. **Use Strong SSL Configuration:**
   - Enable HTTP/2
   - Enable HSTS
   - Force SSL redirect

2. **Regular Updates:**

   ```bash
   # Update NPM
   docker compose pull
   docker compose up -d

   # Update BAAA-Hub
   cd deployment
   ./deploy.sh update
   ```

3. **Firewall Configuration:**
   - Only expose ports 80 (HTTP) and 443 (HTTPS) to the internet
   - Block direct access to port 8080
   - Keep MongoDB port 27017 internal only

4. **Use Secrets for Sensitive Data:**
   - Never commit `.env` files
   - Use Docker secrets or environment variable management tools

## Additional Resources

- [Nginx Proxy Manager Documentation](https://nginxproxymanager.com/guide/)
- [Docker Networking Guide](https://docs.docker.com/network/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)

## Support

If you encounter issues not covered in this guide:

1. Check container logs: `./deploy.sh logs`
2. Verify network connectivity: `docker network inspect npm-network`
3. Test health endpoints: `curl http://localhost:8080/health`
4. Review NPM access logs in the NPM admin panel

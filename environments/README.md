# Environment Configuration

This directory contains environment variable configuration files for the BAAA
Hub application.

## Structure

- **`.env.example`**: Template file with all available environment variables and
  their descriptions. This file is committed to git and serves as documentation.
- **`.env.dev`**: Development environment configuration (not committed to git)
- **`.env.prod`**: Production environment configuration (not committed to git)
- **`.env.test`**: Test environment configuration (not committed to git)

## Quick Start

1. **Copy the example file** to create your development environment
   configuration:

   ```bash
   cp environments/.env.example environments/.env.dev
   ```

2. **Edit the new file** with your specific configuration:

   ```bash
   # Use your preferred editor
   nano environments/.env.dev
   # or
   vim environments/.env.dev
   # or
   code environments/.env.dev
   ```

3. **Update the values** according to your environment:
   - Replace `your-tenant.auth0.com` with your Auth0 domain
   - Replace `your-client-id` with your Auth0 client ID
   - Adjust ports if needed
   - Configure MongoDB URI if using a remote database

## Environment Selection

The application uses the `ENV` environment variable to determine which
configuration file to load:

- `ENV=dev` → loads `.env.dev` (default)
- `ENV=prod` → loads `.env.prod`
- `ENV=test` → loads `.env.test`

You can set this when running commands:

```bash
# Development (default)
pnpm dev

# Production
ENV=prod pnpm be:start

# Testing
ENV=test pnpm test
```

## How It Works

### Frontend (Vite)

The frontend configuration is handled by Vite. The `vite.config.ts` file is
configured to load environment variables from this directory:

```typescript
export default defineConfig({
  envDir: '../../environments',
  // ...
});
```

Vite automatically loads variables prefixed with `VITE_` and makes them
available via `import.meta.env`.

### Backend (Node.js)

The backend configuration is handled by dotenv. The
`apps/Server.API/src/config/index.ts` file loads the appropriate environment
file:

```typescript
dotenv.config({
  path: `../../environments/.env.${process.env.ENV || 'dev'}`,
});
```

## Available Variables

### Frontend Variables (VITE\_ prefix required)

| Variable                        | Description                    | Default                            |
| ------------------------------- | ------------------------------ | ---------------------------------- |
| `VITE_API_URL`                  | Backend API base URL           | `http://localhost:3000`            |
| `VITE_AUTH_DOMAIN`              | Auth0 domain                   | -                                  |
| `VITE_AUTH_CLIENT_ID`           | Auth0 client ID                | -                                  |
| `VITE_AUTH_DATABASE_CONNECTION` | Auth0 database connection name | `Username-Password-Authentication` |
| `VITE_AUTH_REDIRECT_URI`        | OAuth callback URI             | `http://localhost:4000/callback`   |

### Backend Variables

| Variable       | Description               | Default                              |
| -------------- | ------------------------- | ------------------------------------ |
| `BACKEND_PORT` | Server port               | `3000`                               |
| `NODE_ENV`     | Node environment          | `development`                        |
| `MONGODB_URI`  | MongoDB connection string | `mongodb://localhost:27017/baaa-hub` |
| `CORS_ORIGIN`  | Allowed CORS origin       | `http://localhost:4000`              |
| `DEBUG`        | Enable debug mode         | `true`                               |

### System Variables

| Variable | Description          | Default |
| -------- | -------------------- | ------- |
| `ENV`    | Environment selector | `dev`   |

## Security Notes

⚠️ **IMPORTANT**:

- Never commit actual `.env.*` files (except `.env.example`) to version control
- The `.gitignore` file is configured to exclude all `.env.*` files except
  `.env.example`
- Keep your Auth0 credentials and other sensitive information secure
- Use different credentials for development, testing, and production
  environments

## Troubleshooting

### Environment variables not loading

1. **Check file name**: Ensure the file is named correctly (e.g., `.env.dev`,
   not `env.dev`)
2. **Check location**: The file should be in the `environments/` directory at
   the repository root
3. **Check ENV variable**: Verify the `ENV` environment variable matches your
   file name
4. **Frontend variables**: Make sure frontend variables start with `VITE_`
5. **Restart dev server**: After changing environment variables, restart the
   development server

### Variables not available in frontend

Frontend variables must:

- Be prefixed with `VITE_`
- Be defined before the build/dev process starts
- Use `import.meta.env.VARIABLE_NAME` to access them (not `process.env`)

### Variables not available in backend

Backend variables:

- Do NOT need a prefix
- Can be accessed via `process.env.VARIABLE_NAME`
- Are loaded by dotenv in `apps/Server.API/src/config/index.ts`

## Production Deployment

For production deployments:

1. Create a `.env.prod` file with production values
2. Set `ENV=prod` in your deployment environment
3. Ensure sensitive values are stored securely (e.g., using secrets management)
4. Consider using environment-specific configuration management tools

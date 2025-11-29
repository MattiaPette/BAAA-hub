# Auth0 Deploy CLI Configuration

This directory contains Auth0 configuration files managed via the Auth0 Deploy
CLI. Configuration is managed as Infrastructure as Code (IaC) to ensure:

- All Auth0 settings are tracked in version control
- Changes can be reviewed and tested before deployment
- Configuration can be easily reproduced across environments

## Directory Structure

```
auth0/
├── README.md              # This file
├── tenant.yaml            # Main configuration file
└── actions/
    └── sync-user-to-db.js # Post-Login Action for MFA/email sync
```

## Prerequisites

1. Install the Auth0 Deploy CLI:

   ```bash
   npm install -g auth0-deploy-cli
   ```

2. Set up Auth0 Machine-to-Machine (M2M) application:
   - Go to Auth0 Dashboard > Applications > Create Application
   - Choose "Machine to Machine Applications"
   - Authorize the application for the Auth0 Management API
   - Grant the following scopes:
     - `read:actions`
     - `update:actions`
     - `delete:actions`
     - `create:actions`
     - `read:triggers`
     - `update:triggers`

3. Configure environment variables:
   - macOS/Linux (bash):

     ```bash
     export AUTH0_DOMAIN="your-tenant.auth0.com"
     export AUTH0_CLIENT_ID="m2m-client-id"
     export AUTH0_CLIENT_SECRET="m2m-client-secret"
     ```

   - Windows (PowerShell) using `.env` in `environments/.env.auth0`:

     ```powershell
     pnpm auth0:import
     # or
     pnpm auth0:export
     # or
     pnpm auth0:dry-run
     ```

     Alternatively, run the helper script:

     ```powershell
     powershell -ExecutionPolicy Bypass -File scripts/auth0-deploy.ps1 -Action import
     ```

## Usage

### Export Current Configuration

To export current Auth0 configuration (useful for initial setup):

```bash
a0deploy export --format yaml --output_folder ./auth0
```

### Import Configuration

To deploy configuration to Auth0:

```bash
a0deploy import --input_file ./auth0/tenant.yaml
```

### Dry Run

To preview changes without applying them:

```bash
a0deploy import --input_file ./auth0/tenant.yaml --dry-run
```

## Configuration Details

### Post-Login Action: sync-user-to-db

This action runs after every successful login and:

- Captures the user's MFA enrollment status
- Captures the user's email verification status
- Sends this data to the backend webhook endpoint
- Updates the local database for admin visibility

#### Secrets Required

The action requires these secrets (configured in Auth0 Dashboard):

- `API_URL`: Backend webhook URL (e.g.,
  `https://api.your-app.com/api/webhooks/auth0/user-update`)
- `API_SECRET`: Webhook secret matching `AUTH0_WEBHOOK_SECRET` in backend config

## Security Considerations

- Never commit actual secrets to this repository
- Use environment variables for sensitive configuration
- The webhook secret should be a strong, random value
- Rotate secrets periodically

## References

- [Auth0 Deploy CLI Documentation](https://auth0.com/docs/deploy-monitor/deploy-cli-tool)
- [Auth0 Deploy CLI GitHub](https://github.com/auth0/auth0-deploy-cli)
- [Auth0 Post-Login Actions](https://auth0.com/docs/customize/actions/flows-and-triggers/login-flow)
- [Auth0 Management API Rate Limits](https://auth0.com/docs/monitor-authentication/manage-rate-limits)

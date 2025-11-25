# Security

This document outlines security practices, vulnerability reporting, and security
considerations for the BAAA Hub project.

## Table of Contents

- [Reporting Security Vulnerabilities](#reporting-security-vulnerabilities)
- [Security Practices](#security-practices)
- [Authentication and Authorization](#authentication-and-authorization)
- [Data Protection](#data-protection)
- [Dependency Management](#dependency-management)
- [Environment Variables](#environment-variables)
- [Security Headers](#security-headers)

## Reporting Security Vulnerabilities

If you discover a security vulnerability in BAAA Hub, please report it
responsibly:

1. **Do not** create a public GitHub issue for security vulnerabilities
2. Send a private report to the maintainers via email
3. Include a detailed description of the vulnerability
4. Provide steps to reproduce the issue if possible
5. Allow reasonable time for the issue to be addressed before public disclosure

We appreciate your help in keeping BAAA Hub secure!

## Security Practices

### Code Review

- All code changes require review before merging
- Security-sensitive changes require additional scrutiny
- Automated checks run on all pull requests

### Testing

- Security-related functionality is covered by tests
- Dependencies are regularly scanned for vulnerabilities
- Static code analysis is performed during CI/CD

## Authentication and Authorization

BAAA Hub uses Auth0 for authentication:

- **OAuth 2.0 / OpenID Connect** - Industry-standard authentication protocols
- **JWT Tokens** - Secure token-based authentication
- **HTTPS Only** - All authentication traffic is encrypted
- **Token Expiration** - Access tokens have limited lifetimes
- **Refresh Tokens** - Secure token refresh mechanism

### Best Practices

- Never store authentication tokens in localStorage for sensitive applications
- Use httpOnly cookies when possible
- Implement proper session management
- Validate tokens on the server side

## Data Protection

### Frontend

- No sensitive data is stored in browser storage (localStorage/sessionStorage)
- Input validation on all user inputs
- XSS protection through React's automatic escaping
- CSRF protection mechanisms

### Backend

- Input validation using Zod schemas
- Parameterized database queries (via Mongoose)
- Rate limiting on API endpoints
- Request size limits

## Dependency Management

### Keeping Dependencies Secure

```bash
# Check for known vulnerabilities
pnpm audit

# Update dependencies to patched versions
pnpm update
```

### Automated Scanning

- Dependabot alerts for security vulnerabilities
- Regular dependency updates
- Lock files ensure reproducible builds

## Environment Variables

### Sensitive Configuration

All sensitive configuration should be stored in environment variables:

- API keys and secrets
- Database connection strings
- Authentication credentials
- Third-party service tokens

### Best Practices

1. **Never commit secrets** - Use `.env` files that are gitignored
2. **Use environment-specific configs** - Separate dev/staging/production
3. **Rotate secrets regularly** - Especially after any potential exposure
4. **Minimize access** - Only give access to those who need it

### Environment Files

```txt
environments/
├── .env.example      # Template with placeholder values (committed)
├── .env.dev          # Development values (not committed)
├── .env.staging      # Staging values (not committed)
└── .env.prod         # Production values (not committed)
```

## Security Headers

The production deployment includes security headers:

- **Content-Security-Policy** - Prevents XSS attacks
- **X-Content-Type-Options** - Prevents MIME-type sniffing
- **X-Frame-Options** - Prevents clickjacking
- **Strict-Transport-Security** - Enforces HTTPS
- **X-XSS-Protection** - Legacy XSS protection

## Docker Security

When deploying with Docker:

- Use official base images
- Run containers as non-root users
- Limit container capabilities
- Keep images updated
- Scan images for vulnerabilities

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Auth0 Security Documentation](https://auth0.com/docs/security)

## License

This project is licensed under the GNU General Public License v3.0 (GPL-3.0).
See the root of the repository for license details.

# BAAA Hub Keycloak Theme

This directory contains custom Keycloak themes for the BAAA Hub application. The
themes customize the login, registration, and account management pages to match
the application's branding and design.

## Directory Structure

```
keycloak-theme/
└── baaa-hub/
    ├── login/                    # Login/Registration theme
    │   ├── theme.properties      # Theme configuration
    │   ├── resources/
    │   │   ├── css/
    │   │   │   └── login.css     # Custom CSS styles
    │   │   ├── img/
    │   │   │   └── logo.png      # Application logo (add your logo here)
    │   │   └── js/
    │   └── messages/
    │       ├── messages_en.properties  # English translations
    │       └── messages_it.properties  # Italian translations
    └── account/                  # Account management theme
        ├── theme.properties      # Theme configuration
        ├── resources/
        │   ├── css/
        │   │   └── account.css   # Custom CSS styles
        │   ├── img/
        │   └── js/
        └── messages/
```

## Quick Start

### 1. Install the Theme in Keycloak

#### Option A: Mount as Volume (Development)

In `docker-compose.yml`, add a volume mount to the Keycloak service:

```yaml
services:
  keycloak:
    # ... other configuration ...
    volumes:
      - ./keycloak-theme/baaa-hub:/opt/keycloak/themes/baaa-hub
```

#### Option B: Build into Custom Keycloak Image (Production)

Create a `Dockerfile.keycloak`:

```dockerfile
FROM quay.io/keycloak/keycloak:26.0

COPY keycloak-theme/baaa-hub /opt/keycloak/themes/baaa-hub
```

### 2. Configure Keycloak to Use the Theme

1. Log in to Keycloak Admin Console
2. Select your realm (e.g., `baaa-hub`)
3. Go to **Realm Settings** > **Themes**
4. Set the following:
   - Login Theme: `baaa-hub`
   - Account Theme: `baaa-hub`
5. Click **Save**

## Customization Guide

### Changing Colors

Edit `login/resources/css/login.css` and modify the CSS custom properties in the
`:root` selector:

```css
:root {
  /* Primary colors - change to match your brand */
  --kc-primary-color: #1976d2;
  --kc-primary-light: #42a5f5;
  --kc-primary-dark: #1565c0;

  /* Secondary colors */
  --kc-secondary-color: #9c27b0;

  /* Background colors */
  --kc-background-default: #f5f5f5;
  --kc-background-paper: #ffffff;
}
```

### Replacing the Logo

1. Create your logo image (recommended size: 350x80px, PNG format)
2. Save it as `login/resources/img/logo.png`
3. Adjust the height in CSS if needed:

```css
.kc-logo-text {
  height: 80px; /* Adjust based on your logo size */
}
```

### Customizing Messages/Translations

Edit the message files in `login/messages/`:

- `messages_en.properties` - English
- `messages_it.properties` - Italian

To add a new language, create `messages_XX.properties` where XX is the language
code.

Common message keys to customize:

```properties
# Page titles
loginAccountTitle=Sign In to Your App Name
registerTitle=Create Your Account

# Buttons
doLogIn=Sign In
doRegister=Sign Up

# Error messages
invalidUserMessage=Invalid email or password.
```

### Adding Custom Templates

To override Keycloak's default FreeMarker templates:

1. Create a `templates/` directory in the theme
2. Copy the template you want to modify from Keycloak's default theme
3. Modify as needed

Example: Custom login page template

```
login/
└── templates/
    └── login.ftl
```

### Dark Mode

The theme automatically supports dark mode using the
`@media (prefers-color-scheme: dark)` CSS query. To customize dark mode colors,
edit the dark mode section in `login.css`:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --kc-background-default: #121212;
    --kc-background-paper: #1e1e1e;
    --kc-text-primary: rgba(255, 255, 255, 0.87);
    /* ... other dark mode colors */
  }
}
```

## i18n Support

The theme supports multiple languages. To ensure Keycloak uses the correct
language:

1. **Realm Settings** > **Localization**:
   - Enable **Internationalization**
   - Add supported locales (e.g., `en`, `it`)
   - Set default locale

2. The theme will automatically use messages from the appropriate
   `messages_XX.properties` file based on:
   - User's browser language preference
   - URL parameter: `?kc_locale=it`
   - Cookie: `KEYCLOAK_LOCALE`

## Testing Changes

### Development (Hot Reload)

With volume mounting, changes to CSS and message files take effect immediately
on page refresh. Template changes require Keycloak restart.

### Using Keycloak Developer Mode

For faster template development:

```yaml
services:
  keycloak:
    command: start-dev
    environment:
      KC_SPI_THEME_CACHE_TEMPLATES: 'false'
      KC_SPI_THEME_CACHE_THEMES: 'false'
```

## Reverse Proxy Configuration

For the best user experience, serve Keycloak under your app's domain:

### Nginx Configuration

```nginx
# Keycloak proxy
location /auth/ {
    proxy_pass http://keycloak:8080/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header X-Forwarded-Port $server_port;

    # Keycloak needs larger buffers
    proxy_buffer_size 64k;
    proxy_buffers 8 64k;
    proxy_busy_buffers_size 64k;
}
```

### Frontend Configuration

Update your frontend environment to use the proxied URL:

```env
VITE_KEYCLOAK_URL=http://localhost:8080/auth
```

## Troubleshooting

### Theme Not Appearing

1. Verify the theme directory is correctly mounted/copied to
   `/opt/keycloak/themes/baaa-hub`
2. Check Keycloak logs for theme loading errors
3. Restart Keycloak after adding new themes

### CSS Changes Not Reflecting

1. Clear browser cache
2. Disable theme caching in development:
   ```
   KC_SPI_THEME_CACHE_THEMES=false
   ```

### Messages Not Loading

1. Verify file encoding is UTF-8
2. Check property file syntax (use `''` for single quotes)
3. Restart Keycloak if message files were added

## Reference

- [Keycloak Theme Documentation](https://www.keycloak.org/docs/latest/server_development/#_themes)
- [Keycloak Theme Properties](https://www.keycloak.org/docs/latest/server_development/#theme-properties)
- [FreeMarker Template Guide](https://freemarker.apache.org/docs/dgui.html)

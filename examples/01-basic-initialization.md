# Basic Initialization

This example shows how to set up the basic application structure with all
required providers for the Activity Tracker app.

## Overview

The Activity Tracker application uses a provider-based architecture with
multiple context providers that wrap the application. Understanding this
structure is essential for working with the app.

## Minimal Setup

Here's a minimal example of initializing the application:

```tsx
import { createRoot } from 'react-dom/client';
import { App } from './containers/core/App/App.tsx';
import { AuthConfigurationProps } from './containers/core/App/App.model.ts';

// Configure Keycloak authentication
const auth: AuthConfigurationProps = {
  keycloakUrl: 'https://your-domain.com/auth',
  realm: 'baaa-hub',
  clientId: 'baaa-hub-client',
};

// Render the application
createRoot(document.getElementById('root')!).render(
  <App authConfiguration={auth} />,
);
```

## Provider Hierarchy

The `App` component internally wraps your application with multiple providers in
the following order (from outermost to innermost):

1. **ErrorBoundary** - Catches and handles React errors
2. **AuthProvider** - Manages authentication state and Keycloak integration
3. **LanguageProvider** - Handles internationalization language selection
4. **ThemeModeProvider** - Manages theme mode (light/dark)
5. **TranslationProvider** - Provides translated strings via Lingui
6. **BrowserRouter** - Handles client-side routing
7. **QueryClientProvider** - Manages server state with TanStack Query
8. **ThemeProvider** (Material-UI) - Applies Material-UI theme
9. **SnackbarProvider** - Displays toast notifications
10. **BreadcrumProvider** - Manages page titles and breadcrumbs

## Environment Variables

For the authentication configuration, you'll need these environment variables in
the centralized `environments/` folder:

```bash
# environments/.env.dev
VITE_KEYCLOAK_URL=http://localhost:8180
VITE_KEYCLOAK_REALM=baaa-hub
VITE_KEYCLOAK_CLIENT_ID=baaa-hub-client
```

See [environments/.env.example](../environments/.env.example) for complete setup
instructions.

## Complete Example with Environment Variables

```tsx
import { createRoot } from 'react-dom/client';
import { App } from './containers/core/App/App.tsx';
import { AuthConfigurationProps } from './containers/core/App/App.model.ts';

// Load configuration from environment variables
const auth: AuthConfigurationProps = {
  keycloakUrl: import.meta.env.VITE_KEYCLOAK_URL,
  realm: import.meta.env.VITE_KEYCLOAK_REALM,
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
};

// Optional: Register service worker for PWA support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(reg => console.log('Service Worker registered', reg))
      .catch(err => console.log('Service Worker registration failed', err));
  });
}

// Render the application
createRoot(document.getElementById('root')!).render(
  <App authConfiguration={auth} />,
);
```

## HTML Entry Point

Your `index.html` should have a root element:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Activity Tracker</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/index.tsx"></script>
  </body>
</html>
```

## What's Next?

- Learn about [Authentication](./02-authentication.md) to handle user login and
  logout
- Explore [Theme and Styling](./03-theme-and-styling.md) to customize the app
  appearance
- Check [Data Fetching](./04-data-fetching.md) for making API requests

## Common Pitfalls

1. **Missing Required Props**: All authentication props are required. If any
   prop is missing, `AuthProvider` will throw an error.
2. **Invalid Environment Variables**: Make sure all `VITE_*` environment
   variables are properly set before building.
3. **Service Worker Conflicts**: If you're testing PWA features, remember to
   unregister old service workers during development.

## See Also

- [App.tsx implementation](../apps/Client.Web/src/containers/core/App/App.tsx)
- [Main index.tsx](../apps/Client.Web/src/index.tsx)
- [Provider components](../apps/Client.Web/src/providers/)

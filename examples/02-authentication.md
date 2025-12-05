# Authentication

This example demonstrates how to use the Keycloak authentication system in the
Activity Tracker application.

## Overview

The application uses Keycloak for authentication. The `AuthProvider` component
manages authentication state, token persistence, and provides hooks for login,
logout, and checking authentication status. Keycloak provides a self-hosted
open-source identity provider with full support for OAuth 2.0, OpenID Connect,
SSO, MFA, and RBAC.

## Basic Usage

### Using the useAuth Hook

The `useAuth` hook provides access to authentication state and methods:

```tsx
import { useAuth } from '../providers/AuthProvider/AuthProvider';

function MyComponent() {
  const {
    isAuthenticated,
    isLoading,
    token,
    userPermissions,
    login,
    logout,
    authenticate,
    keycloak,
  } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return <div>Welcome! You are authenticated.</div>;
}
```

## Login Example

With Keycloak, login is handled via a redirect to the Keycloak login page. The
`login` function redirects to Keycloak with an optional email hint:

```tsx
import { useState } from 'react';
import { useAuth } from '../providers/AuthProvider/AuthProvider';
import { AuthErrorCode } from '../providers/AuthProvider/AuthProvider.model';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login, loginWithRedirect, isLoading } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Login with email hint - redirects to Keycloak
    login({
      email,
      password: '', // Password is handled by Keycloak, not passed here
      onErrorCallback: (errorCode?: AuthErrorCode) => {
        switch (errorCode) {
          case AuthErrorCode.INVALID_CONFIGURATION:
            setError('Authentication is not configured');
            break;
          default:
            setError('An error occurred during login');
        }
      },
    });
  };

  // Alternative: Simple redirect without email hint
  const handleDirectLogin = () => {
    loginWithRedirect();
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email (optional)"
        />
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Log In'}
        </button>
      </form>
      <button onClick={handleDirectLogin}>Log In with Keycloak</button>
    </div>
  );
}
```

## Logout Example

Simple logout functionality:

```tsx
import { useAuth } from '../providers/AuthProvider/AuthProvider';

function LogoutButton() {
  const { logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  // Logout redirects to Keycloak logout and then back to the app
  return <button onClick={logout}>Log Out</button>;
}
```

## Handling Authentication Callback

After Keycloak redirects back to your app (using authorization code flow with
PKCE), the callback is processed automatically by the Keycloak adapter:

```tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../providers/AuthProvider/AuthProvider';
import { AuthErrorCode } from '../providers/AuthProvider/AuthProvider.model';

function AuthCallback() {
  const navigate = useNavigate();
  const { authenticate, isAuthenticated } = useAuth();

  useEffect(() => {
    authenticate({
      onErrorCallback: (errorCode?: AuthErrorCode) => {
        console.error('Authentication failed:', errorCode);
        navigate('/login?error=auth_failed');
      },
    });
  }, [authenticate, navigate]);

  // Redirect to home when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  return <div>Processing authentication...</div>;
}
```

## Protected Route Example

Create a component that only renders for authenticated users:

```tsx
import { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../providers/AuthProvider/AuthProvider';

interface ProtectedRouteProps {
  children: ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Usage in router
function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
```

## Checking User Permissions

Access user roles/permissions from the auth token:

```tsx
import { useAuth } from '../providers/AuthProvider/AuthProvider';

function AdminPanel() {
  const { userPermissions } = useAuth();

  const isAdmin = userPermissions.includes('admin');
  const canEdit = userPermissions.includes('editor');

  if (!isAdmin) {
    return <div>You don't have admin access</div>;
  }

  return (
    <div>
      <h1>Admin Panel</h1>
      {canEdit && <button>Edit Content</button>}
    </div>
  );
}
```

## Role Hierarchy

The application implements a role-based permission hierarchy with three levels:

### Permission Levels

1. **Super Admin** (`super-admin`)
   - Highest privilege level
   - Can access all routes and features
   - Can manage all users, including other admins
   - Can assign or revoke admin roles
   - Cannot be blocked or demoted

2. **Admin** (`admin`)
   - Elevated privileges for user management
   - Can access admin and user routes
   - Can manage regular users (block, modify roles)
   - **Cannot** manage other admins or super-admins
   - **Cannot** assign or revoke admin roles

3. **User** (`user`)
   - Standard authenticated user
   - Can access user-level routes
   - Cannot access admin-only features

4. **Public** (`public`)
   - Unauthenticated users
   - Can only access public routes

### Checking for Admin Privileges

```tsx
import { useAuth } from '../providers/AuthProvider/AuthProvider';

function SuperAdminPanel() {
  const { userPermissions } = useAuth();

  const isSuperAdmin = userPermissions.includes('super-admin');
  const isAdmin = userPermissions.includes('admin');

  // Super-admin can manage admins
  if (isSuperAdmin) {
    return (
      <div>
        <h1>Super Admin Panel</h1>
        <button>Manage Admins</button>
        <button>Manage Users</button>
      </div>
    );
  }

  // Regular admin can only manage regular users
  if (isAdmin) {
    return (
      <div>
        <h1>Admin Panel</h1>
        <button>Manage Users</button>
      </div>
    );
  }

  return <div>Access denied</div>;
}
```

### Route Permission Example

```tsx
import { SidebarRoute } from '../components/commons/navigation/Sidebar/Sidebar.model';

const routes: SidebarRoute[] = [
  {
    id: 'dashboard',
    path: '/dashboard',
    label: 'Dashboard',
    permission: 'user', // Visible to all authenticated users
  },
  {
    id: 'admin-users',
    path: '/admin/users',
    label: 'User Management',
    permission: 'admin', // Visible to admins and super-admins
  },
  {
    id: 'admin-management',
    path: '/admin/admins',
    label: 'Admin Management',
    permission: 'super-admin', // Visible only to super-admins
  },
];
```

### Server-Side Permission Enforcement

The backend API also enforces the same permission hierarchy:

- **Regular admins** cannot see, modify, or block other admins or super-admins
  in the user list
- **Only super-admins** can assign or revoke the admin role
- **Nobody** can modify super-admin roles (protected system role)

## Accessing Token Information

Get details from the authentication token:

```tsx
import { useAuth } from '../providers/AuthProvider/AuthProvider';

function UserProfile() {
  const { token } = useAuth();

  if (!token || !token.idTokenPayload) {
    return <div>No user information available</div>;
  }

  const { email, name, preferred_username, given_name, family_name } =
    token.idTokenPayload;

  return (
    <div>
      <h2>{name || `${given_name} ${family_name}` || 'User'}</h2>
      <p>Username: {preferred_username}</p>
      <p>Email: {email}</p>
    </div>
  );
}
```

## Authentication State Persistence

The `AuthProvider` automatically:

- Saves tokens to `localStorage` when available
- Restores tokens on page reload
- Uses Keycloak's built-in token refresh mechanism
- Refreshes tokens periodically (every 60 seconds)
- Checks token expiration every 30 seconds
- Logs out users when tokens expire

## Error Codes

Common authentication error codes you may encounter:

- `AuthErrorCode.INVALID_TOKEN` - Token validation failed
- `AuthErrorCode.INVALID_CONFIGURATION` - Keycloak not configured properly
- `AuthErrorCode.ACCESS_DENIED` - Access was denied
- `AuthErrorCode.TOO_MANY_ATTEMPTS` - Too many login attempts

## Signup / Registration

With Keycloak, user registration is handled via Keycloak's registration page:

```tsx
import { useAuth } from '../providers/AuthProvider/AuthProvider';

function SignupButton() {
  const { signup } = useAuth();

  const handleSignup = () => {
    signup({
      email: '', // Optional email hint
      password: '', // Password is handled by Keycloak
      onSuccessCallback: () => {
        console.log('User will be redirected to Keycloak registration');
      },
      onErrorCallback: error => {
        console.error('Signup error:', error);
      },
    });
  };

  return <button onClick={handleSignup}>Sign Up</button>;
}
```

## Complete Working Example

Here's a complete authentication flow:

```tsx
import { useEffect } from 'react';
import { useAuth } from '../providers/AuthProvider/AuthProvider';
import { useNavigate } from 'react-router';

function AuthenticatedApp() {
  const { isAuthenticated, isLoading, logout, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return <div>Loading authentication...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div>
      <header>
        <h1>Activity Tracker</h1>
        <div>
          <span>
            Welcome,{' '}
            {token?.idTokenPayload?.name ||
              token?.idTokenPayload?.preferred_username}
          </span>
          <button onClick={logout}>Logout</button>
        </div>
      </header>
      <main>{/* Your app content */}</main>
    </div>
  );
}
```

## Public-First Architecture

The application implements a **public-first** approach similar to Strava:

- Most content is publicly accessible by default
- Users don't need to log in to browse content
- Login/signup buttons are displayed in the header for unauthenticated users
- Advanced features (profile, settings, admin) require authentication
- All login/signup flows are handled by Keycloak (no native login forms)

### Public vs Protected Routes

```tsx
// Public routes - accessible to everyone
const publicRoutes = [
  '/dashboard', // Main dashboard
  '/activities', // View activities
];

// Protected routes - require authentication
const protectedRoutes = [
  '/profile', // User profile
  '/settings', // User settings
  '/administration', // Admin only
];
```

### PublicContainer

The `PublicContainer` component renders the layout for unauthenticated users:

```tsx
import { PublicContainer } from '../containers/PublicContainer/PublicContainer';

// This container shows:
// - Login button in the header
// - Sign Up button in the header
// - Limited sidebar navigation
// - Public content
```

### Route Guards

The `Router` component handles authentication routing:

```tsx
// Unauthenticated users
// - See PublicContainer with login/signup buttons
// - Can access public routes (dashboard)
// - Redirected to dashboard for unknown routes

// Authenticated users
// - See MainContainer with full navigation
// - Can access all routes based on permissions
// - Profile setup required before accessing other routes
```

## Keycloak Theme Customization

The application includes a custom Keycloak theme (`keycloak-theme/baaa-hub/`)
that matches the app's branding:

1. **Location**: `/keycloak-theme/baaa-hub/`
2. **Theme files**:
   - `login/resources/css/login.css` - Custom styles
   - `login/resources/img/logo.png` - App logo
   - `login/messages/messages_en.properties` - English translations
   - `login/messages/messages_it.properties` - Italian translations

3. **To customize**:
   - Edit CSS variables in `login.css` for colors
   - Replace `logo.png` with your logo
   - Edit message files for custom text

See [Keycloak Theme README](../keycloak-theme/README.md) for detailed
customization instructions.

## Keycloak Configuration

To configure Keycloak for this application:

1. Create a realm (e.g., `baaa-hub`)
2. Create a client (e.g., `baaa-hub-client`)
   - Client Protocol: OpenID Connect
   - Access Type: public
   - Standard Flow Enabled: ON
   - Direct Access Grants: OFF (for security)
   - Valid Redirect URIs: `http://localhost:4000/*` (development)
   - Web Origins: `http://localhost:4000` (development)
3. Configure the theme:
   - Go to Realm Settings > Themes
   - Set Login Theme to `baaa-hub`
   - Set Account Theme to `baaa-hub`
4. Configure environment variables:
   - `VITE_KEYCLOAK_URL`: Keycloak server URL
   - `VITE_KEYCLOAK_REALM`: Realm name
   - `VITE_KEYCLOAK_CLIENT_ID`: Client ID

## What's Next?

- Learn about [Theme and Styling](./03-theme-and-styling.md)
- Explore [Data Fetching](./04-data-fetching.md)

## See Also

- [AuthProvider implementation](../apps/Client.Web/src/providers/AuthProvider/AuthProvider.tsx)
- [AuthProvider model types](../apps/Client.Web/src/providers/AuthProvider/AuthProvider.model.ts)
- [PublicContainer](../apps/Client.Web/src/containers/PublicContainer/PublicContainer.tsx)
- [Router](../apps/Client.Web/src/containers/core/Router/Router.tsx)
- [Keycloak Theme](../keycloak-theme/README.md)
- [Keycloak Documentation](https://www.keycloak.org/documentation)

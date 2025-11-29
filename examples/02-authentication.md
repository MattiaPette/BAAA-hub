# Authentication

This example demonstrates how to use the Auth0 authentication system in the
Activity Tracker application.

## Overview

The application uses Auth0 for authentication. The `AuthProvider` component
manages authentication state, token persistence, and provides hooks for login,
logout, and checking authentication status.

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

Create a login form that authenticates users with email and password:

```tsx
import { useState } from 'react';
import { useAuth } from '../providers/AuthProvider/AuthProvider';
import { AuthErrorCode } from '../providers/AuthProvider/AuthProvider.model';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login, isLoading } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    login({
      email,
      password,
      onErrorCallback: (errorCode?: AuthErrorCode) => {
        switch (errorCode) {
          case AuthErrorCode.INVALID_CREDENTIALS:
            setError('Invalid email or password');
            break;
          case AuthErrorCode.ACCOUNT_BLOCKED:
            setError('Your account has been blocked');
            break;
          default:
            setError('An error occurred during login');
        }
      },
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Log In'}
      </button>
    </form>
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

  return <button onClick={logout}>Log Out</button>;
}
```

## Handling Authentication Callback

After Auth0 redirects back to your app, you need to parse the authentication
result:

```tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../providers/AuthProvider/AuthProvider';
import { AuthErrorCode } from '../providers/AuthProvider/AuthProvider.model';

function AuthCallback() {
  const navigate = useNavigate();
  const { authenticate } = useAuth();

  useEffect(() => {
    authenticate({
      onErrorCallback: (errorCode?: AuthErrorCode) => {
        console.error('Authentication failed:', errorCode);
        navigate('/login?error=auth_failed');
      },
    });
  }, [authenticate, navigate]);

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

  const { email, name, picture } = token.idTokenPayload;

  return (
    <div>
      {picture && <img src={picture} alt={name || email} />}
      <h2>{name || 'User'}</h2>
      <p>{email}</p>
    </div>
  );
}
```

## Authentication State Persistence

The `AuthProvider` automatically:

- Saves tokens to `localStorage` when available
- Restores tokens on page reload
- Refreshes tokens every hour
- Checks token expiration every 30 seconds
- Logs out users when tokens expire

## Error Codes

Common authentication error codes you may encounter:

- `AuthErrorCode.INVALID_TOKEN` - Token validation failed
- `AuthErrorCode.INVALID_CREDENTIALS` - Wrong email or password
- `AuthErrorCode.ACCOUNT_BLOCKED` - User account is blocked
- `AuthErrorCode.TOO_MANY_ATTEMPTS` - Too many login attempts

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
          <span>Welcome, {token?.idTokenPayload?.name}</span>
          <button onClick={logout}>Logout</button>
        </div>
      </header>
      <main>{/* Your app content */}</main>
    </div>
  );
}
```

## What's Next?

- Learn about [Theme and Styling](./03-theme-and-styling.md)
- Explore [Data Fetching](./04-data-fetching.md)

## See Also

- [AuthProvider implementation](../apps/Client.Web/src/providers/AuthProvider/AuthProvider.tsx)
- [AuthProvider model types](../apps/Client.Web/src/providers/AuthProvider/AuthProvider.model.ts)
- [Login component](../apps/Client.Web/src/containers/Login/)

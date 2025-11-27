# BAAA Hub - API Reference

This document provides a comprehensive reference to the BAAA Hub application's
architecture, modules, and exported functions/types. It serves as a guide for
developers, contributors, and AI tools to understand the codebase structure.

---

## Table of Contents

- [Project Overview](#project-overview)
- [High-Level Architecture](#high-level-architecture)
- [Module Map](#module-map)
- [Core Modules](#core-modules)
  - [Helpers](#helpers)
  - [Hooks](#hooks)
  - [Providers (Context)](#providers-context)
  - [Components](#components)
  - [Containers](#containers)
  - [Theme](#theme)
- [Main Exported Functions and Types](#main-exported-functions-and-types)
- [Usage Examples](#usage-examples)

---

## Project Overview

**BAAA Hub** is a modern PWA AI-powered application, built with:

- **React 19** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Material-UI (MUI)** - Component library
- **React Router** - Client-side routing
- **TanStack Query** - Server state management
- **Lingui** - Internationalization (i18n)
- **Auth0** - Authentication
- **Vitest** - Unit testing framework

The application follows a monorepo structure with workspace-based organization.

---

## High-Level Architecture

```txt
baaa-hub/
├── apps/
│   └── Client.Web/          # Frontend React application
│       ├── src/
│       │   ├── components/  # Reusable UI components
│       │   ├── containers/  # Page-level components
│       │   ├── helpers/     # Utility functions
│       │   ├── hooks/       # Custom React hooks
│       │   ├── locales/     # Translation files (i18n)
│       │   ├── providers/   # React context providers
│       │   ├── theme/       # Material-UI theme configuration
│       │   └── index.tsx    # Application entry point
│       ├── public/          # Static assets
│       └── package.json     # Frontend dependencies
├── package.json             # Root workspace configuration
└── README.md               # Project documentation
```

---

## Module Map

### Source Code Organization

| Module         | Path              | Purpose                                       |
| -------------- | ----------------- | --------------------------------------------- |
| **Helpers**    | `src/helpers/`    | Utility functions for common operations       |
| **Hooks**      | `src/hooks/`      | Custom React hooks for shared logic           |
| **Providers**  | `src/providers/`  | React Context providers for global state      |
| **Components** | `src/components/` | Reusable UI components                        |
| **Containers** | `src/containers/` | Page-level container components               |
| **Theme**      | `src/theme/`      | Material-UI theme and styling configuration   |
| **Locales**    | `src/locales/`    | Internationalization (i18n) translation files |
| **Assets**     | `src/assets/`     | Static assets (images, icons, etc.)           |

---

## Core Modules

### Helpers

**Location:** `apps/Client.Web/src/helpers/`

Utility functions providing common functionality across the application.

#### `makeRequest`

**File:** `src/helpers/makeRequest/makeRequest.ts`

Creates an Axios instance with a base URL and performs HTTP requests.

**Type Definition:**

```typescript
type MakeRequest = (options: {
  baseUrl: string;
}) => (url: string, config?: AxiosRequestConfig) => Promise<AxiosResponse>;
```

**Exports:**

- `makeRequest` - Main function for creating HTTP request handlers

**Usage Example:**

```typescript
import { makeRequest } from './helpers/makeRequest/makeRequest';

const request = makeRequest({ baseUrl: 'https://api.example.com' });
const response = await request('/endpoint', {
  headers: { Authorization: 'Bearer token' },
});
```

#### `getErrorDescription`

**File:** `src/helpers/getErrorDescription/getErrorDescription.tsx`

Maps authentication error codes to localized, user-facing error messages.

**Type Definition:**

```typescript
type GetErrorDescriptionHelper = (params: {
  errorCode: AuthErrorCode;
}) => string;
```

**Exports:**

- `getErrorDescription` - Maps error codes to translated messages

**Supported Error Codes:**

- `ACCESS_DENIED`
- `INVALID_USER_PASSWORD`
- `PASSWORD_LEAKED`
- `TOO_MANY_ATTEMPTS`
- `BLOCKED_USER`
- `UNAUTHORIZED`
- `MFA_REQUIRED`
- `MFA_INVALID_CODE`
- `MFA_REGISTRATION_REQUIRED`
- `INVALID_GRANT`
- `EXPIRED_TOKEN`
- `SERVER_ERROR`
- And more...

**Usage Example:**

```typescript
import { getErrorDescription } from './helpers/getErrorDescription/getErrorDescription';
import { AuthErrorCode } from './providers/AuthProvider/AuthProvider.model';

const errorMessage = getErrorDescription({
  errorCode: AuthErrorCode.ACCESS_DENIED,
});
console.log(errorMessage); // "Accesso negato. Nome utente e/o password non corretti"
```

---

### Hooks

**Location:** `apps/Client.Web/src/hooks/`

Custom React hooks for shared component logic.

#### `useBlockNavigation`

**File:** `src/hooks/useBlockNavigation/useBlockNavigation.ts`

Prevents browser navigation (page refresh, back button) when needed, typically
used in forms with unsaved changes.

**Type Definition:**

```typescript
function useBlockNavigation(shouldBlock: boolean): void;
```

**Exports:**

- `useBlockNavigation` - Hook to control navigation blocking

**Usage Example:**

```typescript
import { useBlockNavigation } from './hooks/useBlockNavigation/useBlockNavigation';

function MyForm() {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Block navigation when there are unsaved changes
  useBlockNavigation(hasUnsavedChanges);

  return <form>...</form>;
}
```

---

### Providers (Context)

**Location:** `apps/Client.Web/src/providers/`

React Context providers for managing global application state.

#### `AuthProvider`

**File:** `src/providers/AuthProvider/AuthProvider.tsx`

Manages authentication state using Auth0, including login, logout, token
management, and session persistence.

**Type Definitions:**

```typescript
interface AuthProviderProps {
  children: React.ReactNode;
  domain: string;
  clientID: string;
  responseType: string;
  userDatabaseConnection: string;
  scope: string;
  redirectUri: string;
}

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: AuthToken | null;
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  authenticate: () => Promise<void>;
}
```

**Exports:**

- `AuthProvider` - Provider component
- `AuthContext` - React Context
- `useAuth` - Hook to access auth context
- `AuthErrorCode` - Enum of authentication error codes

**Usage Example:**

```typescript
import { AuthProvider, useAuth } from './providers/AuthProvider/AuthProvider';

// In app root:
<AuthProvider domain="your-tenant.auth0.com" clientID="..." {...otherProps}>
  <App />
</AuthProvider>

// In components:
function MyComponent() {
  const { isAuthenticated, user, login, logout } = useAuth();

  if (isAuthenticated) {
    return <div>Welcome, {user?.name}</div>;
  }

  return <button onClick={() => login(username, password)}>Login</button>;
}
```

#### `BreadcrumProvider`

**File:** `src/providers/BreadcrumProvider/BreadcrumProvider.tsx`

Manages page titles and breadcrumb navigation state.

**Type Definitions:**

```typescript
interface BreadcrumProviderProps {
  children: React.ReactNode;
}

interface BreadcrumContextValue {
  title: string;
  setTitle: (title: string) => void;
}
```

**Exports:**

- `BreadcrumProvider` - Provider component
- `BreadcrumContext` - React Context
- `useBreadcrum` - Hook to access breadcrumb context

**Usage Example:**

```typescript
import { BreadcrumProvider, useBreadcrum } from './providers/BreadcrumProvider/BreadcrumProvider';

// In app root:
<BreadcrumProvider>
  <App />
</BreadcrumProvider>

// In components:
function MyPage() {
  const { setTitle } = useBreadcrum();

  useEffect(() => {
    setTitle('My Page Title');
  }, [setTitle]);

  return <div>Content</div>;
}
```

#### `ThemeProvider`

**File:** `src/providers/ThemeProvider/ThemeProvider.tsx`

Provides Material-UI theme configuration and manages theme state.

**Exports:**

- `ThemeProvider` - Custom theme provider wrapping MUI ThemeProvider
- Theme-related utilities

#### `LanguageProvider`

**File:** `src/providers/LanguageProvider/LanguageProvider.tsx`

Manages language selection and locale state for internationalization.

**Exports:**

- `LanguageProvider` - Provider for language state
- Language switching utilities

#### `TranslationProvider`

**File:** `src/providers/TranslationProvider/TranslationProvider.tsx`

Integrates Lingui for translation management and i18n support.

**Exports:**

- `TranslationProvider` - Provider for i18n functionality

---

### Components

**Location:** `apps/Client.Web/src/components/`

Reusable UI components organized by category.

#### Component Categories

| Category    | Path                      | Description                                |
| ----------- | ------------------------- | ------------------------------------------ |
| **Login**   | `src/components/login/`   | Authentication-related components          |
| **Commons** | `src/components/commons/` | Shared, reusable components                |
| **Prompts** | `src/components/prompts/` | User prompt components (e.g., PWA install) |

#### Commons Subcategories

| Subcategory      | Path                                  | Description                                           |
| ---------------- | ------------------------------------- | ----------------------------------------------------- |
| **Feedbacks**    | `src/components/commons/feedbacks/`   | User feedback components (dialogs, loaders, tooltips) |
| **Data Display** | `src/components/commons/dataDisplay/` | Components for displaying data (tables, text)         |
| **Inputs**       | `src/components/commons/inputs/`      | Form input components                                 |
| **Navigation**   | `src/components/commons/navigation/`  | Navigation components (sidebar, topbar, links)        |
| **Layouts**      | `src/components/commons/layouts/`     | Layout and container components                       |
| **Errors**       | `src/components/commons/errors/`      | Error boundary and error display components           |
| **Extensions**   | `src/components/commons/extensions/`  | Extension and utility components                      |

#### Key Components

##### Login Components

- **LoginForm** (`src/components/login/LoginForm/`) - User login form with
  validation

##### Feedback Components

- **Dialog** (`src/components/commons/feedbacks/Dialog/`) - Modal dialog
  component
- **FormDialog** (`src/components/commons/feedbacks/FormDialog/`) - Dialog with
  form integration
- **Loader** (`src/components/commons/feedbacks/Loader/`) - Loading spinner
- **LoadingOverlay** (`src/components/commons/feedbacks/LoadingOverlay/`) -
  Full-screen loading overlay
- **PlaceholderText** (`src/components/commons/feedbacks/PlaceholderText/`) -
  Placeholder text component
- **SnackbarCloseAction**
  (`src/components/commons/feedbacks/SnackbarCloseAction/`) - Snackbar close
  button
- **TextArea** (`src/components/commons/feedbacks/TextArea/`) - Text area input
- **Tooltip** (`src/components/commons/feedbacks/ToolTip/`) - Tooltip component

##### Data Display Components

- **DataTable** (`src/components/commons/dataDisplay/DataTable/`) - Data table
  with sorting and filtering
- **DialogText** (`src/components/commons/dataDisplay/DialogText/`) - Text
  display in dialogs
- **StyledDataGrid** (`src/components/commons/dataDisplay/StyledDataGrid/`) -
  Styled MUI DataGrid

##### Input Components

- **CheckboxList** (`src/components/commons/inputs/CheckboxList/`) - List of
  checkboxes

##### Navigation Components

- **Sidebar** (`src/components/commons/navigation/Sidebar/`) - Application
  sidebar navigation
- **TopBar** (`src/components/commons/navigation/TopBar/`) - Application top
  navigation bar
- **SidebarItem** (`src/components/commons/navigation/SidebarItem/`) -
  Individual sidebar navigation item
- **TopbarTitle** (`src/components/commons/navigation/TopbarTitle/`) - Title in
  topbar
- **LinkRouter** (`src/components/commons/navigation/LinkRouter/`) -
  Router-aware link component
- **UserPopover** (`src/components/commons/navigation/UserPopover/`) - User menu
  popover
- **UserInformations** (`src/components/commons/navigation/UserInformations/`) -
  User information display

##### Layout Components

- **Card** (`src/components/commons/layouts/Card/`) - Card container component
- **FlexContainer** (`src/components/commons/layouts/FlexContainer/`) - Flexbox
  container
- **Layout** (`src/components/commons/layouts/Layout/`) - Main application
  layout

##### Error Components

- **ErrorBoundary** (`src/components/commons/errors/ErrorBoundary/`) - React
  error boundary
- **RetryErrorFallback** (`src/components/commons/errors/RetryErrorFallback/`) -
  Error fallback with retry
- **RootErrorFallback** (`src/components/commons/errors/RootErrorFallback/`) -
  Root-level error fallback

##### Extension Components

- **VisuallyHiddenInput**
  (`src/components/commons/extensions/VisuallyHiddenInput/`) - Accessible hidden
  input

##### Prompt Components

- **InstallApp** (`src/components/prompts/InstallApp/`) - PWA installation
  prompt

---

### Containers

**Location:** `apps/Client.Web/src/containers/`

Page-level container components that compose smaller components into full pages.

#### Key Containers

| Container         | File                                             | Description                       |
| ----------------- | ------------------------------------------------ | --------------------------------- |
| **App**           | `src/containers/core/App/App.tsx`                | Root application component        |
| **Router**        | `src/containers/core/Router/Router.tsx`          | Application routing configuration |
| **BaseContainer** | `src/containers/BaseContainer/BaseContainer.tsx` | Base container wrapper            |
| **MainContainer** | `src/containers/MainContainer/MainContainer.tsx` | Main application container        |
| **Login**         | `src/containers/Login/Login.tsx`                 | Login page container              |
| **LoginCallback** | `src/containers/LoginCallback/LoginCallback.tsx` | OAuth callback handler            |
| **Logout**        | `src/containers/Logout/Logout.tsx`               | Logout page container             |
| **Settings**      | `src/containers/Settings/Settings.tsx`           | Settings page container           |

**Usage Pattern:**

```typescript
// Containers typically compose providers and components
import { App } from './containers/core/App/App';

// App is the root container
<App authConfiguration={authConfig} />
```

---

### Theme

**Location:** `apps/Client.Web/src/theme/`

Material-UI theme configuration and customization.

#### Key Files

| File                           | Purpose                                        |
| ------------------------------ | ---------------------------------------------- |
| `theme.ts`                     | Main theme definition                          |
| `themePrimitives.ts`           | Theme primitive values (colors, spacing, etc.) |
| `customization/index.ts`       | Theme customization exports                    |
| `customization/common.tsx`     | Common component customizations                |
| `customization/navigation.tsx` | Navigation component customizations            |

**Exports:**

- Theme configurations
- Color palettes
- Typography settings
- Component style overrides

**Usage Example:**

```typescript
import { theme } from './theme/theme';
import { ThemeProvider } from '@mui/material/styles';

<ThemeProvider theme={theme}>
  <App />
</ThemeProvider>
```

---

## Main Exported Functions and Types

### Helper Functions

| Export                | Module                        | Type                        | Description                             |
| --------------------- | ----------------------------- | --------------------------- | --------------------------------------- |
| `makeRequest`         | `helpers/makeRequest`         | `MakeRequest`               | Creates HTTP request handler with Axios |
| `getErrorDescription` | `helpers/getErrorDescription` | `GetErrorDescriptionHelper` | Maps error codes to messages            |

### Custom Hooks

| Export               | Module                        | Type                             | Description                   |
| -------------------- | ----------------------------- | -------------------------------- | ----------------------------- |
| `useBlockNavigation` | `hooks/useBlockNavigation`    | `(shouldBlock: boolean) => void` | Blocks browser navigation     |
| `useAuth`            | `providers/AuthProvider`      | `() => AuthContextValue`         | Access authentication context |
| `useBreadcrum`       | `providers/BreadcrumProvider` | `() => BreadcrumContextValue`    | Access breadcrumb context     |

### Context Providers

| Export                | Module                          | Props Interface          | Description                      |
| --------------------- | ------------------------------- | ------------------------ | -------------------------------- |
| `AuthProvider`        | `providers/AuthProvider`        | `AuthProviderProps`      | Authentication state management  |
| `BreadcrumProvider`   | `providers/BreadcrumProvider`   | `BreadcrumProviderProps` | Page title/breadcrumb management |
| `ThemeProvider`       | `providers/ThemeProvider`       | Custom theme props       | Theme configuration              |
| `LanguageProvider`    | `providers/LanguageProvider`    | Language provider props  | Language selection               |
| `TranslationProvider` | `providers/TranslationProvider` | Translation props        | i18n support                     |

### Type Definitions

#### Authentication Types

```typescript
enum AuthErrorCode {
  ACCESS_DENIED = 'access_denied',
  INVALID_USER_PASSWORD = 'invalid_user_password',
  PASSWORD_LEAKED = 'password_leaked',
  TOO_MANY_ATTEMPTS = 'too_many_attempts',
  BLOCKED_USER = 'blocked_user',
  UNAUTHORIZED = 'unauthorized',
  MFA_REQUIRED = 'mfa_required',
  MFA_INVALID_CODE = 'mfa_invalid_code',
  EXPIRED_TOKEN = 'expired_token',
  SERVER_ERROR = 'server_error',
  // ... and more
}

interface AuthToken {
  idToken: string;
  expiresAt: number;
  // ... other token fields
}

interface AuthConfigurationProps {
  domain: string;
  clientID: string;
  responseType: string;
  userDatabaseConnection: string;
  scope: string;
  redirectUri: string;
}
```

---

## Usage Examples

### Complete Application Setup

```typescript
import { createRoot } from 'react-dom/client';
import { App } from './containers/core/App/App';
import { AuthConfigurationProps } from './containers/core/App/App.model';

// 1. Configure authentication
const auth: AuthConfigurationProps = {
  domain: 'your-tenant.auth0.com',
  clientID: 'your-client-id',
  responseType: 'token id_token',
  userDatabaseConnection: 'Username-Password-Authentication',
  scope: 'openid profile email',
  redirectUri: 'http://localhost:5173/callback',
};

// 2. Register service worker (PWA support)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(reg => console.log('Service Worker registered', reg))
      .catch(err => console.log('Service Worker registration failed', err));
  });
}

// 3. Render application
createRoot(document.getElementById('root')!).render(
  <App authConfiguration={auth} />
);
```

### Using Authentication

```typescript
import { useAuth } from './providers/AuthProvider/AuthProvider';

function LoginPage() {
  const { isAuthenticated, login, logout, user, isLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      await login(username, password);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  if (isAuthenticated) {
    return (
      <div>
        <p>Welcome, {user?.name}!</p>
        <button onClick={logout}>Logout</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleLogin}>
      <input value={username} onChange={e => setUsername(e.target.value)} />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button type="submit">Login</button>
    </form>
  );
}
```

### Making HTTP Requests

```typescript
import { makeRequest } from './helpers/makeRequest/makeRequest';

// Create a request handler
const apiRequest = makeRequest({
  baseUrl: 'https://api.example.com',
});

// Use in a component or service
async function fetchUserData(userId: string) {
  try {
    const response = await apiRequest(`/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user data:', error);
    throw error;
  }
}
```

### Handling Errors

```typescript
import { getErrorDescription } from './helpers/getErrorDescription/getErrorDescription';
import { AuthErrorCode } from './providers/AuthProvider/AuthProvider.model';

function LoginForm() {
  const [error, setError] = useState<AuthErrorCode | null>(null);

  const handleLoginError = (errorCode: AuthErrorCode) => {
    setError(errorCode);
    const errorMessage = getErrorDescription({ errorCode });
    // Display error to user
    alert(errorMessage);
  };

  // ... rest of component
}
```

### Blocking Navigation on Unsaved Changes

```typescript
import { useBlockNavigation } from './hooks/useBlockNavigation/useBlockNavigation';

function EditForm() {
  const [formData, setFormData] = useState({});
  const [isDirty, setIsDirty] = useState(false);

  // Block navigation if form has unsaved changes
  useBlockNavigation(isDirty);

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
    setIsDirty(true);
  };

  const handleSave = async () => {
    // Save data
    await saveData(formData);
    setIsDirty(false); // Navigation no longer blocked
  };

  return (
    <form>
      {/* Form fields */}
      <button onClick={handleSave}>Save</button>
    </form>
  );
}
```

### Managing Page Titles

```typescript
import { useBreadcrum } from './providers/BreadcrumProvider/BreadcrumProvider';
import { useEffect } from 'react';

function SettingsPage() {
  const { setTitle } = useBreadcrum();

  useEffect(() => {
    setTitle('Settings');
  }, [setTitle]);

  return <div>Settings Content</div>;
}
```

---

## Development Commands

For building, testing, and running the application, see the main
[README.md](README.md) file.

**Key Commands:**

```bash
# Development
yarn fe:dev              # Start dev server

# Code Quality
yarn fe:lint             # Lint code
yarn fe:format:check     # Check formatting

# Testing
yarn fe:test             # Run tests
yarn fe:test:coverage    # Run tests with coverage

# Building
yarn fe:build            # Production build
```

---

## Additional Resources

- **Main Documentation:** [README.md](README.md)
- **Contributing Guidelines:** [CONTRIBUTING.md](CONTRIBUTING.md)
- **Client Web Documentation:**
  [apps/Client.Web/README.md](apps/Client.Web/README.md)

---

## Notes for AI Tools and Semantic Search

This API reference is structured to enable:

- **Module Discovery:** Quick identification of where specific functionality
  resides
- **Function Signatures:** Clear type definitions for all exported functions
- **Usage Patterns:** Real-world examples for common use cases
- **Architecture Understanding:** High-level overview of application structure

**Key Search Terms:**

- Authentication: `AuthProvider`, `useAuth`, `login`, `logout`
- HTTP Requests: `makeRequest`, `axios`
- Error Handling: `getErrorDescription`, `AuthErrorCode`
- Navigation: `useBlockNavigation`, `Router`, `Sidebar`, `TopBar`
- State Management: Context providers, hooks
- UI Components: Material-UI components, custom components
- Internationalization: `TranslationProvider`, `LanguageProvider`, `lingui`
- Testing: `vitest`, unit tests

---

**Last Updated:** 2025-11-08  
**Version:** 1.0.0

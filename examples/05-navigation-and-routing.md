# Navigation and Routing

This example demonstrates how to work with breadcrumbs, page titles, and
navigation blocking in the Activity Tracker application.

## Overview

The application provides utilities for managing page titles (breadcrumbs) and
blocking navigation when users have unsaved changes.

## Managing Page Titles with useBreadcrum

The `useBreadcrum` hook allows you to set and retrieve the current page title:

### Basic Usage

```tsx
import { useEffect } from 'react';
import { useBreadcrum } from '../providers/BreadcrumProvider/BreadcrumProvider';

function Dashboard() {
  const { setTitle } = useBreadcrum();

  useEffect(() => {
    setTitle('Dashboard');
  }, [setTitle]);

  return (
    <div>
      <h1>Dashboard</h1>
      {/* Dashboard content */}
    </div>
  );
}
```

### Reading Current Title

```tsx
import { useBreadcrum } from '../providers/BreadcrumProvider/BreadcrumProvider';

function PageHeader() {
  const { title } = useBreadcrum();

  return (
    <header>
      <h1>{title}</h1>
    </header>
  );
}
```

### Setting Title on Route Change

```tsx
import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { useBreadcrum } from '../providers/BreadcrumProvider/BreadcrumProvider';

function SettingsPage() {
  const { setTitle } = useBreadcrum();
  const location = useLocation();

  useEffect(() => {
    setTitle('Settings');
  }, [location.pathname, setTitle]);

  return (
    <div>
      <h2>Application Settings</h2>
      {/* Settings content */}
    </div>
  );
}
```

## Blocking Navigation with useBlockNavigation

The `useBlockNavigation` hook prevents users from accidentally leaving a page
with unsaved changes:

### Usage

```tsx
import { useState } from 'react';
import { useBlockNavigation } from '../hooks/useBlockNavigation/useBlockNavigation';

function EditForm() {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Block navigation when there are unsaved changes
  useBlockNavigation(hasUnsavedChanges);

  const handleInputChange = () => {
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    // Save logic here
    setHasUnsavedChanges(false);
  };

  return (
    <form>
      <input onChange={handleInputChange} />
      <button onClick={handleSave}>Save</button>
      {hasUnsavedChanges && <p>You have unsaved changes!</p>}
    </form>
  );
}
```

### Complete Form Example with Navigation Blocking

```tsx
import { useState, useEffect } from 'react';
import { useBlockNavigation } from '../hooks/useBlockNavigation/useBlockNavigation';
import { useBreadcrum } from '../providers/BreadcrumProvider/BreadcrumProvider';

interface FormData {
  title: string;
  description: string;
}

function ActivityForm() {
  const { setTitle } = useBreadcrum();
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
  });
  const [originalData, setOriginalData] = useState<FormData>({
    title: '',
    description: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  // Check if form has been modified
  const hasChanges =
    formData.title !== originalData.title ||
    formData.description !== originalData.description;

  // Block navigation if there are unsaved changes
  useBlockNavigation(hasChanges && !isSaving);

  useEffect(() => {
    setTitle('Edit Activity');
  }, [setTitle]);

  const handleChange =
    (field: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData(prev => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate save operation
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update original data after successful save
      setOriginalData(formData);
      alert('Saved successfully!');
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    if (confirm('Discard unsaved changes?')) {
      setFormData(originalData);
    }
  };

  return (
    <div>
      <h2>Edit Activity</h2>
      <form>
        <div>
          <label>
            Title:
            <input
              type="text"
              value={formData.title}
              onChange={handleChange('title')}
            />
          </label>
        </div>
        <div>
          <label>
            Description:
            <textarea
              value={formData.description}
              onChange={handleChange('description')}
            />
          </label>
        </div>
        <div>
          <button
            type="button"
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          <button type="button" onClick={handleDiscard} disabled={!hasChanges}>
            Discard Changes
          </button>
        </div>
        {hasChanges && (
          <p style={{ color: 'orange' }}>
            ⚠️ You have unsaved changes. They will be lost if you navigate away.
          </p>
        )}
      </form>
    </div>
  );
}
```

## Using React Router

### Basic Routing

```tsx
import { Routes, Route, Navigate } from 'react-router';
import { BrowserRouter } from 'react-router';

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/activities" element={<ActivitiesList />} />
        <Route path="/activities/:id" element={<ActivityDetails />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### Navigation with Links

```tsx
import { Link, useNavigate } from 'react-router';

function Navigation() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Logout logic
    navigate('/login');
  };

  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/activities">Activities</Link>
      <Link to="/settings">Settings</Link>
      <button onClick={handleLogout}>Logout</button>
    </nav>
  );
}
```

### Programmatic Navigation

```tsx
import { useNavigate } from 'react-router';

function CreateActivityButton() {
  const navigate = useNavigate();

  const handleCreate = () => {
    // Create activity logic
    navigate('/activities/123', { replace: false });
  };

  return <button onClick={handleCreate}>Create New Activity</button>;
}
```

### Route Parameters

```tsx
import { useParams } from 'react-router';
import { useEffect } from 'react';
import { useBreadcrum } from '../providers/BreadcrumProvider/BreadcrumProvider';

function ActivityDetails() {
  const { id } = useParams<{ id: string }>();
  const { setTitle } = useBreadcrum();

  useEffect(() => {
    setTitle(`Activity ${id}`);
  }, [id, setTitle]);

  return (
    <div>
      <h2>Activity Details</h2>
      <p>Activity ID: {id}</p>
    </div>
  );
}
```

## Complete Navigation Example

Here's a comprehensive example combining breadcrumbs, navigation blocking, and
routing:

```tsx
import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useParams } from 'react-router';
import { useBlockNavigation } from '../hooks/useBlockNavigation/useBlockNavigation';
import { useBreadcrum } from '../providers/BreadcrumProvider/BreadcrumProvider';

// Navigation Menu Component
function NavigationMenu() {
  const { title } = useBreadcrum();

  return (
    <header>
      <nav>
        <Link to="/">Dashboard</Link>
        <Link to="/activities">Activities</Link>
        <Link to="/settings">Settings</Link>
      </nav>
      <h1>{title}</h1>
    </header>
  );
}

// Dashboard Component
function Dashboard() {
  const { setTitle } = useBreadcrum();

  useEffect(() => {
    setTitle('Dashboard');
  }, [setTitle]);

  return (
    <div>
      <h2>Welcome to Dashboard</h2>
      <Link to="/activities/create">Create New Activity</Link>
    </div>
  );
}

// Activities List Component
function ActivitiesList() {
  const { setTitle } = useBreadcrum();

  useEffect(() => {
    setTitle('Activities');
  }, [setTitle]);

  return (
    <div>
      <h2>Activities List</h2>
      <ul>
        <li>
          <Link to="/activities/1">Activity 1</Link>
        </li>
        <li>
          <Link to="/activities/2">Activity 2</Link>
        </li>
      </ul>
    </div>
  );
}

// Edit Activity Component with Navigation Blocking
function EditActivity() {
  const { id } = useParams<{ id: string }>();
  const { setTitle } = useBreadcrum();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');

  const hasChanges = content !== originalContent;
  useBlockNavigation(hasChanges);

  useEffect(() => {
    setTitle(`Edit Activity ${id}`);
    // Load activity data
    setContent('Initial content');
    setOriginalContent('Initial content');
  }, [id, setTitle]);

  const handleSave = () => {
    // Save logic
    setOriginalContent(content);
    navigate('/activities');
  };

  const handleCancel = () => {
    if (!hasChanges || confirm('Discard changes?')) {
      navigate('/activities');
    }
  };

  return (
    <div>
      <h2>Edit Activity {id}</h2>
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        rows={10}
        cols={50}
      />
      <div>
        <button onClick={handleSave}>Save</button>
        <button onClick={handleCancel}>Cancel</button>
      </div>
      {hasChanges && <p style={{ color: 'orange' }}>Unsaved changes</p>}
    </div>
  );
}

// Settings Component
function Settings() {
  const { setTitle } = useBreadcrum();

  useEffect(() => {
    setTitle('Settings');
  }, [setTitle]);

  return (
    <div>
      <h2>Application Settings</h2>
    </div>
  );
}

// Main App Component
function App() {
  return (
    <div>
      <NavigationMenu />
      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/activities" element={<ActivitiesList />} />
          <Route path="/activities/:id" element={<EditActivity />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
```

## Navigation with Query Parameters

```tsx
import { useSearchParams } from 'react-router';

function SearchableList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const handleSearch = (term: string) => {
    setSearchParams({ q: term });
  };

  return (
    <div>
      <input
        value={query}
        onChange={e => handleSearch(e.target.value)}
        placeholder="Search..."
      />
      <p>Searching for: {query}</p>
    </div>
  );
}
```

## Best Practices

1. **Always set page titles**: Use `setTitle` in a `useEffect` to ensure the
   breadcrumb is updated when the component mounts.

2. **Block navigation carefully**: Only block navigation when absolutely
   necessary (e.g., unsaved form data).

3. **Clear blocking on save**: Remember to disable navigation blocking after
   successfully saving data.

4. **User feedback**: Always show visual feedback when navigation is blocked.

5. **Cleanup effects**: React will automatically clean up the
   `useBlockNavigation` effect, but be mindful of dependencies.

## What's Next?

- Review [Basic Initialization](./01-basic-initialization.md) for the complete
  app setup
- Check [Authentication](./02-authentication.md) for protected routes

## See Also

- [BreadcrumProvider implementation](../apps/Client.Web/src/providers/BreadcrumProvider/BreadcrumProvider.tsx)
- [useBlockNavigation hook](../apps/Client.Web/src/hooks/useBlockNavigation/useBlockNavigation.ts)
- [React Router Documentation](https://reactrouter.com/en/main)

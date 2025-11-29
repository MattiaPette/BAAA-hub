# Data Fetching

This example demonstrates how to fetch data from APIs using the `makeRequest`
helper and TanStack Query (React Query) in the Activity Tracker application.

## Overview

The application provides a `makeRequest` helper for creating HTTP requests and
integrates with TanStack Query for efficient data fetching, caching, and state
management.

## Basic Request with makeRequest

The `makeRequest` helper creates an axios instance configured with a base URL:

```tsx
import { makeRequest } from '../helpers/makeRequest/makeRequest';

// Create a request function
const request = makeRequest({ baseUrl: 'https://api.example.com' });

// Make a GET request
async function fetchUsers() {
  try {
    const response = await request('/users');
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}
```

## Using with Authentication

Include authentication tokens in your requests:

```tsx
import { makeRequest } from '../helpers/makeRequest/makeRequest';
import { useAuth } from '../providers/AuthProvider/AuthProvider';

function useAuthenticatedRequest() {
  const { token } = useAuth();

  const request = makeRequest({
    baseUrl: import.meta.env.VITE_API_URL,
  });

  const authenticatedRequest = async (url: string, config = {}) => {
    return request(url, {
      ...config,
      headers: {
        ...config.headers,
        Authorization: `Bearer ${token?.idToken}`,
      },
    });
  };

  return authenticatedRequest;
}

// Usage
function MyComponent() {
  const request = useAuthenticatedRequest();

  const fetchData = async () => {
    const response = await request('/protected/data');
    return response.data;
  };
}
```

## POST Request Example

Send data to an API endpoint:

```tsx
import { makeRequest } from '../helpers/makeRequest/makeRequest';

const request = makeRequest({ baseUrl: 'https://api.example.com' });

async function createActivity(activityData: {
  title: string;
  description: string;
}) {
  try {
    const response = await request('/activities', {
      method: 'POST',
      data: activityData,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating activity:', error);
    throw error;
  }
}
```

## Using TanStack Query

### Basic Query

Fetch data with caching and automatic refetching:

```tsx
import { useQuery } from '@tanstack/react-query';
import { makeRequest } from '../helpers/makeRequest/makeRequest';

const request = makeRequest({ baseUrl: 'https://api.example.com' });

interface Activity {
  id: string;
  title: string;
  description: string;
  createdAt: string;
}

function ActivitiesList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['activities'],
    queryFn: async () => {
      const response = await request('/activities');
      return response.data as Activity[];
    },
  });

  if (isLoading) return <div>Loading activities...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {data?.map(activity => (
        <li key={activity.id}>
          <h3>{activity.title}</h3>
          <p>{activity.description}</p>
        </li>
      ))}
    </ul>
  );
}
```

### Query with Parameters

Pass parameters to your query:

```tsx
import { useQuery } from '@tanstack/react-query';
import { makeRequest } from '../helpers/makeRequest/makeRequest';

const request = makeRequest({ baseUrl: 'https://api.example.com' });

function ActivityDetails({ activityId }: { activityId: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['activity', activityId],
    queryFn: async () => {
      const response = await request(`/activities/${activityId}`);
      return response.data;
    },
    enabled: !!activityId, // Only run query if activityId is provided
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading activity</div>;
  if (!data) return <div>Activity not found</div>;

  return (
    <div>
      <h2>{data.title}</h2>
      <p>{data.description}</p>
    </div>
  );
}
```

### Mutations

Use mutations for creating, updating, or deleting data:

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { makeRequest } from '../helpers/makeRequest/makeRequest';

const request = makeRequest({ baseUrl: 'https://api.example.com' });

interface CreateActivityData {
  title: string;
  description: string;
}

function CreateActivityForm() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (newActivity: CreateActivityData) => {
      const response = await request('/activities', {
        method: 'POST',
        data: newActivity,
      });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch activities list
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    mutation.mutate({
      title: formData.get('title') as string,
      description: formData.get('description') as string,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="title" placeholder="Activity title" required />
      <textarea name="description" placeholder="Description" required />
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Creating...' : 'Create Activity'}
      </button>
      {mutation.isError && <div>Error: {mutation.error.message}</div>}
      {mutation.isSuccess && <div>Activity created successfully!</div>}
    </form>
  );
}
```

### Update Mutation

Update existing data:

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { makeRequest } from '../helpers/makeRequest/makeRequest';

const request = makeRequest({ baseUrl: 'https://api.example.com' });

function UpdateActivityButton({
  activityId,
  newData,
}: {
  activityId: string;
  newData: { title: string };
}) {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (data: { title: string }) => {
      const response = await request(`/activities/${activityId}`, {
        method: 'PUT',
        data,
      });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate specific activity and list
      queryClient.invalidateQueries({ queryKey: ['activity', activityId] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });

  return (
    <button onClick={() => updateMutation.mutate(newData)}>
      Update Activity
    </button>
  );
}
```

### Delete Mutation

Delete data with optimistic updates:

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { makeRequest } from '../helpers/makeRequest/makeRequest';

const request = makeRequest({ baseUrl: 'https://api.example.com' });

function DeleteActivityButton({ activityId }: { activityId: string }) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await request(`/activities/${activityId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });

  return (
    <button
      onClick={() => deleteMutation.mutate()}
      disabled={deleteMutation.isPending}
    >
      {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
    </button>
  );
}
```

## Error Handling

### Using the getErrorDescription Helper

The app provides a helper to extract error descriptions:

```tsx
import { useQuery } from '@tanstack/react-query';
import { makeRequest } from '../helpers/makeRequest/makeRequest';
import { getErrorDescription } from '../helpers/getErrorDescription/getErrorDescription';

const request = makeRequest({ baseUrl: 'https://api.example.com' });

function DataComponent() {
  const { data, error, isLoading } = useQuery({
    queryKey: ['data'],
    queryFn: async () => {
      const response = await request('/data');
      return response.data;
    },
  });

  if (isLoading) return <div>Loading...</div>;

  if (error) {
    const errorMessage = getErrorDescription(error);
    return <div>Error: {errorMessage}</div>;
  }

  return <div>{/* Render data */}</div>;
}
```

## Advanced: Pagination

Implement paginated data fetching:

```tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { makeRequest } from '../helpers/makeRequest/makeRequest';

const request = makeRequest({ baseUrl: 'https://api.example.com' });

function PaginatedActivities() {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ['activities', page],
    queryFn: async () => {
      const response = await request('/activities', {
        params: {
          page,
          pageSize,
        },
      });
      return response.data;
    },
    keepPreviousData: true, // Keep showing old data while fetching new
  });

  return (
    <div>
      {isLoading && <div>Loading...</div>}
      {error && <div>Error loading activities</div>}
      {data && (
        <>
          <ul>
            {data.items.map(activity => (
              <li key={activity.id}>{activity.title}</li>
            ))}
          </ul>
          <div>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </button>
            <span>Page {page}</span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={!data.hasMore}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
```

## Complete Example

Here's a complete CRUD example:

```tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { makeRequest } from '../helpers/makeRequest/makeRequest';
import { getErrorDescription } from '../helpers/getErrorDescription/getErrorDescription';

const request = makeRequest({ baseUrl: 'https://api.example.com' });

interface Activity {
  id: string;
  title: string;
  description: string;
}

function ActivityManager() {
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const queryClient = useQueryClient();

  // Fetch activities
  const {
    data: activities,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['activities'],
    queryFn: async () => {
      const response = await request('/activities');
      return response.data as Activity[];
    },
  });

  // Create activity
  const createMutation = useMutation({
    mutationFn: async (newActivity: Omit<Activity, 'id'>) => {
      const response = await request('/activities', {
        method: 'POST',
        data: newActivity,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      setNewTitle('');
      setNewDescription('');
    },
  });

  // Delete activity
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await request(`/activities/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });

  const handleCreate = () => {
    createMutation.mutate({ title: newTitle, description: newDescription });
  };

  if (isLoading) return <div>Loading activities...</div>;
  if (error) return <div>Error: {getErrorDescription(error)}</div>;

  return (
    <div>
      <h2>Activities</h2>

      {/* Create form */}
      <div>
        <input
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          placeholder="Title"
        />
        <input
          value={newDescription}
          onChange={e => setNewDescription(e.target.value)}
          placeholder="Description"
        />
        <button onClick={handleCreate} disabled={createMutation.isPending}>
          {createMutation.isPending ? 'Creating...' : 'Create'}
        </button>
      </div>

      {/* Activities list */}
      <ul>
        {activities?.map(activity => (
          <li key={activity.id}>
            <h3>{activity.title}</h3>
            <p>{activity.description}</p>
            <button
              onClick={() => deleteMutation.mutate(activity.id)}
              disabled={deleteMutation.isPending}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## What's Next?

- Explore [Navigation and Routing](./05-navigation-and-routing.md)

## See Also

- [makeRequest implementation](../apps/Client.Web/src/helpers/makeRequest/makeRequest.ts)
- [getErrorDescription helper](../apps/Client.Web/src/helpers/getErrorDescription/getErrorDescription.ts)
- [TanStack Query Documentation](https://tanstack.com/query/latest/docs/react/overview)

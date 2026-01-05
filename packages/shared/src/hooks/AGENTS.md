# Hooks

Custom React hooks for reusable logic across the application.

## Organization

Hooks are organized by domain:

| Directory | Purpose |
|-----------|---------|
| `auth/` | Authentication hooks |
| `bookmark/` | Bookmark operations |
| `feed/` | Feed data and interactions |
| `post/` | Post operations |
| `comments/` | Comment operations |
| `notifications/` | Notification settings |
| `search/` | Search functionality |
| `source/` | Source/squad operations |
| `squads/` | Squad-specific hooks |
| `vote/` | Voting operations |
| `log/` | Analytics logging |
| Root level | General-purpose hooks |

## Naming Convention

```
use[Domain][Action].ts

Examples:
- useBookmarkPost.ts
- useFeedSettings.ts
- usePostById.ts
- useShareComment.ts
```

## TanStack Query Patterns

Most data-fetching hooks use TanStack Query v5.

**Note**: TanStack Query v5 uses `isPending` (not `isLoading` for mutations).

### Typed Query Options Pattern (Recommended)

We use **query options creator functions** for type-safe, reusable query definitions. This approach provides better DX, automatic type inference, and reusability across queries, mutations, SSR, and cache operations.

#### Why Creator Functions?

The old pattern of creating custom hooks for each query had several problems:
- Required creating prop types and return types manually
- Query keys had to be recreated in different places
- Options passed to `useQuery` manually, risking overwrites
- Not type-friendly - changes to options weren't reflected when using the same query key elsewhere

With creator functions, we define a single function and let type inference handle the rest.

#### Query Options Creator

Instead of creating a custom hook, define a creator function:

```typescript
// ✅ New pattern: Creator function
export const postByIdQueryOptions = ({ id }: { id: string }) => {
  return {
    queryKey: getPostByIdKey(id),
    queryFn: async () => {
      // query fn
      return res;
    },
    staleTime: StaleTime.Default,
    enabled: !!id,
  };
};

// Usage - directly with useQuery
const { data } = useQuery(postByIdQueryOptions({ id: 'cm3ESwd2I' }));
```

All types are automatically inferred by `useQuery` - no manual type definitions needed.

#### Overriding Options

Pass additional options directly to `useQuery`:

```typescript
const { data } = useQuery({
  ...postByIdQueryOptions({ id: 'cm3ESwd2I' }),
  staleTime: StaleTime.OneHour,
});
```

#### Reusability Benefits

The creator function can be reused anywhere:

```typescript
// Get query key
postByIdQueryOptions({ id: 'cm3ESwd2I' }).queryKey

// Prefetch in SSR
await postByIdQueryOptions({ id: 'cm3ESwd2I' }).queryFn()

// Pass to QueryClient
queryClient.prefetchQuery(postByIdQueryOptions({ id: 'cm3ESwd2I' }))
```

### Mutation Options Creator

Follow the same pattern for mutations:

```typescript
// Define mutation options
export const awardMutationOptions = () => {
  return {
    mutationKey: ['awards'],
    mutationFn: award,
  };
};

// Usage
const { mutate: awardMutation } = useMutation({
  ...awardMutationOptions(),
});

// With custom onSuccess
const { mutate: awardMutation } = useMutation({
  ...awardMutationOptions(),
  onSuccess: async (result) => {
    // handle success
  },
});
```

### useUpdateQuery - Type-Safe Cache Updates

`useUpdateQuery` provides type-safe methods to get and update cached query data. It accepts the same creator function as `useQuery`.

```typescript
const [getPost, setPost] = useUpdateQuery(
  postByIdQueryOptions({ id: 'cm3ESwd2I' }),
);
```

Returns two methods:
- `getPost()` - Get current cached data (auto-cloned with `structuredClone`)
- `setPost(data)` - Update cached data

Both methods are automatically typed based on the creator function.

#### Before (Manual QueryClient)

```typescript
// ❌ Old pattern: Manual typing, reference concerns
const queryClient = useQueryClient();

const { mutate: awardMutation } = useMutation({
  ...awardMutationOptions(),
  onSuccess: async (result) => {
    const currentPost = queryClient.getQueryData<PostData>(getPostByIdKey(id));
    if (!currentPost?.post) {
      return;
    }
    queryClient.setQueryData<PostData>(getPostByIdKey(id), (node) => {
      return {
        post: {
          ...node.post,
          numAwards: node.post.numAwards + 1,
          userState: { ...node.post.userState, awarded: true },
        },
      };
    });
  },
});
```

#### After (useUpdateQuery)

```typescript
// ✅ New pattern: Type-safe, clean
const [getPost, setPost] = useUpdateQuery(
  postByIdQueryOptions({ id: 'cm3ESwd2I' }),
);

const { mutate: awardMutation } = useMutation({
  ...awardMutationOptions(),
  onSuccess: async () => {
    const post = getPost(); // Auto-cloned, typed
    post.post.numAwards += 1;
    post.post.userState.awarded = true;
    setPost(post);
  },
});
```

### useQuerySubscription - Type-Safe Event System

Subscribe to mutations executed anywhere in the app (cross-component communication). Accepts the same creator function pattern for automatic typing.

```typescript
useQuerySubscription(({ variables }) => {
  // variables are fully typed based on mutationFn signature
  console.log(variables.entityId);
}, awardMutationOptions());
```

#### Combined with useUpdateQuery

```typescript
const [getPost, setPost] = useUpdateQuery(
  postByIdQueryOptions({ id: 'cm3ESwd2I' }),
);

useQuerySubscription(({ variables }) => {
  const post = getPost();
  
  // Skip posts we don't care about
  if (post.post.id !== variables.entityId) {
    return;
  }
  
  post.post.numAwards += 1;
  post.post.userState.awarded = true;
  setPost(post);
}, awardMutationOptions());
```

#### Event System Pattern

This creates a type-safe event system for data synchronization:

1. **Mutations** - Publish events when data changes
2. **Query subscriptions** - Listen for changes across components
3. **Update query** - Sync local component data with global query state

### Infinite Query Hook
```typescript
import { useInfiniteQuery } from '@tanstack/react-query';

export function useFeedPosts() {
  return useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: ({ pageParam }) => fetchFeed(pageParam),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
  });
}
```

## Common Hook Patterns

### Feature Flag Hook
```typescript
export function useConditionalFeature({ feature, shouldEvaluate }) {
  // Returns { value, isLoading } for GrowthBook feature flags
}
```

### Debounced Value
```typescript
import { useDebounce } from './useDebounce';

const debouncedSearch = useDebounce(searchTerm, 300);
```

### Event Listener
```typescript
import { useEventListener } from './useEventListener';

useEventListener('scroll', handleScroll);
```

## Analytics Logging Patterns

### useLogEventOnce - One-Time Event Logging

Use `useLogEventOnce` for logging events that should fire exactly once (e.g., impressions, form open tracking). This hook follows React best practices by using refs to track logged state, avoiding `eslint-disable` comments for empty dependency arrays.

```typescript
import useLogEventOnce from './log/useLogEventOnce';
import { LogEvent } from '../lib/log';

// Log once on mount
useLogEventOnce(() => ({
  event_name: LogEvent.StartAddExperience,
  target_type: type,
}));

// Log once when condition becomes true
useLogEventOnce(
  () => ({
    event_name: LogEvent.StartAddExperience,
    target_type: type,
  }),
  { condition: isNewExperience }
);
```

**Why use this hook?**
- ✅ No `eslint-disable` comments needed
- ✅ Uses refs to track if already logged (survives re-renders)
- ✅ Supports conditional logging via `condition` option
- ✅ Getter function captures values at log time (no stale closures)
- ✅ Works correctly with React Strict Mode

**When to use:**
- Impression events (page views, component visibility)
- Form initialization tracking ("start add X" events)
- Any event that should fire exactly once per component mount

#### ❌ Don't use useEffect with empty deps

```typescript
// Bad: requires eslint-disable, doesn't capture latest values
useEffect(() => {
  logEvent({ event_name: LogEvent.Impression });
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
```

#### ✅ Use useLogEventOnce instead

```typescript
// Good: proper dependency tracking, no lint suppression
useLogEventOnce(() => ({
  event_name: LogEvent.Impression,
  target_type: someValue, // captured at log time
}));
```

## Creating Custom Hooks

Most custom hooks contain specific parts of business logic as public API for other components and hooks to consume. They often mimic part of specific business logic or are tied to bigger features.

### Feature Hooks

Feature hooks encapsulate business logic and expose it through a return object. Examples:

| Hook | Purpose |
|------|---------|
| `useFeed` | All business logic for fetching and managing feeds |
| `useLogin` / `useRegistration` | Login and registration actions |
| `useLazyModal` | Functions to open/close modals across the app |
| `useChecklist` | Manage onboarding checklists for users |

#### Usage Pattern

Use feature hooks by destructuring the return object:

```typescript
// Using a function from the hook
const { onToggleStep } = useChecklist({ steps });
// ...
<Button onClick={onToggleStep}>Toggle</Button>

// Using data in useEffect
const { isDone } = useChecklist({ steps });
useEffect(() => {
  if (isDone) {
    // do something when checklist is done
  }
}, [isDone]);

// Passing data to child components
const { completedSteps } = useChecklist({ steps });
// ...
<CompletedSteps data={completedSteps} />
```

#### ✅ Pass only needed props

```typescript
const { completedSteps, isDone } = useChecklist({ steps });
// ...
<CompletedSteps data={completedSteps} isDone={isDone} />
```

#### ❌ Don't pass the whole hook return object

```typescript
const checklist = useChecklist({ steps });
// ...
<CompletedSteps checklist={checklist} />
```

If you need multiple properties or don't know which are needed, move the hook into the child component and use it directly there.

### Memoization Strategy

**Memoize individual values inside the hook, NOT the return object.**

Since we use destructuring to consume feature hooks, each returned value must be properly memoized to avoid unnecessary re-renders or infinite loops (in `useEffect`).

#### ✅ Fine-grained memoization

```typescript
const useChecklist = ({ steps }) => {
  const [openStep, setOpenStep] = useState(activeStep);
  
  const completedSteps = useMemo(() => {
    return steps.filter((step) => !!step.action.completedAt);
  }, [steps]);

  return {
    openStep,
    completedSteps,
    setOpenStep,
  };
};
```

With this approach, the filter callback executes only when `steps` changes.

#### ❌ Don't memoize the return object

```typescript
const useChecklist = ({ steps }) => {
  const [openStep, setOpenStep] = useState<string>(activeStep);
  
  return useMemo({
    openStep,
    completedSteps: steps.filter((step) => !!step.action.completedAt),
    setOpenStep,
  }, [openStep, completedSteps]);
};
```

This causes the filter callback to execute when `steps` OR `openStep` changes, resulting in unnecessary computation.

### Other Custom Hooks

Simpler hooks for data transformations or utility functions can memoize their return value. These hooks should do or return exactly one thing.

If you need to add another responsibility to a simple hook, consider:
1. Creating a new feature hook to abstract business logic
2. Splitting into multiple smaller hooks
3. Consulting with the team

### Creating a New Hook Checklist

1. Determine the domain - does it fit an existing directory?
2. Name it `use[Domain][Action].ts`
3. Use TanStack Query for server state
4. Keep hooks focused - one responsibility per hook
5. For feature hooks: memoize individual returned values, not the return object
6. For simple hooks: can memoize the return value directly

### Example Feature Hook

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { gqlClient } from '../graphql/common';
import { UPVOTE_MUTATION } from '../graphql/posts';

interface UseUpvotePostProps {
  onSuccess?: () => void;
}

export function useUpvotePost({ onSuccess }: UseUpvotePostProps = {}) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (postId: string) =>
      gqlClient.request(UPVOTE_MUTATION, { id: postId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post'] });
      onSuccess?.();
    },
  });

  // Return individual values - no need to memoize since useMutation handles it
  return { upvote: mutate, isPending };
}
```

## Testing Hooks

Use `@testing-library/react` with `renderHook`:

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';

it('should fetch data', async () => {
  const { result } = renderHook(() => useMyHook(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    ),
  });

  await waitFor(() => expect(result.current.data).toBeDefined());
});
```

## Form Hooks Pattern

For forms with validation, combine `react-hook-form` + Zod + mutations:

```typescript
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';

const schema = z.object({
  title: z.string().min(1, 'Required'),
});

export function useMyForm(defaultValues) {
  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: saveData,
    onSuccess: () => methods.reset(),
  });

  return { methods, save: mutate, isPending };
}
```

Use `useDirtyForm` hook to handle unsaved changes warnings.

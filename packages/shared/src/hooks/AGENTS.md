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

Most data-fetching hooks use TanStack Query v5:

### Query Hook
```typescript
import { useQuery } from '@tanstack/react-query';
import { generateQueryKey, RequestKey } from '../lib/query';

export function usePostById(id: string) {
  return useQuery({
    queryKey: generateQueryKey(RequestKey.Post, null, id),
    queryFn: () => fetchPost(id),
    enabled: !!id,
  });
}
```

### Mutation Hook
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useBookmarkPost() {
  const queryClient = useQueryClient();
  
  const { mutate, mutateAsync, isPending } = useMutation({
    mutationFn: (postId: string) => bookmarkPost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });

  return { bookmark: mutate, isPending };
}
```

**Note**: TanStack Query v5 uses `isPending` (not `isLoading` for mutations).

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

## Creating a New Hook

1. Determine the domain - does it fit an existing directory?
2. Name it `use[Domain][Action].ts`
3. Use TanStack Query for server state
4. Keep hooks focused - one responsibility per hook

### Example Hook
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { gqlClient } from '../graphql/common';
import { UPVOTE_MUTATION } from '../graphql/posts';

interface UseUpvotePostProps {
  onSuccess?: () => void;
}

export function useUpvotePost({ onSuccess }: UseUpvotePostProps = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) =>
      gqlClient.request(UPVOTE_MUTATION, { id: postId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post'] });
      onSuccess?.();
    },
  });
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

## Jotai for Local State

For UI state that doesn't need server sync:

```typescript
import { atom, useAtom } from 'jotai';

const sidebarOpenAtom = atom(false);

export function useSidebar() {
  const [isOpen, setIsOpen] = useAtom(sidebarOpenAtom);
  return { isOpen, toggle: () => setIsOpen((v) => !v) };
}
```

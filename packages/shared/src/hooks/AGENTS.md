# Hooks

Custom hooks organized by domain directory (`post/`, `feed/`, `vote/`, `log/`, ...), named `use[Domain][Action].ts`.

## Query/Mutation Options Creators (project convention)

Instead of one custom hook per query, define an options creator function and spread it into `useQuery`/`useMutation`. Types are inferred, keys stay in one place, and the creator is reusable for prefetching, cache access, and SSR:

```typescript
export const postByIdQueryOptions = ({ id }: { id: string }) => ({
  queryKey: getPostByIdKey(id),
  queryFn: async () => { /* ... */ },
  staleTime: StaleTime.Default,
  enabled: !!id,
});

const { data } = useQuery({ ...postByIdQueryOptions({ id }), staleTime: StaleTime.OneHour });
```

Two custom utilities build on this pattern (hard to discover, prefer them over manual `queryClient` work):

- `useUpdateQuery(creatorOptions)` returns `[get, set]` for type-safe cache reads/writes (get auto-clones via `structuredClone`).
- `useQuerySubscription(callback, mutationOptions)` subscribes to mutations fired anywhere in the app, with typed `variables`. Combine both to sync local data when another component mutates.

## Memoization (lesson from re-render/infinite-loop bugs)

Feature hooks are consumed by destructuring, so **memoize individual returned values inside the hook, never the whole return object**. Memoizing the return object couples unrelated values and recomputes on every state change.

Pass child components only the specific values they need; if a child needs many, move the hook call into the child instead of passing the whole return object down.

## Analytics Logging

- Put the primary identifier (name/title/id of the subject) in `target_id`, not inside `extra`. `extra` is for supplementary context only, always `JSON.stringify`ed.
- Logging helpers must never throw inside mutation `onSuccess` paths. If backend-optional fields are missing, still emit the event with what's available; don't drop the event or reach for broad casts like `as Post`.
- For fire-exactly-once events (impressions, "start add X"), use `useLogEventOnce` (`hooks/log/useLogEventOnce.ts`) instead of `useEffect` with empty deps: no eslint-disable, survives Strict Mode, supports a `condition` option, and captures values at log time.

## Misc

- Use `useDirtyForm` for unsaved-changes warnings in forms.
- Keep hooks single-responsibility; split rather than growing a simple hook into a second concern.

# Hooks

- Queries are defined as options-creator functions (`xQueryOptions(...)`, see `graphql/keywords.ts`) spread into `useQuery`, not as one custom hook per query. Two utilities build on them and beat manual `queryClient` work: `useUpdateQuery(creatorOptions)` returns `[get, set]` for typed cache reads/writes, and `useQuerySubscription(callback, mutationOptions)` reacts to mutations fired anywhere in the app.
- Feature hooks are consumed by destructuring, so memoize individual returned values, never the whole return object. Pass children only the values they need; if a child needs most of them, move the hook call into the child.
- Analytics: the subject's identifier goes in `target_id`, not inside `extra` (`extra` is supplementary context, always `JSON.stringify`ed). Logging helpers must never throw inside mutation `onSuccess`; emit with what is available rather than dropping the event or casting broadly. Fire-exactly-once events (impressions, "start add X") use `log/useLogEventOnce.ts`, not an empty-deps `useEffect`.
- Unsaved-changes warnings in forms use `useDirtyForm`.

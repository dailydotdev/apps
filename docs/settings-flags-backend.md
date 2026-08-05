# Making a sidebar preference server-backed

Two v2 sidebar preferences — **compact rail** and the **pinned shortcuts dock** —
are meant to follow the account across devices. The client already writes them
through the normal settings path; they are held in local storage today *only*
because `daily-api` has no field for them yet.

This doc is the handoff: what to add on the API side, and what happens on the
client when you do.

## Why they aren't server-backed yet

`updateUserSettings` takes `flags: SettingsFlagsPublicInput`, and that input type
declares every accepted key one by one. GraphQL rejects an undeclared key, and
because the client sends the *whole* settings object on every write, a single
unknown flag fails the entire mutation — which silently breaks the persistence
of every other setting in the same payload, not just the new one.

So the client keeps a short list of flags the API doesn't know
(`clientOnlySettingsFlags` in `packages/shared/src/graphql/settings.ts`),
persists those in local storage, and strips them from the remote payload.

Two consequences of that stopgap, both of which disappear on graduation:

- the store is keyed by account (`…:clientOnlyFlags:<userId>`, `:anonymous`
  signed out) so a second login on the same device doesn't inherit the first
  one's rail density and dock. The pre-per-account entry (`:global`) is handed
  to the first signed-in account that loads and then deleted;
- a write whose changed keys are *all* client-only skips `updateUserSettings`
  entirely. The payload would be byte-identical to the previous one, and a
  reorder drag in the dock fires several in a burst.

## What the API needs

Add these to `SettingsFlagsPublicInput` (and to the `SettingsFlags` type backing
the `settings.flags` jsonb column). Both are per-user preferences with no
server-side behaviour — store and return them verbatim.

| Field | GraphQL type | Shape | Default |
| --- | --- | --- | --- |
| `sidebarCompact` | `Boolean` | `true` = icon-only rail, `false`/absent = icons with labels | absent |
| `sidebarShortcuts` | `JSONObject` (array payload) or a dedicated JSON scalar | `SidebarShortcut[]`, in dock order | absent |

`SidebarShortcut` (see `packages/shared/src/features/shortcuts/types.ts`) is a
union, so entries are heterogeneous:

```jsonc
[
  "tags",                                              // a catalog id
  { "title": "Squad", "path": "/squads/dev", "image": "https://…" } // a pinned page
]
```

- Max 12 entries (`MAX_SHORTCUTS`); rejecting longer arrays is fine, the client
  enforces it too.
- Entry validity (unknown catalog ids, missing `path`) is healed client-side —
  no server validation needed beyond shape/size.
- `image` is optional.

Two flags already in the client's `SettingsFlags` are in the same position and
can be added in the same pass if convenient: `sidebarPinnedExpanded` and
`sidebarRecentExpanded` (both `Boolean`, sidebar section collapse state).

## What the client does when the field lands

Delete the flag's entry from `clientOnlySettingsFlags`. That is the whole
client-side change:

- the provider stops stripping it, so it ships with every settings write;
- `SettingsContextProvider` runs a one-time migration on the next load for each
  user — it takes the value already in their local storage, writes it to the
  API (server value wins if one already exists), and drops that one key
  locally, leaving the flags that haven't graduated in place. Nobody loses a
  preference in the switchover.

The migration waits for `isRemoteSettingsLoaded`, not `loadedSettings`. The
latter only says a cached boot exists; "the server has no value for this flag"
has to be read off the response, or a value set on another device looks absent
and this device's leftover overwrites it. `useLegacyShortcutsMigration` in
`SidebarShortcutsDock.tsx` waits on the same signal for the same reason.

Regression cover lives in `packages/shared/src/contexts/BootProvider.spec.tsx`
("should keep client-only flags out of a real settings write", "should store a
client-only flag locally without calling the API" and "should push a flag the
API has learned to store up to the server").

## Note on the dock's previous storage

The shortcuts dock used to live in IndexedDB under `sidebar_shortcuts`.
`useLegacyShortcutsMigration` in `SidebarShortcutsDock.tsx` lifts an existing
local dock into settings once, then clears the IndexedDB entry — so by the time
the API field lands, users' pins are already in the settings payload. That hook
can be deleted once enough time has passed for active users to have loaded the
app at least once.

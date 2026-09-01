# Sidebar settings flags

The v2 sidebar preferences are server-backed through `settings.flags`:

| Field                   | Shape                                                | Default |
| ----------------------- | ---------------------------------------------------- | ------- |
| `sidebarCompact`        | `true` = icon-only rail, `false` = icons with labels | `true`  |
| `sidebarShortcuts`      | `SidebarShortcut[]`, in dock order                   | absent  |
| `sidebarPinnedExpanded` | collapse state for the pinned section                | `true`  |
| `sidebarRecentExpanded` | collapse state for the recent section                | `true`  |

`SidebarShortcut` is either a catalog id or a pinned page:

```jsonc
[
  "tags",
  {
    "title": "Squad",
    "path": "https://app.daily.dev/squads/dev",
    "image": "https://..."
  }
]
```

The API accepts `sidebarShortcuts` as GraphQL `JSON`, not `JSONObject`, because
the value is an array.

## Legacy migration

Earlier v2 builds stored these flags locally under
`dailydev:settings:clientOnlyFlags:<userId>`. The frontend still reads that
store once after remote boot settings have been applied:

- values missing from the server are written to `updateUserSettings`;
- server values win when the same flag already exists remotely;
- the local key is removed only after the migration write succeeds.

The shortcuts dock also has an older IndexedDB store, `sidebar_shortcuts`.
`useLegacyShortcutsMigration` lifts that dock into
`settings.flags.sidebarShortcuts` once, then clears IndexedDB after the settings
write succeeds.

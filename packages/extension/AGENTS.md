# Browser Extension

- There is no router. `newtab/App.tsx` is a single shell; navigation is `setCurrentPage` state from `ExtensionContext`, and full-screen views are conditionally rendered there one at a time. Anything smaller is a component inside a view.
- Changing `src/manifest.json` permissions forces every user to re-approve the extension on update.
- When loading the unpacked build (`dist/chrome`), disable the production extension first or the two conflict.

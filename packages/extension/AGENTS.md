# Browser Extension

Chrome/Edge/Opera extension, built with Rspack (`rspack.config.js`), `webextension-polyfill` for cross-browser APIs.

## No Router (key architecture fact)

The extension has **no traditional routing**. `newtab/App.tsx` is a single shell; "navigation" is React state via `ExtensionContext` (`setCurrentPage('/my-feed')`), and views (`MainFeedPage`, `ExtensionOnboarding`, `ExtensionPermissionsPrompt`) are conditionally rendered, one at a time. To add a full-screen view: create the component, add conditional rendering in `App.tsx`, navigate with `setCurrentPage`. Anything smaller (modal, banner, widget) is just a component inside a view.

Surfaces: `newtab/` (main app, replaces the new tab page), `companion/` (widget injected alongside web pages), `background/` (service worker), `content/` (injected scripts).

## Development

```bash
pnpm --filter extension dev:chrome
```

Load unpacked from `packages/extension/dist/chrome` via `chrome://extensions` (Developer mode), and disable the production extension to avoid conflicts.

## Gotchas

- Changes to `src/manifest.json` permissions require user re-approval of the extension.
- Import `browser` from `webextension-polyfill` rather than using `chrome.*` directly.

# Browser Extension

Chrome and Opera browser extension for daily.dev.

## Tech Stack

- **Webpack** for bundling
- **webextension-polyfill** for cross-browser compatibility
- **React** for UI components

## Directory Structure

```
extension/
├── src/
│   ├── background/      # Service worker / background script
│   ├── newtab/          # New tab page
│   ├── companion/       # Companion widget (side panel)
│   ├── content/         # Content scripts
│   ├── contexts/        # Extension-specific contexts
│   ├── lib/             # Extension utilities
│   └── manifest.json    # Extension manifest
├── webpack.config.js    # Build configuration
└── dist/                # Build output (gitignored)
    ├── chrome/
    └── opera/
```

## Extension Architecture

### New Tab (`newtab/`)
The main daily.dev experience - replaces browser's new tab page.

```
newtab/
├── App.tsx             # Main app component
├── index.tsx           # Entry point
├── MainFeedPage.tsx    # Feed page
├── ShortcutLinks/      # Customizable shortcuts
└── DndModal.tsx        # Do Not Disturb mode
```

### Companion (`companion/`)
A widget that appears alongside web pages to show related content.

```
companion/
├── Companion.tsx           # Main companion component
├── CompanionContent.tsx    # Content display
├── CompanionDiscussion.tsx # Discussion view
├── companionFetch.tsx      # Data fetching
└── useCompanionActions.ts  # Actions hook
```

### Background (`background/`)
Service worker for extension lifecycle, messaging, and background tasks.

### Content (`content/`)
Scripts injected into web pages (for companion functionality).

## Development

```bash
# Chrome development
pnpm --filter extension dev:chrome

# Opera development
pnpm --filter extension dev:opera

# Build for Chrome
pnpm --filter extension build:chrome

# Build for Opera
pnpm --filter extension build:opera
```

### Loading Unpacked Extension

1. Run `pnpm --filter extension dev:chrome`
2. Open Chrome → `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select `packages/extension/dist/chrome`
6. Disable the production extension to avoid conflicts

## Cross-Browser Compatibility

Use `webextension-polyfill` for browser APIs:

```typescript
import browser from 'webextension-polyfill';

// Works in Chrome and Firefox/Opera
browser.storage.local.get('key');
browser.tabs.query({ active: true });
```

## Extension vs Shared

**Put in extension when:**
- It uses browser extension APIs
- It's specific to extension UI (newtab, companion)
- It needs access to `webextension-polyfill`

**Put in shared when:**
- It's a general React component
- It could be used in webapp too
- It doesn't depend on extension APIs

## Extension Context

Extension-specific context for extension state:

```typescript
import { useExtensionContext } from '../contexts/ExtensionContext';

function MyComponent() {
  const { isExtension } = useExtensionContext();
  // ...
}
```

## Manifest

The extension manifest (`src/manifest.json`) defines:
- Permissions
- Content scripts
- Background service worker
- New tab override

Changes to permissions require user re-approval.

## Testing

```bash
pnpm --filter extension test
```

Tests focus on component behavior, mocking browser APIs as needed.

## Common Patterns

### Background Communication
```typescript
import browser from 'webextension-polyfill';

// Send message from content/newtab to background
browser.runtime.sendMessage({ type: 'ACTION', payload: data });

// Listen in background
browser.runtime.onMessage.addListener((message) => {
  if (message.type === 'ACTION') {
    // Handle
  }
});
```

### Storage
```typescript
import browser from 'webextension-polyfill';

// Get
const { key } = await browser.storage.local.get('key');

// Set
await browser.storage.local.set({ key: value });
```

# Browser Extension

Chrome, Opera and Edge browser extensions for daily.dev.

## Tech Stack

- **Webpack** for bundling
- **webextension-polyfill** for cross-browser compatibility
- **React** for UI components

## Directory Structure

```
extension/
├── src/
│   ├── background/      # Service worker / background script
│   ├── newtab/          # New tab override (main app)
│   ├── companion/       # Companion widget (side panel)
│   ├── content/         # Content scripts
│   ├── contexts/        # Extension-specific contexts
│   ├── lib/             # Extension utilities
│   └── manifest.json    # Extension manifest
└── webpack.config.js    # Build configuration
```

## Extension Architecture

**Important:** The extension does NOT use traditional routing. There's a single `App.tsx` that acts as the shell, and "navigation" is handled via React state through `ExtensionContext`. Different views are conditionally rendered based on this state.

### State-Based Navigation

```typescript
// In App.tsx - state controls the current "page"
const [currentPage, setCurrentPage] = useState<string>('/');

// Views are conditionally rendered based on state:
// - ExtensionPermissionsPrompt (if host permissions not granted)
// - ExtensionOnboarding (if user not onboarded)
// - MainFeedPage (the main experience)

// To "navigate", components call:
setCurrentPage('/my-feed');  // Updates state, no actual routing
```

### New Tab (`newtab/`)
The main daily.dev experience - replaces browser's new tab page.

```
newtab/
├── App.tsx             # Root shell - wraps everything in providers
├── index.tsx           # Entry point
├── MainFeedPage.tsx    # Main view (feed layout + navigation)
├── ShortcutLinks/      # Customizable shortcuts component
├── DndBanner.tsx       # Do Not Disturb banner component
└── DndModal.tsx        # Do Not Disturb modal component
```

**Views vs Components in newtab:**
| Type | Examples | Purpose |
|------|----------|---------|
| **Shell** | `App.tsx` | Single root, provides context, conditionally renders views |
| **Views** | `MainFeedPage`, `ExtensionOnboarding`, `ExtensionPermissionsPrompt` | Top-level UI states, only one active at a time |
| **Components** | `ShortcutLinks`, `DndModal`, `DndBanner` | Reusable pieces rendered within views |

### Companion (`companion/`)
A widget that appears alongside web pages to show related content.

```
companion/
├── Companion.tsx           # Root companion component
├── CompanionContent.tsx    # Content display component
├── CompanionDiscussion.tsx # Discussion view component
├── companionFetch.tsx      # Data fetching utilities
└── useCompanionActions.ts  # Actions hook
```

### Background (`background/`)
Service worker for extension lifecycle, messaging, and background tasks.

### Content (`content/`)
Scripts injected into web pages (for companion functionality).

## Development

```bash
# Chrome and Edge development
pnpm --filter extension dev

# Build for Chrome and Edge
pnpm --filter extension build
```

### Loading Unpacked Extension

1. Run `pnpm --filter extension dev:chrome`
2. Open Chrome → `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select `packages/extension/dist/chrome`
6. Disable the production extension to avoid conflicts

## Cross-Browser Compatibility

Use `webextension-polyfill` for Manifest V3 APIs:

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

## When to Create a View vs Component

Since the extension uses state-based navigation, understand the difference:

**Create a new View when:**
- It represents a distinct full-screen experience (like onboarding)
- It should replace the current UI entirely
- It needs to be tracked as a "page" for analytics
- Example: A new permissions screen, a settings view

**Create a Component when:**
- It's a piece of UI within an existing view
- It can be reused across views
- It's a modal, banner, button, or widget
- Example: A new shortcut type, a notification badge

**Adding a new View:**
1. Create the component (e.g., `MyNewView.tsx`)
2. Add conditional rendering in `App.tsx` based on state
3. Use `setCurrentPage` from `ExtensionContext` to navigate to it

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

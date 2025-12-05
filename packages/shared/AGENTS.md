# Shared Package

The shared package (`@dailydotdev/shared`) contains all code shared between the webapp and browser extension. This is the heart of the codebase.

## Directory Structure

```
src/
├── components/    # React components (see components/AGENTS.md)
├── features/      # Complex features with multiple files (see features/AGENTS.md)
├── hooks/         # Custom React hooks (see hooks/AGENTS.md)
├── graphql/       # GraphQL queries, mutations, fragments (see graphql/AGENTS.md)
├── contexts/      # React Context providers (see contexts/AGENTS.md)
├── lib/           # Utility functions and helpers
├── styles/        # Global CSS and style utilities
└── svg/           # SVG-related utilities
```

## Import Pattern

Always import from the source path:
```typescript
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import { useBookmarkPost } from '@dailydotdev/shared/src/hooks';
import { POST_BY_ID_QUERY } from '@dailydotdev/shared/src/graphql/posts';
```

## When to Add Code Here

Add code to shared when:
- It's used by both webapp AND extension
- It's a reusable UI component
- It's a hook that encapsulates common logic
- It's a GraphQL operation used across platforms

Keep code in webapp/extension when:
- It's platform-specific (e.g., extension permissions, Next.js pages)
- It uses platform-specific APIs
- It's a one-off component for a specific page

## Key Directories

### `lib/` - Utilities
General-purpose utilities: date formatting, string manipulation, auth helpers, etc.
```
lib/
├── auth.ts        # Authentication utilities
├── date.ts        # Date manipulation
├── dateFormat.ts  # Date formatting
├── links.ts       # URL/link utilities
├── func.ts        # General function utilities
└── ...
```

### `styles/` - Global Styles
CSS files and style constants. Prefer Tailwind utilities over adding new CSS.

## Testing

Tests use Jest + React Testing Library. Test files live next to source files:
```
components/
├── Button.tsx
├── Button.spec.tsx  # Test file
```

Run tests:
```bash
pnpm --filter shared test
```

Write tests that validate functionality - focus on user interactions, not implementation details.

## Scripts

```bash
pnpm --filter shared lint      # Run ESLint
pnpm --filter shared lint:fix  # Fix lint issues
pnpm --filter shared test      # Run Jest tests
```

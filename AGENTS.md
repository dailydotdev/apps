# AGENTS.md

This file provides guidance to AI coding agents when working with code in this repository.

## Development Philosophy

We're a startup. We move fast, iterate quickly, and embrace change. When implementing features:
- Favor pragmatic solutions over perfect architecture
- Code will likely change - don't over-engineer
- A/B experiments are common (GrowthBook integration)
- Test coverage isn't a goal - write tests that validate functionality, not hit metrics

## Project Architecture

This is a pnpm monorepo containing the daily.dev application suite:

| Package | Purpose |
|---------|---------|
| `packages/webapp` | Next.js web application (main daily.dev site) |
| `packages/extension` | Browser extension (Chrome/Opera) built with Webpack |
| `packages/shared` | Shared React components, hooks, utilities, and design system |
| `packages/storybook` | Component documentation and development environment |
| `packages/eslint-config` | Shared ESLint configuration |
| `packages/eslint-rules` | Custom ESLint rules including color consistency enforcement |
| `packages/prettier-config` | Shared Prettier configuration |

## Technology Stack

- **Node.js v22.11** (see `package.json` `volta` and `packageManager` properties, also `.nvmrc`)
- **pnpm 9.14.4** for package management (see `package.json` `packageManager` property)
- **TypeScript** across all packages
- **React 18.3.1** with Next.js 15 for webapp (Pages Router, NOT App Router/Server Components)
- **TanStack Query v5** for server state and data fetching
- **GraphQL** with graphql-request for API communication
- **Tailwind CSS** with custom design system
- **Jest** for testing
- **GrowthBook** for feature flags and A/B experiments

## Commonly Used Imports

### Components
```typescript
// Buttons (variants: Primary, Secondary, Tertiary, Float, Subtle, Option, Quiz)
import { Button, ButtonVariant, ButtonSize } from '@dailydotdev/shared/src/components/buttons/Button';
import { ClickableText } from '@dailydotdev/shared/src/components/buttons/ClickableText';

// Typography
import { Typography, TypographyType, TypographyColor } from '@dailydotdev/shared/src/components/typography/Typography';

// Form Fields
import { TextField } from '@dailydotdev/shared/src/components/fields/TextField';
import { Switch } from '@dailydotdev/shared/src/components/fields/Switch';
import { Checkbox } from '@dailydotdev/shared/src/components/fields/Checkbox';
import { Radio } from '@dailydotdev/shared/src/components/fields/Radio';

// Layout & Utilities
import { FlexCol, FlexRow } from '@dailydotdev/shared/src/components/utilities';
import Link from '@dailydotdev/shared/src/components/utilities/Link';

// Icons (500+ available)
import { PlusIcon, ShareIcon, UpvoteIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';

// Modals
import { LazyModal } from '@dailydotdev/shared/src/components/modals/common/types';

// Feedback
import { Loader } from '@dailydotdev/shared/src/components/Loader';
import Toast from '@dailydotdev/shared/src/components/notifications/Toast';
import { Tooltip } from '@dailydotdev/shared/src/components/tooltip/Tooltip';
```

### Hooks
```typescript
// Most commonly used
import { useViewSize, ViewSize } from '@dailydotdev/shared/src/hooks';
import { useLazyModal } from '@dailydotdev/shared/src/hooks/useLazyModal';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
import { useConditionalFeature } from '@dailydotdev/shared/src/hooks/useConditionalFeature';
import { useFeedLayout } from '@dailydotdev/shared/src/hooks/useFeedLayout';
import { usePrompt } from '@dailydotdev/shared/src/hooks/usePrompt';

// Actions & State
import { useActions, usePlusSubscription } from '@dailydotdev/shared/src/hooks';
import useFeedSettings from '@dailydotdev/shared/src/hooks/useFeedSettings';
```

### Contexts
```typescript
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { useSettingsContext } from '@dailydotdev/shared/src/contexts/SettingsContext';
import { useNotificationContext } from '@dailydotdev/shared/src/contexts/NotificationsContext';
```

### GraphQL Types
```typescript
import type { Post, PostType } from '@dailydotdev/shared/src/graphql/posts';
import type { Source, SourceType } from '@dailydotdev/shared/src/graphql/sources';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import { ActionType } from '@dailydotdev/shared/src/graphql/actions';
```

### Utilities
```typescript
import type { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import { LogEvent, Origin } from '@dailydotdev/shared/src/lib/log';
import { AuthTriggers } from '@dailydotdev/shared/src/lib/auth';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import classed from '@dailydotdev/shared/src/lib/classed';
```

### Forms (react-hook-form + Zod)
```typescript
import { useForm, FormProvider } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Controlled components (use within FormProvider)
import ControlledTextField from '@dailydotdev/shared/src/components/fields/ControlledTextField';
import ControlledTextarea from '@dailydotdev/shared/src/components/fields/ControlledTextarea';
import ControlledSwitch from '@dailydotdev/shared/src/components/fields/ControlledSwitch';
```

## Quick Commands

```bash
# Setup
npm i -g pnpm@9.14.4
pnpm install

# Development
pnpm --filter webapp dev          # Run webapp (HTTPS)
pnpm --filter webapp dev:notls    # Run webapp (HTTP)
pnpm --filter extension dev:chrome # Run Chrome extension
pnpm --filter storybook dev       # Run Storybook

# Testing & Linting
pnpm --filter <package> test      # Run tests
pnpm --filter <package> lint      # Run linter
pnpm --filter <package> lint:fix  # Fix lint issues

# Building for production
pnpm --filter webapp build        # Build webapp
pnpm --filter extension build:chrome # Build Chrome extension
```

## Where Should I Put This Code?

```
Is it used by both webapp AND extension?
├── Yes → packages/shared/
│   ├── Is it a React component? → src/components/
│   ├── Is it a custom hook? → src/hooks/
│   ├── Is it a GraphQL query/mutation? → src/graphql/
│   ├── Is it a complex feature with multiple files? → src/features/
│   ├── Is it a React context? → src/contexts/
│   └── Is it a utility function? → src/lib/
├── No, webapp only → packages/webapp/
│   ├── Is it a page? → pages/
│   ├── Is it a layout? → components/layouts/
│   └── Is it webapp-specific logic? → components/ or hooks/
└── No, extension only → packages/extension/src/
    ├── Is it for new tab? → newtab/
    ├── Is it for companion widget? → companion/
    └── Is it background logic? → background/
```

## State Management Guide

| Use Case | Solution |
|----------|----------|
| Server data (API responses) | TanStack Query |
| Global app state (user, settings) | React Context |
| Local/UI state | useState |
| Form state | react-hook-form + Zod validation |

**Note**: TanStack Query v5 uses `isPending` for mutations (not `isLoading`).

## Design System Quick Reference

- **Colors**: Food-themed palette (burger, cheese, avocado, bacon, etc.)
- **Use semantic tokens**: `text-primary`, `bg-surface-primary`, not raw colors
- **Typography**: Use `typo-*` classes (typo-title1, typo-body, typo-callout)
- **Responsive**: mobileL, mobileXL, tablet, laptop, laptopL, desktop
- **ESLint enforces** `no-custom-color` rule - use design system tokens

## Testing Approach

We write tests to validate functionality, not to achieve coverage metrics:
- Focus on user interactions with React Testing Library
- Mock API responses with `nock`
- Test files live next to source: `Component.spec.tsx`
- Run tests: `pnpm --filter <package> test`

## Feature Flags & Experiments

GrowthBook is integrated for A/B testing:
```typescript
import { useConditionalFeature } from '@dailydotdev/shared/src/hooks';

const { value, isLoading } = useConditionalFeature({
  feature: 'feature_name',
  shouldEvaluate: true,
});
```

## Key Configuration Files

- `pnpm-workspace.yaml` - Monorepo workspace packages
- `packages/webapp/next.config.ts` - Next.js configuration
- `packages/shared/tailwind.config.ts` - Base Tailwind configuration
- `packages/extension/webpack.config.js` - Extension build configuration

## Package-Specific Guides

Each package has its own AGENTS.md with detailed guidance:
- `packages/shared/AGENTS.md` - Shared components, hooks, design system
- `packages/webapp/AGENTS.md` - Next.js webapp specifics
- `packages/extension/AGENTS.md` - Browser extension development
- `packages/storybook/AGENTS.md` - Component documentation

## Development Notes

- Extension uses `webextension-polyfill` for cross-browser compatibility
- SVG imports are converted to React components via `@svgr/webpack`
- Tailwind utilities preferred over CSS-in-JS
- GraphQL schema changes require manual TypeScript type updates
- **Avoid index/barrel exports** - they easily cause dependency cycles; prefer direct file imports

## Pull Requests

Keep PR descriptions concise and to the point. Reviewers should not be exhausted by lengthy explanations.
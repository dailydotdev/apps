# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Architecture

This is a pnpm monorepo containing the daily.dev application suite with the following structure:

- **packages/webapp** - Next.js web application (main daily.dev site)
- **packages/extension** - Browser extension (Chrome/Opera) built with Webpack  
- **packages/shared** - Shared React components, hooks, utilities, and design system
- **packages/storybook** - Component documentation and development environment
- **packages/eslint-config** - Shared ESLint configuration
- **packages/eslint-rules** - Custom ESLint rules including color consistency enforcement
- **packages/prettier-config** - Shared Prettier configuration

## Technology Stack

- **Node.js v22.11** (see .nvmrc)
- **pnpm 9.14.4** for package management
- **TypeScript** across all packages
- **React 18.3.1** with Next.js 15.3.3 for webapp
- **TanStack Query v5** for state management and data fetching
- **GraphQL** with graphql-request for API communication
- **Tailwind CSS** with custom design system
- **Jest** for testing across all packages
- **Webpack** for extension builds
- **Docker Compose** for local development with API/database

## Common Development Commands

### Setup
```bash
npm i -g pnpm@9.14.4
pnpm install
```

### Development
```bash
# Run webapp in development (HTTPS with custom certs)
pnpm --filter webapp dev

# Run webapp without TLS
pnpm --filter webapp dev:notls

# Run Chrome extension in development
pnpm --filter extension dev:chrome

# Run Opera extension in development  
pnpm --filter extension dev:opera

# Run Storybook for component development
pnpm --filter storybook dev
```

### Building
```bash
# Build webapp for production
pnpm --filter webapp build

# Build Chrome extension
pnpm --filter extension build:chrome

# Build all packages
pnpm run build
```

### Testing & Linting
```bash
# Run tests for specific package
pnpm --filter webapp test
pnpm --filter shared test
pnpm --filter extension test

# Run linting for specific package
pnpm --filter webapp lint
pnpm --filter shared lint

# Fix linting issues
pnpm --filter webapp lint:fix
```

### Extension Development
Load unpacked extension from `packages/extension/dist/chrome` after running dev command.

## Key Architectural Patterns

### Shared Components
All reusable components live in `packages/shared/src/components/`. New components that need to work across webapp and extension should be placed here.

### State Management
- TanStack Query for server state and caching
- Jotai for local state management
- React Context for app-wide state (Auth, Settings, etc.)

### Design System & Styling
- **Comprehensive design system** managed in `packages/shared/`
- **Food-themed color palette** with semantic tokens (burger, blueCheese, avocado, etc.)
- **Multi-theme support** with CSS custom properties for dark/light modes
- **Typography system** with semantic scale (Display, Title, Body, etc.)
- **Component categories**: Buttons, Cards, Fields, Modals, Layout, Auth, Feed, etc.
- **Responsive breakpoints**: mobileL, mobileXL, tablet, laptop, laptopL, desktop  
- **Custom Tailwind config** with design system tokens and utility classes
- **Theme-aware components** automatically adapt to current theme
- **ESLint rules** enforce consistent color usage (`no-custom-color`)
- **CSS architecture**: Global styles, CSS Modules, PostCSS with custom mixins

### GraphQL Integration  
- Centralized queries/mutations in `packages/shared/src/graphql/`
- Fragment-based approach for reusable query pieces
- Custom hooks wrapping TanStack Query for type safety

### Testing Strategy
- Jest with React Testing Library
- Component tests focus on user interactions
- Mock GraphQL responses using `nock`
- Shared test utilities in `__tests__/helpers/`

## Local Development with Backend

Use Docker Compose to run the full stack locally:
```bash
docker-compose up -d
```

This starts:
- PostgreSQL database (port 5432)
- Redis (port 6379)  
- daily-api backend (port 5000)

The webapp proxies API requests to localhost:5000 when NEXT_PUBLIC_DOMAIN=localhost.

## Important Configuration Files

- `pnpm-workspace.yaml` - Defines monorepo workspace packages
- `packages/webapp/next.config.ts` - Next.js configuration with custom webpack setup
- `packages/shared/tailwind.config.ts` - Base Tailwind configuration
- `packages/extension/webpack.config.js` - Extension build configuration
- `docker-compose.yml` - Local development environment setup

## Design System Navigation Guide

### Finding Components
When looking for existing components or creating new ones, follow this hierarchy:

1. **Check component categories** in `packages/shared/src/components/`:
   - **buttons/** - Button, ClickableText, ToggleClickbaitShield
   - **cards/** - ArticleCard, CollectionCard, SquadCard, ShareCard, AdCard
   - **fields/** - TextField, Checkbox, Radio, Switch, Dropdown, SearchField
   - **modals/** - ContentModal, ShareModal, UserListModal, PromptModal
   - **auth/** - AuthForm, LoginForm, RegistrationForm, AuthOptions
   - **layout/** - MainLayout, PageWrapperLayout, HeaderLogo, HeaderButtons
   - **sidebar/** - Sidebar, SidebarItem, ClickableNavItem
   - **drawers/** - Drawer, ContextMenuDrawer, NavDrawer
   - **feeds/** - FeedContainer, FeedNav, HorizontalFeed
   - **post/** - PostContent, PostActions, PostNavigation
   - **profile/** - ProfileButton, ProfileForm, ProfileWidgets
   - **notifications/** - Toast, InAppNotification, NotificationItem
   - **containers/** - Carousel, InfiniteScrolling

2. **Component naming patterns**:
   - Use existing component variants before creating new ones
   - Follow the pattern: `[Category][Feature][Type]` (e.g., `ProfileButton`, `PostActions`)
   - Check for compound components (e.g., `HorizontalScroll/` contains multiple related components)

3. **Design tokens location**:
   - **Colors**: `packages/shared/tailwind/colors/` (semantic tokens by category)
   - **Typography**: `packages/shared/tailwind/typography.ts` 
   - **Buttons**: `packages/shared/tailwind/buttons.ts`
   - **Shadows**: `packages/shared/tailwind/boxShadow.ts`

4. **Styling conventions**:
   - Use semantic color tokens (e.g., `text-primary`, `bg-surface-primary`) over raw colors
   - Prefer Tailwind utility classes over custom CSS
   - Use CSS Modules (`.module.css`) for component-specific styles when needed
   - Theme colors automatically adapt - use `bg-theme-*` classes for theme-aware styling

5. **Development workflow**:
   - **Storybook**: `pnpm --filter storybook dev` to preview components in isolation
   - **Component testing**: Look for existing `.spec.tsx` files for testing patterns
   - **Type safety**: Components should export proper TypeScript interfaces

### Quick Reference
- **Need a button?** → `packages/shared/src/components/buttons/Button.tsx`
- **Need a form field?** → `packages/shared/src/components/fields/[FieldType].tsx`
- **Need a modal?** → `packages/shared/src/components/modals/[ModalType].tsx`
- **Need colors?** → Use semantic tokens from `packages/shared/tailwind/colors/`
- **Need typography?** → Use `Typography` component with semantic sizes

## Development Notes

- Extension uses `webextension-polyfill` for cross-browser compatibility
- SVG imports are handled by `@svgr/webpack` and converted to React components
- CSS-in-JS is avoided in favor of Tailwind utility classes
- GraphQL schema changes require updating TypeScript types manually
- Prettier and ESLint configs are shared across all packages for consistency
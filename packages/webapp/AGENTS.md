# Webapp

Next.js web application - the main daily.dev website.

## Tech Stack

- **Next.js 15** with Pages Router
- **React 18.3.1**
- **Deployed on Vercel**

## Directory Structure

```
webapp/
├── pages/              # Next.js pages (routes)
├── components/         # Webapp-specific components
│   ├── layouts/        # Page layouts
│   ├── banner/         # Banner components
│   ├── footer/         # Footer components
│   └── ...
├── hooks/              # Webapp-specific hooks
├── context/            # Webapp-specific contexts
├── graphql/            # Webapp-only GraphQL (rare)
├── __tests__/          # Test files
├── public/             # Static assets
└── __mocks__/          # Test mocks
```

## Pages Router

Routes are file-based in `pages/`:

```
pages/
├── index.tsx           # Homepage (/)
├── posts/[id]/         # Post pages (/posts/:id)
├── [userId]/           # Profile pages (/:userId)
├── squads/[handle]/    # Squad pages (/squads/:handle)
├── settings/           # Settings pages
├── tags/[tag].tsx      # Tag pages
└── ...
```

### Dynamic Routes
```typescript
// pages/posts/[id]/index.tsx
export default function PostPage() {
  const router = useRouter();
  const { id } = router.query;
  // ...
}
```

## Layouts

Layouts wrap pages with common UI:

```typescript
// In a page component
MyPage.getLayout = (page) => (
  <MainLayout>
    {page}
  </MainLayout>
);
```

Available layouts in `components/layouts/`:
- `MainLayout` - Standard page layout
- `FooterNavBarLayout` - With mobile navigation
- `ProfileLayout` - User profile pages

## Environment Variables

```bash
# .env
NEXT_PUBLIC_API_URL=https://api.daily.dev
NEXT_PUBLIC_WEBAPP_URL=https://app.daily.dev
NEXT_PUBLIC_DOMAIN=daily.dev

# .env.production - production overrides
```

Access in code:
```typescript
process.env.NEXT_PUBLIC_API_URL
```

## SEO

SEO is handled via `next-seo`:

```typescript
import { NextSeo } from 'next-seo';

<NextSeo
  title="Page Title"
  description="Page description"
  openGraph={{
    title: 'OG Title',
    description: 'OG Description',
  }}
/>
```

Default config in `next-seo.ts`.

## API Proxy

The webapp proxies API requests to the backend:
- Production: `api.daily.dev`
- Local: `localhost:5000` (when `NEXT_PUBLIC_DOMAIN=localhost`)

Configured in `next.config.ts`.

## Development

```bash
# With HTTPS (requires certs)
pnpm --filter webapp dev

# Without HTTPS
pnpm --filter webapp dev:notls

# Build for production
pnpm --filter webapp build

# Run tests
pnpm --filter webapp test

# Lint
pnpm --filter webapp lint
```

## Webapp vs Shared

**Put in webapp when:**
- It's a page component
- It's a webapp-specific layout
- It uses Next.js-specific features (useRouter, next/head)
- It's only used in webapp

**Put in shared when:**
- It could be used by the extension
- It's a general-purpose component
- It doesn't depend on Next.js APIs

## Testing

Tests are in `__tests__/` with setup in `__tests__/setup.ts`:

```typescript
import { render, screen } from '@testing-library/react';

describe('MyPage', () => {
  it('should render', () => {
    render(<MyPage />);
    expect(screen.getByText('Expected text')).toBeInTheDocument();
  });
});
```

Mocks for Next.js router and common dependencies are in `__mocks__/`.

## Common Patterns

### Page with Data Fetching
```typescript
export default function MyPage() {
  const { data, isLoading } = useMyData();

  if (isLoading) return <Loading />;
  
  return <div>{data}</div>;
}

MyPage.getLayout = (page) => <MainLayout>{page}</MainLayout>;
```

### Protected Page
```typescript
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';

export default function ProtectedPage() {
  const { isLoggedIn, isAuthReady } = useAuthContext();

  if (!isAuthReady) return <Loading />;
  if (!isLoggedIn) return <LoginPrompt />;
  
  return <ProtectedContent />;
}
```

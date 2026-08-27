# Contexts

Global state providers. `BootProvider` composes them all (auth, settings, feature flags, analytics).

## Micro Context Pattern (preferred over prop drilling)

For page/feature-scoped state, use `createContextProvider` from `@kickass-coderz/react` (hard to discover, this is the house pattern):

```typescript
import { createContextProvider } from '@kickass-coderz/react';

const [MyFeatureProvider, useMyFeatureContext] = createContextProvider(
  ({ itemId }: UseMyFeatureProps) => {
    const { data, isLoading } = useQuery({ /* ... */ });
    const [selectedTab, setSelectedTab] = useState('overview');
    return { data, isLoading, selectedTab, setSelectedTab };
  },
  { errorMessage: 'useMyFeatureContext must be used within MyFeatureProvider' },
);
```

Wrap the page with the provider; nested components call the hook, no props threaded. Existing examples: `OpportunityProvider`, `ShortcutsProvider`, `ActivePostContextProvider`.

## When to Create a Context

Create one when state is needed deep in the tree or by unrelated siblings. Don't create one for parent-to-child props, server data (TanStack Query handles it), or single-component UI state.

## Payments

Payment contexts are platform-specific (`contexts/payment/`): Paddle for web, StoreKit for iOS, a Chrome-extension variant. The provider is selected per platform in `payment/index.tsx`; don't assume Paddle everywhere.

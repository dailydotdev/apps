# Features

Complex features that span multiple components, hooks, and utilities. Use features when a domain has enough complexity to warrant its own directory structure.

## Current Features

| Feature | Purpose |
|---------|---------|
| `boost/` | Post and squad boosting/promotion |
| `briefing/` | Daily briefing generation |
| `onboarding/` | User onboarding flows and funnels |
| `opportunity/` | Job opportunities |
| `organizations/` | Organization management |
| `profile/` | User profile widgets and forms |
| `shortcuts/` | Custom shortcut links |

## Feature Structure

```
feature-name/
├── components/          # Feature-specific React components
│   └── MyComponent.tsx
├── hooks/               # Feature-specific hooks
│   └── useFeatureData.ts
├── store/               # Jotai atoms or local state (if needed)
│   └── feature.store.ts
├── types/               # TypeScript types
│   └── feature.ts
├── lib/ or utils.ts     # Utilities
└── graphql.ts           # Feature-specific GraphQL (if needed)
```

## When to Create a Feature

Create a feature directory when:
- The domain has 5+ related files
- It has its own state management needs
- It includes multiple components that work together
- It has complex business logic

Keep in `components/` when:
- It's a standalone component
- It doesn't have complex state
- It's used across multiple features

## Example: Onboarding Feature

The `onboarding/` feature demonstrates a complex feature structure:

```
onboarding/
├── components/           # Onboarding-specific components
├── hooks/                # useFunnelNavigation, useFunnelBoot, etc.
├── shared/               # Shared UI pieces (PricingPlan, Header)
├── steps/                # Individual funnel steps
│   ├── FunnelRegistration.tsx
│   ├── FunnelPricing/
│   └── FunnelFact/
├── store/                # Jotai stores
│   ├── funnel.store.ts
│   └── onboarding.store.ts
├── types/                # Type definitions
│   └── funnel.ts
└── lib/                  # Utilities
```

## Feature Flags & A/B Tests

Features often involve experiments. Use GrowthBook:

```typescript
import { useConditionalFeature } from '@dailydotdev/shared/src/hooks';

function MyFeatureComponent() {
  const { value: variant } = useConditionalFeature({
    feature: 'my_experiment',
    shouldEvaluate: true,
  });

  if (variant === 'control') {
    return <ControlVariant />;
  }
  return <TreatmentVariant />;
}
```

## Creating a New Feature

1. Create the feature directory in `src/features/`
2. Add components, hooks, types as needed
3. Export public API from an `index.ts` if the feature is used elsewhere
4. Add tests for critical flows

Keep it simple - start with minimal structure and expand as needed. Don't over-architect upfront.

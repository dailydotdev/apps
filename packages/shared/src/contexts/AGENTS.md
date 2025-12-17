# Contexts

React Context providers for global application state.

## Available Contexts

| Context | Purpose | Key Values |
|---------|---------|------------|
| `AuthContext` | User authentication state | `user`, `isLoggedIn`, `login`, `logout` |
| `SettingsContext` | User preferences | `theme`, `spaciness`, `insaneMode` |
| `FeedContext` | Active feed state | `feedName`, `queryState` |
| `AlertContext` | System alerts | `alerts`, `loadedAlerts` |
| `LogContext` | Analytics logging | `logEvent`, `logEventStart` |
| `NotificationsContext` | Notification settings | `unreadCount` |
| `BootProvider` | App initialization | Composes all providers |

## State Management Decision Tree

```
What kind of state is it?
├── Server data (from API) → TanStack Query
├── Global app state (user, settings) → React Context
├── Feature/page-scoped state → Micro Context (createContextProvider)
├── UI state (open/closed, selected) → useState
└── Form state → react-hook-form
```

## BootProvider

`BootProvider` is the main provider that composes all contexts:

```typescript
// Entry point wraps app with BootProvider
<BootProvider>
  <App />
</BootProvider>
```

It handles:
- Authentication initialization
- Settings loading
- Feature flags (GrowthBook)
- Analytics setup

## Using Contexts

### AuthContext
```typescript
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';

function MyComponent() {
  const { user, isLoggedIn, showLogin } = useAuthContext();
  
  if (!isLoggedIn) {
    return <button onClick={() => showLogin()}>Login</button>;
  }
  
  return <div>Hello, {user.name}</div>;
}
```

### SettingsContext
```typescript
import { useSettingsContext } from '@dailydotdev/shared/src/contexts/SettingsContext';

function MyComponent() {
  const { theme, toggleTheme } = useSettingsContext();
  
  return <button onClick={toggleTheme}>Theme: {theme}</button>;
}
```

### LogContext (Analytics)
```typescript
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { LogEvent } from '@dailydotdev/shared/src/lib/log';

function MyComponent() {
  const { logEvent } = useLogContext();
  
  const handleClick = () => {
    logEvent({ event_name: LogEvent.Click, target_id: 'button' });
  };
  
  return <button onClick={handleClick}>Track me</button>;
}
```

## Payment Contexts

Payment handling has platform-specific implementations:

```
contexts/payment/
├── context.ts          # Shared types
├── Paddle.tsx          # Web payment (Paddle)
├── StoreKit.tsx        # iOS payment
├── ChromeExtension.tsx # Extension payment
└── index.tsx           # Provider selection
```

The correct payment provider is selected based on platform.

## Micro Context Pattern (Preferred for Prop Drilling)

Use `createContextProvider` from `@kickass-coderz/react` to create scoped contexts for pages, features, or component blocks. This eliminates prop drilling while keeping state localized.

```typescript
import { createContextProvider } from '@kickass-coderz/react';
import { useQuery } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';

type UseMyFeatureProps = PropsWithChildren & {
  itemId: string;
};

const [MyFeatureProvider, useMyFeatureContext] = createContextProvider(
  ({ itemId }: UseMyFeatureProps) => {
    const { data, isLoading } = useQuery({
      queryKey: ['item', itemId],
      queryFn: () => fetchItem(itemId),
    });

    const [selectedTab, setSelectedTab] = useState('overview');

    return { data, isLoading, selectedTab, setSelectedTab };
  },
);

export { MyFeatureProvider, useMyFeatureContext };
```

**Usage at page level:**
```typescript
// pages/my-feature/[id].tsx
export default function MyFeaturePage() {
  return (
    <MyFeatureProvider itemId={router.query.id}>
      <Header />        {/* Can access context */}
      <ContentArea />   {/* Can access context */}
      <Sidebar />       {/* Can access context */}
    </MyFeatureProvider>
  );
}

// Any nested component:
function ContentArea() {
  const { data, selectedTab } = useMyFeatureContext();
  // No props needed!
}
```

**Key benefits:**
- All child components access shared state without prop drilling
- Works great when injected into layouts (they're just components)
- Changes/additions to components don't require threading props
- Keeps TanStack Query data fetching centralized

**Real examples:**
- `OpportunityProvider` - wraps opportunity pages
- `ShortcutsProvider` - wraps shortcuts feature
- `ActivePostContextProvider` - wraps post-related components

## When to Create a New Context

Create a context when:
- State needs to be accessed deeply in the component tree
- Multiple unrelated components need the same state
- You need to avoid prop drilling → **Use micro context pattern**

Don't create a context when:
- State is only used by a parent and immediate children (use props)
- Data comes from the server (use TanStack Query directly, unless shared across siblings)
- State is truly UI-local to one component (use useState)

## Context Patterns

### Preferred: `createContextProvider` (less boilerplate)

```typescript
import { createContextProvider } from '@kickass-coderz/react';

const [MyProvider, useMyContext] = createContextProvider(
  () => {
    const [value, setValue] = useState('');
    return { value, setValue };
  },
  { errorMessage: 'useMyContext must be used within MyProvider' },
);

export { MyProvider, useMyContext };
```

### Traditional Pattern (for complex cases)

```typescript
import { createContext, useContext, ReactNode } from 'react';

interface MyContextValue {
  value: string;
  setValue: (v: string) => void;
}

const MyContext = createContext<MyContextValue | undefined>(undefined);

export function MyProvider({ children }: { children: ReactNode }) {
  const [value, setValue] = useState('');
  
  return (
    <MyContext.Provider value={{ value, setValue }}>
      {children}
    </MyContext.Provider>
  );
}

export function useMyContext() {
  const context = useContext(MyContext);
  if (!context) {
    throw new Error('useMyContext must be used within MyProvider');
  }
  return context;
}
```

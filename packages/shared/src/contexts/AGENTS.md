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
├── UI state (open/closed, selected) → Jotai or useState
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

## When to Create a New Context

Create a context when:
- State needs to be accessed deeply in the component tree
- Multiple unrelated components need the same state
- You need to avoid prop drilling

Don't create a context when:
- State is only used by a parent and immediate children (use props)
- Data comes from the server (use TanStack Query)
- State is UI-local (use useState or Jotai)

## Context Pattern

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

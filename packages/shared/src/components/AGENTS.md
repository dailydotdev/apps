# Components

React components shared between webapp and extension.

## Organization

Components are organized by category:

| Directory | Purpose | Examples |
|-----------|---------|----------|
| `buttons/` | Button variants | Button, ClickableText |
| `cards/` | Card components | ArticleCard, SquadCard, AdCard |
| `fields/` | Form inputs | TextField, Checkbox, Switch, SearchField |
| `modals/` | Modal dialogs | ShareModal, PromptModal |
| `auth/` | Authentication UI | LoginForm, RegistrationForm |
| `layout/` | Layout components | MainLayout, HeaderLogo |
| `sidebar/` | Sidebar navigation | Sidebar, SidebarItem |
| `drawers/` | Drawer components | Drawer, NavDrawer |
| `feeds/` | Feed-related | FeedContainer, FeedNav |
| `post/` | Post components | PostContent, PostActions |
| `profile/` | Profile components | ProfileButton, ProfileForm |
| `notifications/` | Notifications | Toast, NotificationItem |
| `icons/` | Icon components | All SVG icons as React components |

## Creating a New Component

### File Structure
```
buttons/
├── Button.tsx           # Component implementation
├── Button.spec.tsx      # Tests (when needed)
├── common.ts            # Shared types/utilities for the category
└── index.ts             # Re-exports (if exists)
```

### Component Pattern
```typescript
import type { ReactElement } from 'react';
import React, { forwardRef } from 'react';
import classNames from 'classnames';

interface MyComponentProps {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
  className?: string;
}

export function MyComponent({
  variant = 'primary',
  children,
  className,
}: MyComponentProps): ReactElement {
  return (
    <div className={classNames('base-classes', className)}>
      {children}
    </div>
  );
}
```

### Using forwardRef (for focusable/interactive elements)
```typescript
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function ButtonComponent({ children, ...props }, ref) {
    return <button ref={ref} {...props}>{children}</button>;
  }
);
```

## Styling

### Prefer Tailwind utilities
```typescript
// Good
<div className="flex items-center gap-2 p-4 bg-surface-primary">

// Avoid - use Tailwind instead
<div style={{ display: 'flex', alignItems: 'center' }}>
```

### Use semantic color tokens
```typescript
// Good - semantic tokens
className="text-primary bg-surface-float border-border-subtlest-tertiary"

// Bad - raw colors (ESLint will error)
className="text-gray-500 bg-[#1a1a1a]"
```

### CSS Modules (when Tailwind isn't enough)
```typescript
import styles from './Component.module.css';

<div className={classNames(styles.container, 'tailwind-classes')}>
```

## Testing Components

Write tests that focus on user behavior:

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('MyComponent', () => {
  it('should call onClick when clicked', async () => {
    const onClick = jest.fn();
    render(<MyComponent onClick={onClick}>Click me</MyComponent>);
    
    await userEvent.click(screen.getByRole('button'));
    
    expect(onClick).toHaveBeenCalled();
  });
});
```

### data-testid Usage
Use sparingly - prefer accessible queries (role, text, label):
```typescript
// Prefer
screen.getByRole('button', { name: 'Submit' });

// Use data-testid when no accessible alternative
<Loader data-testid="buttonLoader" />
screen.getByTestId('buttonLoader');
```

## Icons

Icons live in `icons/` and are SVG files converted to React components:

```typescript
import { UpvoteIcon, ShareIcon } from '../icons';

<Button icon={<UpvoteIcon />}>Upvote</Button>
```

To add a new icon:
1. Add SVG file to `icons/` directory
2. Export from `icons/index.ts`

## Common Patterns

### Compound Components
Some components use compound patterns for flexibility:
```typescript
<HorizontalScroll>
  <HorizontalScroll.Item>...</HorizontalScroll.Item>
</HorizontalScroll>
```

### classed() Utility
For simple styled wrappers:
```typescript
import classed from '../../lib/classed';

export const CardWrapper = classed('div', 'rounded-16 bg-surface-float p-4');
```

## Form Handling (Modern Pattern)

Use `react-hook-form` with Zod validation and Controlled components:

```typescript
import { useForm, FormProvider } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import ControlledTextField from '../fields/ControlledTextField';

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().max(500).optional(),
});

function MyForm() {
  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: { title: '', description: '' },
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <ControlledTextField name="title" label="Title" />
        <ControlledTextarea name="description" label="Description" />
      </form>
    </FormProvider>
  );
}
```

### Controlled Field Components
- `ControlledTextField` - Text input with validation
- `ControlledTextarea` - Textarea with validation
- `ControlledSwitch` - Toggle switch
- `ControlledMarkdownInput` - Markdown editor

These wrap base components with `react-hook-form` integration via `useFormContext()`.

## Import Patterns

**Within shared package** - use relative imports:
```typescript
import { Button } from '../buttons/Button';
import { useAuthContext } from '../../contexts/AuthContext';
```

**From webapp/extension** - use package imports:
```typescript
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
```

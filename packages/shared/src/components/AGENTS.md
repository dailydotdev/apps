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

export const MyComponent = ({
  variant = 'primary',
  children,
  className,
}: MyComponentProps): ReactElement => {
  return (
    <div className={classNames('base-classes', className)}>
      {children}
    </div>
  );
};
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

### CSS Modules (last resort only)

**Use only when there's absolutely no other way** - exhaust all Tailwind options first, including arbitrary values (`[value]`), and `classed()` utilities. CSS Modules add complexity and should be avoided unless truly necessary (e.g., complex animations, pseudo-elements that can't be handled otherwise).

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

Icons live in `icons/` as SVG files wrapped in React components.

### Using Icons
```typescript
import { UpvoteIcon, ShareIcon } from '../icons';
import { IconSize } from '../Icon';

// Basic usage
<UpvoteIcon />

// With size
<UpvoteIcon size={IconSize.Medium} />

// Filled variant (secondary)
<UpvoteIcon secondary />

// With custom className for color
<UpvoteIcon className="text-accent-bacon-default" />

// In a Button
<Button icon={<UpvoteIcon />}>Upvote</Button>
```

### Available Sizes (`IconSize` enum)
- `XXSmall` (12px), `Size16` (16px), `XSmall` (20px - default), `Small` (24px)
- `Medium` (28px), `Large` (32px), `XLarge` (40px), `XXLarge` (56px), `XXXLarge` (64px)

### Adding a New Icon

**1. Create directory structure:**
```
icons/
└── MyIcon/
    ├── index.tsx      # React component wrapper
    ├── outlined.svg   # Primary variant (outline style)
    └── filled.svg     # Secondary variant (filled style)
```

**2. SVG Requirements:**
- **Use `fill="currentColor"`** - allows CSS color inheritance
- Viewbox should typically be `0 0 24 24` (24x24 base size)
- Remove hardcoded colors like `fill="#FFFFFF"` - use `currentColor` instead
- Remove unnecessary metadata (title, xml declarations, etc.)

```xml
<!-- Good - uses currentColor for CSS inheritance -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <path d="..." fill="currentColor"/>
</svg>

<!-- Bad - hardcoded color won't respond to CSS -->
<svg width="24px" height="24px" viewBox="0 0 24 24">
  <path d="..." fill="#FFFFFF"/>
</svg>
```

**3. Create the wrapper component (`index.tsx`):**
```typescript
import type { ReactElement } from 'react';
import React from 'react';
import type { IconProps } from '../../Icon';
import Icon from '../../Icon';
import OutlinedIcon from './outlined.svg';
import FilledIcon from './filled.svg';

export const MyIcon = (props: IconProps): ReactElement => (
  <Icon {...props} IconPrimary={OutlinedIcon} IconSecondary={FilledIcon} />
);
```

**4. Export from `icons/index.ts`:**
```typescript
export * from './MyIcon';
```

### IconProps
- `secondary?: boolean` - Use filled variant instead of outlined
- `size?: IconSize` - Icon size (default: `XSmall` / 20px)
- Extends `ComponentProps<'svg'>` - accepts standard SVG attributes

## Typography

Use the `Typography` component instead of raw `<span>`, `<p>`, or heading elements for consistent text styling.

### Basic Usage
```typescript
import {
  Typography,
  TypographyTag,
  TypographyType,
  TypographyColor,
} from '../typography/Typography';

// Basic paragraph
<Typography type={TypographyType.Body}>
  Some text content
</Typography>

// With specific tag and styling
<Typography
  tag={TypographyTag.Span}
  type={TypographyType.Footnote}
  bold
>
  Bold footnote text
</Typography>

// With semantic color
<Typography
  tag={TypographyTag.H1}
  type={TypographyType.Title1}
  color={TypographyColor.Primary}
>
  Page Title
</Typography>
```

### Available Props
- `tag` - HTML element to render (`TypographyTag.Span`, `TypographyTag.P`, `TypographyTag.H1`, etc.)
- `type` - Typography size/style (`TypographyType.Caption1`, `TypographyType.Footnote`, `TypographyType.Body`, `TypographyType.Title1`, `TypographyType.Mega1`, etc.)
- `color` - Semantic color (`TypographyColor.Primary`, `TypographyColor.Secondary`, `TypographyColor.Link`, etc.)
- `bold` - Apply bold font weight
- `center` - Center align text
- `truncate` - Truncate with ellipsis
- `className` - Additional CSS classes for custom styling (colors, spacing, etc.)

### Typography Types (smallest to largest)
`Caption2` → `Caption1` → `Footnote` → `Subhead` → `Callout` → `Body` → `Title4` → `Title3` → `Title2` → `Title1` → `LargeTitle` → `Mega3` → `Mega2` → `Mega1` → `Giga3` → `Giga2` → `Giga1` → `Tera`

### Custom Colors via className
When you need colors not in `TypographyColor`, use `className`:
```typescript
<Typography
  tag={TypographyTag.Span}
  type={TypographyType.Footnote}
  className="text-accent-cheese-default"
>
  Custom colored text
</Typography>
```

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

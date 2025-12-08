# Storybook

Component documentation and development environment.

## Purpose

Storybook is used for:
- Developing components in isolation
- Documenting component APIs
- Visual testing across states
- Design handoff (Figma integration)

## Development

```bash
# Run Storybook dev server (http://localhost:6006)
pnpm --filter storybook dev

# Build static Storybook
pnpm --filter storybook build

# Lint stories
pnpm --filter storybook lint
```

## Directory Structure

```
storybook/
├── .storybook/
│   ├── main.ts         # Storybook config
│   └── preview.tsx     # Global decorators
├── stories/
│   ├── atoms/          # Basic components
│   ├── components/     # Complex components
│   ├── tokens/         # Design tokens
│   ├── experiments/    # A/B test variants
│   └── extension/      # Extension-specific
├── mock/               # Mock providers and data
└── public/             # Static assets
```

## Story Organization

Stories follow atomic design:

| Directory | Content |
|-----------|---------|
| `atoms/` | Button, Icon, Typography, ProfilePicture |
| `components/` | Cards, drawers, forms, modals |
| `tokens/` | Colors, design system showcase |
| `experiments/` | A/B test documentation |
| `extension/` | Extension-specific components |

## Writing Stories

### Basic Story Structure

```typescript
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';

const meta: Meta<typeof Button> = {
  title: 'Atoms/Button',
  component: Button,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/...',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: 'Click me',
    variant: 'primary',
  },
};

export const WithIcon: Story = {
  args: {
    children: 'Share',
    icon: <ShareIcon />,
  },
};
```

### Importing Components

Always import from shared:
```typescript
import { Component } from '@dailydotdev/shared/src/components/path/Component';
```

### Story Variants

Show all important states:
```typescript
export const Default: Story = { args: { ... } };
export const Loading: Story = { args: { loading: true } };
export const Disabled: Story = { args: { disabled: true } };
export const WithError: Story = { args: { error: 'Error message' } };
```

## Features

### Auto-generated Docs
Add `tags: ['autodocs']` to generate documentation from TypeScript types.

### Figma Integration
Link to Figma designs:
```typescript
parameters: {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/...',
  },
},
```

### Theme Switching
Stories can be viewed in light/dark mode via the toolbar.

### MSW for API Mocking
Mock API responses for data-dependent components.

## Mock Providers

Components needing context use mock providers from `mock/`:

```typescript
import { ExtensionProviders } from './_providers';

const meta: Meta<typeof MyComponent> = {
  decorators: [
    (Story) => (
      <ExtensionProviders>
        <Story />
      </ExtensionProviders>
    ),
  ],
};
```

## When to Add Stories

Add stories for:
- New reusable components
- Components with multiple variants/states
- Design system elements
- Components that need visual QA

Skip stories for:
- One-off page components
- Simple wrappers
- Internal implementation details

## Best Practices

1. **Show all variants** - Document every prop combination that matters
2. **Use realistic data** - Mock data should look real
3. **Link to Figma** - Connect stories to design specs
4. **Keep stories focused** - One concept per story
5. **Use autodocs** - Let TypeScript generate docs

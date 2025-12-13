# Design System

Tailwind CSS design system with custom tokens for daily.dev.

## File Structure

```
tailwind/
├── colors.ts          # Base color palette (food-themed)
├── colors/            # Semantic color tokens
│   ├── accent.ts      # Accent colors
│   ├── action.ts      # Interactive element colors
│   ├── background.ts  # Background colors
│   ├── border.ts      # Border colors
│   ├── surface.ts     # Surface colors
│   ├── text.ts        # Text colors
│   └── ...
├── typography.ts      # Typography scale
├── buttons.ts         # Button variants
├── boxShadow.ts       # Shadow tokens
└── overlay.ts         # Overlay styles
```

## Color Palette

We use a food-themed color palette:

| Color | Usage |
|-------|-------|
| `burger` | Warm browns |
| `cheese` | Yellows |
| `lettuce` | Lime greens |
| `avocado` | Greens |
| `blueCheese` | Cyans |
| `water` | Blues |
| `onion` | Purples |
| `cabbage` | Magentas |
| `bacon` | Pinks |
| `ketchup` | Reds |
| `bun` | Oranges |
| `salt` | Light grays |
| `pepper` | Dark grays |

Each color has shades 10-90 (e.g., `cheese-50`, `bacon-40`).

## Semantic Tokens

**Always use semantic tokens, not raw palette colors.**

### Text Colors
```typescript
// Good
className="text-primary"         // Main text
className="text-secondary"       // Secondary text
className="text-tertiary"        // Muted text
className="text-disabled"        // Disabled state

// Bad - ESLint will error
className="text-pepper-10"
className="text-[#525866]"
```

### Background Colors
```typescript
className="bg-background-default"    // Page background
className="bg-surface-primary"       // Card/container background
className="bg-surface-float"         // Elevated surfaces
className="bg-surface-active"        // Active/selected state
```

### Border Colors
```typescript
className="border-border-subtlest-primary"
className="border-border-subtlest-secondary"
className="border-border-subtlest-tertiary"
```

### Action Colors
```typescript
className="bg-action-upvote-default"     // Upvote
className="bg-action-downvote-default"   // Downvote
className="bg-action-bookmark-default"   // Bookmark
```

## Typography

Use `typo-*` classes for text:

```typescript
className="typo-mega3"      // Largest display
className="typo-mega2"
className="typo-mega1"
className="typo-large-title"
className="typo-title1"
className="typo-title2"
className="typo-title3"
className="typo-body"       // Default body text
className="typo-callout"    // Slightly smaller
className="typo-footnote"   // Small text
className="typo-subhead"
className="typo-caption1"
className="typo-caption2"   // Smallest
```

## Responsive Breakpoints

```typescript
// Mobile first approach
className="w-full tablet:w-1/2 laptop:w-1/3"
```

| Breakpoint | Width |
|------------|-------|
| `mobileL` | 420px |
| `mobileXL` | 500px |
| `tablet` | 656px |
| `laptop` | 1020px |
| `laptopL` | 1360px |
| `laptopXL` | 1668px |
| `desktop` | 1976px |
| `desktopL` | 2156px |

## Button Variants

Buttons have predefined variants:

```typescript
<Button variant={ButtonVariant.Primary}>Primary</Button>
<Button variant={ButtonVariant.Secondary}>Secondary</Button>
<Button variant={ButtonVariant.Tertiary}>Tertiary</Button>
<Button variant={ButtonVariant.Float}>Float</Button>
<Button variant={ButtonVariant.Subtle}>Subtle</Button>   // Common for icon buttons
<Button variant={ButtonVariant.Option}>Option</Button>
<Button variant={ButtonVariant.Quiz}>Quiz</Button>
```

With colors:
```typescript
<Button variant={ButtonVariant.Secondary} color={ButtonColor.Avocado}>
  Success
</Button>
```

## Theme System

The design system supports dark/light themes via CSS custom properties. Theme-aware classes automatically adapt:

```typescript
// These adapt to current theme
className="bg-background-default"  // Changes based on theme
className="text-primary"           // Changes based on theme
```

## ESLint Enforcement

The `no-custom-color` ESLint rule prevents raw color usage:

```typescript
// ESLint error
className="text-gray-500"
className="bg-[#1a1a1a]"
style={{ color: '#ff0000' }}

// ESLint OK
className="text-primary"
className="bg-surface-float"
```

## Adding New Tokens

1. Add to appropriate file in `tailwind/colors/`
2. Export from `colors.ts` if needed
3. Update `tailwind.config.ts` if adding new categories
4. Use the semantic token in components

Keep tokens minimal - prefer using existing ones.

## Custom Styles & Gradients

If you absolutely need custom styles or gradients that don't fit the token system, add them to `src/styles/custom.ts`. This centralizes non-standard styles so they can be identified and potentially migrated to proper tokens later.

```typescript
// src/styles/custom.ts - use sparingly
export const customGradients = {
  // Document why this gradient is needed
  featureHighlight: 'linear-gradient(...)',
};
```

**Prefer design tokens over custom styles whenever possible.**

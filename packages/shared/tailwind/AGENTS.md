# Design System (Tailwind)

Custom tokens defined here; food-themed base palette (`burger`, `cheese`, `avocado`, `bacon`, `pepper` = dark grays, `salt` = light grays, shades 10-90).

## Semantic Tokens Only

Always use semantic tokens, never raw palette colors or hex values. Raw colors don't adapt to theme switching and the `no-custom-color` ESLint rule errors on them.

- Text: `text-primary` / `text-secondary` / `text-tertiary` / `text-disabled`
- Background: `bg-background-default`, `bg-surface-primary`, `bg-surface-float`, `bg-surface-active`
- Border: `border-border-subtlest-{primary|secondary|tertiary}`
- Actions: `bg-action-{upvote|downvote|bookmark}-default`
- Typography: `typo-*` classes (`typo-body`, `typo-callout`, `typo-title1`, ...)

## Breakpoints (custom, worth memorizing)

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

## Custom Styles

One-off gradients/styles that don't fit the token system go in `src/styles/custom.ts` (centralized for later migration), not inline. Prefer existing tokens; keep new tokens minimal.

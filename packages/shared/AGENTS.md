# Shared Package

`@dailydotdev/shared` holds everything used by both webapp and extension. Platform-specific code stays in `packages/webapp` / `packages/extension`.

## Imports

Always import from the source path, never from a package root or barrel:

```typescript
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
```

Within the shared package itself, use relative imports.

## CSS Units

**Never use raw `px` in arbitrary Tailwind values.** Use the standard Tailwind scale when the px value is divisible by 4 (`28px → -left-7`, `6px → -top-1.5`), and `rem` arbitrary values otherwise (`18px → h-[1.125rem]`). Prefer designing with values divisible by 4 so they map cleanly (33px → use 32px / `bottom-8`).

## Testing

Jest + RTL, spec files next to source (`Button.spec.tsx`). Run with `pnpm --filter shared test`. Remember shared components have consumers in webapp/extension: run their tests too after changing shared code.

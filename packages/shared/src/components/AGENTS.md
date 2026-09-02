# Components

Shared React components, organized by category directory (`buttons/`, `cards/`, `fields/`, `modals/`, `icons/`, ...).

## Styling

- Tailwind utilities with semantic tokens only (`no-custom-color` ESLint rule enforces this).
- `classed()` from `lib/classed` for simple styled wrappers.
- CSS Modules are a last resort: exhaust Tailwind (including arbitrary values) first.

## Typography

Use the `Typography` component (`typography/Typography.tsx`) instead of raw `<span>`/`<p>`/headings: `tag` (element), `type` (`TypographyType.*` scale), `color` (`TypographyColor.*`), `bold`, `truncate`. For colors outside `TypographyColor`, pass a token class via `className`.

## Icons

Each icon is a directory under `icons/` with `index.tsx` wrapping `outlined.svg` (primary) and `filled.svg` (secondary variant, rendered when `secondary` prop is set) through the shared `Icon` component.

SVG requirements (the part that breaks silently): use `fill="currentColor"` everywhere so CSS color inheritance works, 24x24 viewBox, strip hardcoded fills and metadata. A hardcoded `fill="#FFF"` won't respond to `className` colors.

## Toasts

One global toast renderer (`notifications/Toast.tsx`); call sites use `useToastNotification().displayToast(...)`.

- The toast is **top-anchored on every breakpoint** to avoid colliding with bottom-anchored chrome (floating bars, footer nav). Don't move it to the bottom for a single surface.
- Prefer inline confirmation (icon swap, brief label change) over a toast for instant local actions like copy.
- `displayToast` overwrites the current toast; don't fire several in one flow.
- `persistent: true` only when there's an `action` button (e.g. undo); otherwise keep the 5s default.
- Copy: short sentence case, no trailing period. The leading emoji pattern is reserved for clipboard feedback (`useCopy.ts`).

## Toolbars

Icon-only buttons in toolbars: keep adjacent status labels inline and match the control height (e.g. `ButtonSize.XSmall` is `h-6`) so rows align.

## Testing

Prefer accessible queries (`getByRole`, text, label); `data-testid` only when there's no accessible alternative.

# Components

## Icons

Each icon is a directory under `icons/` with `index.tsx` wrapping `outlined.svg` and `filled.svg` (rendered for the `secondary` prop) through the shared `Icon` component. SVGs must use `fill="currentColor"` everywhere with a 24x24 viewBox and no metadata; a hardcoded `fill="#FFF"` silently ignores `className` colors.

## Toasts

One global renderer (`notifications/Toast.tsx`), called through `useToastNotification().displayToast(...)`.

- It is top-anchored on every breakpoint so it never collides with bottom chrome (floating bars, footer nav). Don't move it for a single surface.
- `displayToast` overwrites the current toast, so don't fire several in one flow. `persistent: true` only alongside an `action` (undo); otherwise keep the default timeout.
- Instant local actions like copy use inline confirmation (icon swap, brief label change), not a toast. The leading-emoji copy pattern is reserved for clipboard feedback (`hooks/useCopy.ts`).

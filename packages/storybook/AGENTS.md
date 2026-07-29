# Storybook

Component documentation environment. `pnpm --filter storybook dev` (http://localhost:6006).

## Non-Obvious Facts

- Import story types from `@storybook/react-vite` (Vite builder), not `@storybook/react`.
- Components import from `@dailydotdev/shared/src/...` source paths, like everywhere else.
- Components needing context use mock providers from `mock/` (e.g. `ExtensionProviders`) as decorators; MSW is available for API mocking.
- Stories are grouped by atomic design: `atoms/`, `components/`, `tokens/`, `experiments/`, `extension/`.

## What Deserves a Story

Reusable components with multiple variants/states and design system elements. Skip one-off page components, simple wrappers, and internals. Use `tags: ['autodocs']` and link Figma via `parameters.design` when a spec exists.

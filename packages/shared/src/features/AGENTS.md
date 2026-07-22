# Features

Feature directories (`boost/`, `onboarding/`, `opportunity/`, ...) group components, hooks, types, stores, and GraphQL for one complex domain.

- Create a feature directory when a domain has ~5+ related files, its own state, or multiple cooperating components. Otherwise keep a standalone component in `src/components/`.
- Conventional internal layout: `components/`, `hooks/`, `types/`, `store/` (Jotai atoms where needed), `lib/` or `utils.ts`, `graphql.ts`.
- Start minimal and expand; don't scaffold structure upfront. No barrel `index.ts` files (repo-wide rule): import directly from files.

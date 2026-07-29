# GraphQL

Queries/mutations/fragments per domain file (`posts.ts`, `sources.ts`, ...), client setup in `common.ts` (`gqlClient` from graphql-request).

## Key Facts

- **There is no codegen.** TypeScript types in `types.ts` (and domain files) are maintained by hand; schema changes require manual type updates. Keep types in sync with the query you edit.
- Reusable fragments live in `fragments.ts`; interpolate them into queries.
- Tests mock the API with `nock` against the local GraphQL endpoint.

## Naming Conventions

- Queries: `ENTITY_ACTION_QUERY` (`POST_BY_ID_QUERY`)
- Mutations: `ACTION_ENTITY_MUTATION` (`UPVOTE_POST_MUTATION`)
- Fragments: `ENTITY_VARIANT_FRAGMENT` (`USER_SHORT_FRAGMENT`)

React integration goes through hooks in `src/hooks/` using the query-options-creator pattern (see `src/hooks/AGENTS.md`).

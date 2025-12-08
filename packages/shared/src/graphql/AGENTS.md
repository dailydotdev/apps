# GraphQL

GraphQL queries, mutations, and fragments for API communication.

## File Organization

| File | Purpose |
|------|---------|
| `posts.ts` | Post queries and mutations |
| `comments.ts` | Comment operations |
| `users.ts` | User queries |
| `sources.ts` | Source/publication operations |
| `squads.ts` | Squad operations |
| `feed.ts` | Feed queries |
| `feedSettings.ts` | Feed customization |
| `bookmarks.ts` | Bookmark operations |
| `notifications.ts` | Notification queries |
| `fragments.ts` | Reusable GraphQL fragments |
| `types.ts` | TypeScript type definitions |
| `common.ts` | GraphQL client setup |
| `queryClient.ts` | TanStack Query client |

## GraphQL Client

We use `graphql-request`:

```typescript
import { gqlClient } from './common';

const data = await gqlClient.request(MY_QUERY, { variables });
```

## Query/Mutation Patterns

### Defining a Query
```typescript
import { gql } from 'graphql-request';

export const POST_BY_ID_QUERY = gql`
  query PostById($id: ID!) {
    post(id: $id) {
      id
      title
      content
      ...PostFields
    }
  }
  ${POST_FIELDS_FRAGMENT}
`;
```

### Defining a Mutation
```typescript
export const UPVOTE_POST_MUTATION = gql`
  mutation UpvotePost($id: ID!) {
    vote(id: $id, vote: 1, entity: post) {
      _
    }
  }
`;
```

## Fragments

Reusable pieces live in `fragments.ts`:

```typescript
export const USER_SHORT_FRAGMENT = gql`
  fragment UserShort on User {
    id
    name
    username
    image
  }
`;

// Use in queries
export const POST_QUERY = gql`
  query Post($id: ID!) {
    post(id: $id) {
      author {
        ...UserShort
      }
    }
  }
  ${USER_SHORT_FRAGMENT}
`;
```

## Types

TypeScript types are defined in `types.ts`:

```typescript
export interface Post {
  id: string;
  title: string;
  content?: string;
  author: User;
  // ...
}

export interface PostData {
  post: Post;
}
```

## Integration with TanStack Query

Queries are typically used via hooks in `hooks/`:

```typescript
// hooks/post/usePostById.ts
import { useQuery } from '@tanstack/react-query';
import { gqlClient } from '../graphql/common';
import { POST_BY_ID_QUERY } from '../graphql/posts';
import type { PostData } from '../graphql/types';

export function usePostById(id: string) {
  return useQuery<PostData>({
    queryKey: ['post', id],
    queryFn: () => gqlClient.request(POST_BY_ID_QUERY, { id }),
    enabled: !!id,
  });
}
```

## Testing with Mocks

Use `nock` to mock GraphQL responses:

```typescript
import nock from 'nock';

beforeEach(() => {
  nock('http://localhost:3000')
    .post('/graphql')
    .reply(200, {
      data: {
        post: { id: '1', title: 'Test Post' },
      },
    });
});
```

## Adding New Operations

1. Add query/mutation to appropriate file (e.g., `posts.ts`)
2. Add/update types in `types.ts`
3. Create a hook in `hooks/` for React integration
4. Use fragments for reusable field selections

## Naming Conventions

- Queries: `ENTITY_ACTION_QUERY` (e.g., `POST_BY_ID_QUERY`)
- Mutations: `ACTION_ENTITY_MUTATION` (e.g., `UPVOTE_POST_MUTATION`)
- Fragments: `ENTITY_VARIANT_FRAGMENT` (e.g., `USER_SHORT_FRAGMENT`)

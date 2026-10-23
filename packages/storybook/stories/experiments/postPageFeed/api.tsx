import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type {
  Comment,
  PostCommentsData,
} from '@dailydotdev/shared/src/graphql/comments';
import { RequestKey } from '@dailydotdev/shared/src/lib/query';

// Storybook has no API, so the post’s comments would show their loading
// placeholder forever and the page would end in grey bars. Every comments
// query gets the same short, synthetic thread instead (made-up people,
// placeholder avatars), so each post ends the way a real one does.

const person = (id: number, name: string, username: string) => ({
  id: `story-person-${id}`,
  name,
  username,
  image: `https://daily-now-res.cloudinary.com/image/upload/f_auto,q_auto/v1/placeholders/${id}`,
  permalink: `https://app.daily.dev/${username}`,
  reputation: 120 * id,
});

const comment = (
  id: string,
  author: ReturnType<typeof person>,
  html: string,
  daysAgo: number,
  numUpvotes: number,
  children: Comment[] = [],
): Comment => ({
  id,
  content: html.replace(/<[^>]+>/g, ''),
  contentHtml: html,
  author,
  createdAt: new Date(Date.now() - daysAgo * 864e5).toISOString(),
  permalink: `https://app.daily.dev/posts/story#c-${id}`,
  numUpvotes,
  numAwards: 0,
  children: {
    edges: children.map((node) => ({ node })),
    pageInfo: { hasNextPage: false },
  },
});

const thread: PostCommentsData = {
  postComments: {
    edges: [
      comment(
        'story-c1',
        person(2, 'Maya Lund', 'mayalund'),
        '<p>Saved this one. The second half is the part most write-ups skip, and it is the part I actually needed.</p>',
        2,
        41,
        [
          comment(
            'story-c2',
            person(3, 'Theo Brandt', 'theob'),
            '<p>Same. Sharing it with my team for our next retro.</p>',
            1,
            9,
          ),
        ],
      ),
      comment(
        'story-c3',
        person(4, 'Priya Raman', 'priyar'),
        '<p>Would love a follow-up with numbers from a real team. Anyone tried this at scale?</p>',
        1,
        17,
      ),
    ].map((node) => ({ node })),
    pageInfo: { hasNextPage: false },
  },
};

/** Answers every comments query with the synthetic thread. */
export const SeedComments = (): null => {
  const client = useQueryClient();
  useEffect(() => {
    const cache = client.getQueryCache();
    const seed = (key: readonly unknown[]) => {
      if (key[0] === RequestKey.PostComments && !client.getQueryData(key)) {
        client.setQueryData(key, thread);
      }
    };
    cache.getAll().forEach((query) => seed(query.queryKey));
    return cache.subscribe((event) => {
      if (event.type === 'added') {
        queueMicrotask(() => seed(event.query.queryKey));
      }
    });
  }, [client]);
  return null;
};

/**
 * Every other API call fails fast in a dev browser, and the widgets that
 * made it hide. In headless Chrome the same calls hang, and the page fills
 * with loading placeholders (further reading, ad slots). A query still
 * fetching after a second and a half with nothing to show settles as failed, so the
 * page looks the same wherever it renders.
 */
export const SettlePending = (): null => {
  const client = useQueryClient();
  useEffect(() => {
    const cache = client.getQueryCache();
    const since = new Map<string, number>();
    const timer = window.setInterval(() => {
      const now = Date.now();
      cache.getAll().forEach((query) => {
        const { state, queryHash, queryKey } = query;
        if (
          state.status !== 'pending' ||
          state.fetchStatus !== 'fetching' ||
          String(queryKey[0]).toLowerCase().includes('boot')
        ) {
          since.delete(queryHash);
          return;
        }
        const first = since.get(queryHash) ?? now;
        since.set(queryHash, first);
        if (now - first > 1500) {
          query.setState({
            ...state,
            status: 'error',
            fetchStatus: 'idle',
            error: new Error('No API in Storybook'),
            errorUpdatedAt: now,
          });
        }
      });
    }, 500);
    return () => window.clearInterval(timer);
  }, [client]);
  return null;
};

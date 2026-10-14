import { useEffect, useMemo, useRef, useState } from 'react';
import { graphql, HttpResponse } from 'msw';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import useFeedSettings from '@dailydotdev/shared/src/hooks/useFeedSettings';
import { REQUIRED_TAGS_THRESHOLD } from '@dailydotdev/shared/src/components/onboarding/common';
import { POST_IDS_BY_TAG, PREVIEW_POSTS } from './previewPosts.fixture';

export interface PreviewPost {
  post: Post;
  // The picked tags this post matched, the one it was ranked for first.
  matchedTags: string[];
}

const postsById = new Map(PREVIEW_POSTS.map((post) => [post.id, post]));

// Round-robin across the picked tags so every pick shows up near the top,
// the way the ranked preview mixes topics instead of listing one tag first.
export const getPreviewPosts = (tags: string[]): PreviewPost[] => {
  const queues = tags.map((tag) => [...(POST_IDS_BY_TAG[tag] ?? [])]);
  const seen = new Set<string>();
  const result: PreviewPost[] = [];

  while (queues.some((queue) => queue.length)) {
    queues.forEach((queue, index) => {
      const id = queue.shift();
      const post = id && postsById.get(id);

      if (!post || seen.has(id)) {
        return;
      }

      seen.add(id);
      result.push({
        post,
        matchedTags: [
          tags[index],
          ...tags.filter(
            (tag) => tag !== tags[index] && post.tags?.includes(tag),
          ),
        ],
      });
    });
  }

  return result;
};

export const getPostsForTag = (tag: string): Post[] =>
  (POST_IDS_BY_TAG[tag] ?? []).flatMap((id) => postsById.get(id) ?? []);

const ONBOARDING_TAGS = new Set(Object.keys(POST_IDS_BY_TAG));

// What a feed with no tags picked would lead with: the week's most upvoted.
export const getEveryonePosts = (): Post[] =>
  [...PREVIEW_POSTS].sort((a, b) => (b.numUpvotes ?? 0) - (a.numUpvotes ?? 0));

// A tag the post carries that the user could still pick from the step.
export const getRelatedTag = (
  post: Post,
  picked: string[],
): string | undefined =>
  post.tags?.find((tag) => ONBOARDING_TAGS.has(tag) && !picked.includes(tag));

// Production debounces the preview refetch by a second after a tag change.
const REFRESH_MS = 700;

export const usePickedTags = (): {
  tags: string[];
  isReady: boolean;
  remaining: number;
} => {
  const { feedSettings } = useFeedSettings();
  const tags = useMemo(
    () => feedSettings?.includeTags ?? [],
    [feedSettings?.includeTags],
  );
  const remaining = Math.max(REQUIRED_TAGS_THRESHOLD - tags.length, 0);

  return { tags, isReady: remaining === 0, remaining };
};

export const usePreviewFeed = (): {
  tags: string[];
  posts: PreviewPost[];
  isReady: boolean;
  remaining: number;
  isRefreshing: boolean;
  freshIds: Set<string>;
} => {
  const { tags: pickOrder, isReady, remaining } = usePickedTags();
  const tagsKey = pickOrder.join(',');
  // Newest pick first, so every tap visibly changes the top of the preview.
  const tags = useMemo(
    () => [...pickOrder].reverse(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tagsKey],
  );
  const posts = useMemo(() => getPreviewPosts(tags), [tags]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [freshIds, setFreshIds] = useState<Set<string>>(new Set());
  const previousIds = useRef<Set<string> | null>(null);

  useEffect(() => {
    const ids = new Set(posts.map(({ post }) => post.id));
    const previous = previousIds.current;
    previousIds.current = ids;

    if (!previous) {
      return undefined;
    }

    setIsRefreshing(true);
    const timeout = setTimeout(() => {
      setIsRefreshing(false);
      setFreshIds(new Set([...ids].filter((id) => !previous.has(id))));
    }, REFRESH_MS);

    return () => clearTimeout(timeout);
  }, [posts]);

  return { tags, posts, isReady, remaining, isRefreshing, freshIds };
};

export const getPickMoreCopy = (remaining: number): string =>
  `Pick ${remaining} more ${
    remaining === 1 ? 'tag' : 'tags'
  } to preview your feed`;

// `feedPreview` reads the picked tags from the user's feed settings on the
// server, so the query carries no filters. The handler reads them from here.
export const DEFAULT_PICKED_TAGS = [
  'javascript',
  'react',
  'devops',
  'ai',
  'webdev',
];
const PRODUCTION_PAGE_SIZE = 24;
const handlerState = { tags: [] as string[], pageSize: PRODUCTION_PAGE_SIZE };

export const useSyncHandlerTags = (pageSize = PRODUCTION_PAGE_SIZE): void => {
  const { tags } = usePickedTags();
  handlerState.tags = tags;
  handlerState.pageSize = pageSize;
};

// The production `FeedPreview` query answered from the same fixture, so the
// production preview shows this week's real posts instead of the 2020 test
// fixture.
export const REAL_FEED_PREVIEW_HANDLER = graphql.query('FeedPreview', () => {
  // A nested review frame can be answered by the parent page's worker, which
  // has no picked tags of its own.
  const tags = handlerState.tags.length
    ? handlerState.tags
    : DEFAULT_PICKED_TAGS;
  const edges = getPreviewPosts(tags)
    .slice(0, handlerState.pageSize)
    .map(({ post }) => ({ node: post }));

  return HttpResponse.json({
    data: {
      page: { pageInfo: { hasNextPage: false, endCursor: null }, edges },
    },
  });
});

import { useCallback, useContext, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { OnboardingSwipeCard } from '@dailydotdev/shared/src/components/modals/hotTakes/HotAndColdModal';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { ADD_BOOKMARKS_MUTATION } from '@dailydotdev/shared/src/graphql/posts';
import { PostType } from '@dailydotdev/shared/src/types';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import { bookmarkMutationKey } from '@dailydotdev/shared/src/hooks/bookmark/types';
import { getPostByIdKey } from '@dailydotdev/shared/src/lib/query';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { LogEvent, Origin } from '@dailydotdev/shared/src/lib/log';
import { postLogEvent } from '@dailydotdev/shared/src/lib/feed';
import type { PostSummary } from '../lib/swipingBackendApi';
import { discoverPosts } from '../lib/swipingBackendApi';
import { hydratePostsByIds } from '../lib/swipeOnboardingPostHydration';

// Scoring constants — ported from PostSwiper.tsx
const LIKE_SCORE = 1.5;
const DISLIKE_SCORE = -1;
const ADD_THRESHOLD = 3;
const SATURATE_THRESHOLD = 4.5;
const REMOVE_THRESHOLD = -5;
const IGNORE_AFTER = 10;
const SATURATE_AFTER = 5;
const PREFETCH_AFTER_SWIPES = 3;
const BATCH_SIZE = 8;

interface StartDeckOptions {
  prompt?: string;
  initialTags?: string[];
}

interface AdaptiveSwipeDeck {
  cards: OnboardingSwipeCard[];
  isLoading: boolean;
  startDeck: (options?: StartDeckOptions) => Promise<void>;
  handleSwipe: (direction: 'left' | 'right', cardId: string) => void;
  retryFetch: () => Promise<void>;
  selectedTags: string[];
  rightSwipedPostIds: Set<string>;
}

export function useAdaptiveSwipeDeck(): AdaptiveSwipeDeck {
  const [cards, setCards] = useState<OnboardingSwipeCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [rightSwipedPostIds, setRightSwipedPostIds] = useState<Set<string>>(
    () => new Set(),
  );

  const queryClient = useQueryClient();
  const { user } = useContext(AuthContext);
  const { logEvent } = useLogContext();

  const { mutate: addBookmark } = useMutation({
    mutationKey: bookmarkMutationKey,
    mutationFn: (postId: string) =>
      gqlClient.request(ADD_BOOKMARKS_MUTATION, {
        data: { postIds: [postId] },
      }),
  });

  // Refs for mutable state that persists across batches
  const tagScoresRef = useRef<Record<string, number>>({});
  const tagSeenCountRef = useRef<Record<string, number>>({});
  const seenIdsRef = useRef<Set<string>>(new Set());
  const likedTitlesRef = useRef<string[]>([]);
  const initialPromptRef = useRef('');
  const prefetchedRef = useRef<{
    posts: PostSummary[];
    hydrated: Map<string, Post>;
  } | null>(null);
  const swipesInBatchRef = useRef(0);
  const prefetchTriggeredRef = useRef(false);
  const selectedTagsRef = useRef<string[]>([]);
  // Lookups: recommender summary by id (for tag scoring on swipe) and the
  // hydrated Post (for bookmark + log on right-swipe).
  const summaryLookupRef = useRef<Map<string, PostSummary>>(new Map());
  const postLookupRef = useRef<Map<string, Post>>(new Map());
  const batchSizeRef = useRef(0);
  const isFetchingRef = useRef(false);

  selectedTagsRef.current = selectedTags;

  const getSaturatedTags = useCallback((): string[] => {
    return Object.entries(tagScoresRef.current)
      .filter(([, score]) => score >= SATURATE_THRESHOLD)
      .map(([tag]) => tag);
  }, []);

  const getConfirmedTags = useCallback((): string[] => {
    const selected = new Set(selectedTagsRef.current);
    return Object.entries(tagSeenCountRef.current)
      .filter(([tag, count]) => selected.has(tag) && count >= SATURATE_AFTER)
      .map(([tag]) => tag);
  }, []);

  const fetchAndHydrate = useCallback(
    async (
      n = BATCH_SIZE,
      prompt?: string,
    ): Promise<{ posts: PostSummary[]; hydrated: Map<string, Post> }> => {
      const result = await discoverPosts({
        prompt: prompt ?? '',
        selected_tags: selectedTagsRef.current,
        confirmed_tags: getConfirmedTags(),
        liked_titles: likedTitlesRef.current,
        exclude_ids: [...seenIdsRef.current],
        saturated_tags: getSaturatedTags(),
        n,
      });
      const posts = result.posts;
      for (const p of posts) {
        seenIdsRef.current.add(p.post_id);
        summaryLookupRef.current.set(p.post_id, p);
      }
      let hydrated = new Map<string, Post>();
      try {
        hydrated = await hydratePostsByIds(posts.map((p) => p.post_id));
      } catch {
        // Hydration failure leaves the batch empty; surfaced as no cards.
      }
      return { posts, hydrated };
    },
    [getSaturatedTags, getConfirmedTags],
  );

  const loadBatch = useCallback(
    (batch: { posts: PostSummary[]; hydrated: Map<string, Post> }) => {
      const nextCards: OnboardingSwipeCard[] = [];
      for (const summary of batch.posts) {
        const post = batch.hydrated.get(summary.post_id);
        if (post) {
          // Real post — prime the post-by-id cache so other hooks
          // (bookmark optimistic update, post page navigation) can find it.
          queryClient.setQueryData(getPostByIdKey(post.id), { post });
          postLookupRef.current.set(post.id, post);
          nextCards.push({ ...post, shortSummary: summary.summary });
          continue;
        }
        // No matching daily-api post (recommender corpus mismatch). Render a
        // stub so the deck stays full; right-swipe handling skips bookmarking
        // these since there is no real Post to bookmark.
        nextCards.push({
          id: summary.post_id,
          title: summary.title,
          tags: summary.tags,
          image: '',
          commentsPermalink: '',
          type: PostType.Article,
          shortSummary: summary.summary,
        });
      }
      setCards(nextCards);
      batchSizeRef.current = nextCards.length;
      swipesInBatchRef.current = 0;
      prefetchTriggeredRef.current = false;
    },
    [queryClient],
  );

  const startDeck = useCallback(
    async (options?: StartDeckOptions) => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;
      setIsLoading(true);
      try {
        // Seed with initial tags if provided
        if (options?.initialTags?.length) {
          setSelectedTags(options.initialTags);
          selectedTagsRef.current = options.initialTags;
          // Initialize tag scores for seeded tags
          const scores: Record<string, number> = {};
          for (const t of options.initialTags) {
            scores[t] = ADD_THRESHOLD;
          }
          tagScoresRef.current = scores;
        }
        // Store the initial prompt for future fetches
        if (options?.prompt) {
          initialPromptRef.current = options.prompt;
        }
        const batch = await fetchAndHydrate(BATCH_SIZE, options?.prompt);
        loadBatch(batch);
      } finally {
        setIsLoading(false);
        isFetchingRef.current = false;
      }
    },
    [fetchAndHydrate, loadBatch],
  );

  const retryFetch = useCallback(async () => {
    await startDeck();
  }, [startDeck]);

  const triggerPrefetch = useCallback(async () => {
    if (prefetchedRef.current) return;
    try {
      prefetchedRef.current = await fetchAndHydrate();
    } catch {
      // Prefetch failure is non-critical
    }
  }, [fetchAndHydrate]);

  const loadNextBatch = useCallback(async () => {
    setIsLoading(true);
    try {
      let batch: { posts: PostSummary[]; hydrated: Map<string, Post> };
      if (prefetchedRef.current) {
        batch = prefetchedRef.current;
        prefetchedRef.current = null;
      } else {
        batch = await fetchAndHydrate();
      }
      loadBatch(batch);
    } finally {
      setIsLoading(false);
    }
  }, [fetchAndHydrate, loadBatch]);

  const handleSwipe = useCallback(
    (direction: 'left' | 'right', cardId: string) => {
      const summary = summaryLookupRef.current.get(cardId);
      if (!summary) return;
      const hydratedPost = postLookupRef.current.get(cardId);

      const delta = direction === 'right' ? LIKE_SCORE : DISLIKE_SCORE;
      const tags = summary.tags;

      // Track liked posts: bookmark + log + remember id for parent UI.
      if (direction === 'right') {
        likedTitlesRef.current.push(summary.title);
        setRightSwipedPostIds((prev) => {
          const next = new Set(prev);
          next.add(cardId);
          return next;
        });
        if (hydratedPost && user) {
          addBookmark(hydratedPost.id);
          logEvent(
            postLogEvent(LogEvent.BookmarkPost, hydratedPost, {
              extra: { origin: Origin.Onboarding },
            }),
          );
        }
      }

      // --- Tag scoring (ported from PostSwiper.tsx) ---
      const scores = { ...tagScoresRef.current };
      const currentSelected = [...selectedTagsRef.current];
      const selectedSet = new Set(currentSelected);
      const promoted: string[] = [];
      const demoted: string[] = [];

      for (const tag of tags) {
        const isSelected = selectedSet.has(tag);
        tagSeenCountRef.current[tag] =
          (tagSeenCountRef.current[tag] || 0) + 1;

        if (!isSelected) {
          if (tagSeenCountRef.current[tag] >= IGNORE_AFTER) {
            delete scores[tag];
            continue;
          }
        }

        const newScore = (scores[tag] || 0) + delta;
        scores[tag] = newScore;

        if (!isSelected && newScore >= ADD_THRESHOLD) {
          promoted.push(tag);
          delete scores[tag];
          delete tagSeenCountRef.current[tag];
        } else if (isSelected && newScore <= REMOVE_THRESHOLD) {
          demoted.push(tag);
          delete scores[tag];
        } else if (
          isSelected &&
          newScore < SATURATE_THRESHOLD &&
          tagSeenCountRef.current[tag] >= SATURATE_AFTER
        ) {
          scores[tag] = SATURATE_THRESHOLD;
        }
      }

      tagScoresRef.current = scores;

      // Apply promotions and demotions
      if (promoted.length > 0 || demoted.length > 0) {
        const demotedSet = new Set(demoted);
        const nextTags = [
          ...currentSelected.filter((t) => !demotedSet.has(t)),
          ...promoted,
        ];
        setSelectedTags(nextTags);
        selectedTagsRef.current = nextTags;
      }

      // --- Prefetch and batch management ---
      swipesInBatchRef.current += 1;
      if (
        swipesInBatchRef.current >= PREFETCH_AFTER_SWIPES &&
        !prefetchTriggeredRef.current
      ) {
        prefetchTriggeredRef.current = true;
        triggerPrefetch();
      }

      // Auto-load next batch when all cards in current batch are swiped
      if (swipesInBatchRef.current >= batchSizeRef.current) {
        loadNextBatch();
      }
    },
    [addBookmark, logEvent, triggerPrefetch, loadNextBatch, user],
  );

  return {
    cards,
    isLoading,
    startDeck,
    handleSwipe,
    retryFetch,
    selectedTags,
    rightSwipedPostIds,
  };
}

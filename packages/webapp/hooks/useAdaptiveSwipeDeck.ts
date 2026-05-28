import { useCallback, useRef, useState } from 'react';
import type { OnboardingSwipeCard } from '@dailydotdev/shared/src/components/modals/hotTakes/HotAndColdModal';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { PostType } from '@dailydotdev/shared/src/graphql/posts';
import type { PostSummary } from '../lib/swipingBackendApi';
import { discoverPosts } from '../lib/swipingBackendApi';
import { fetchSwipeOnboardingPopularDeck } from '../lib/swipeOnboardingPopularDeck';

// Scoring constants.
// Each tag is scored across swipes; once a tag has been seen
// TAG_DECISION_LIMIT times, it is locked in (positive score → keep/promote
// into selectedTags) or out (non-positive score → drop from selectedTags
// and never revisit).
const LIKE_SCORE = 1.5;
const DISLIKE_SCORE = -1;
const TAG_DECISION_LIMIT = 3;
const PREFETCH_AFTER_SWIPES = 1;
const BATCH_SIZE = 12;

function toSwipeCard(post: PostSummary): OnboardingSwipeCard {
  return {
    id: post.postId,
    summary: post.summary,
    title: post.title,
    image: null,
    tags: post.tags,
    source: {
      name: 'daily.dev',
      image: null,
    },
  };
}

function toBookmarkablePost(post: PostSummary): Post {
  return {
    id: post.postId,
    title: post.title,
    summary: post.summary,
    permalink: post.url,
    commentsPermalink: post.url,
    image: '',
    tags: post.tags,
    bookmarked: false,
    type: PostType.Article,
  };
}

function postToSummary(post: Post): PostSummary {
  const title = post.title ?? '';
  return {
    postId: post.id,
    title,
    summary: post.summary ?? title,
    tags: post.tags ?? [],
    url: post.permalink ?? post.commentsPermalink ?? '',
    sourceId: post.source?.id ?? '',
  };
}

interface StartDeckOptions {
  prompt?: string;
  initialTags?: string[];
}

interface AdaptiveSwipeDeck {
  cards: OnboardingSwipeCard[];
  getBookmarkablePost: (cardId: string) => Post | undefined;
  isLoading: boolean;
  startDeck: (options?: StartDeckOptions) => Promise<void>;
  handleSwipe: (direction: 'left' | 'right', cardId: string) => void;
  retryFetch: () => Promise<void>;
  selectedTags: string[];
  appendSeedTags: (tags: string[]) => void;
}

export function useAdaptiveSwipeDeck(): AdaptiveSwipeDeck {
  const [cards, setCards] = useState<OnboardingSwipeCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Refs for mutable state that persists across batches
  const tagScoresRef = useRef<Record<string, number>>({});
  const tagSeenCountRef = useRef<Record<string, number>>({});
  const seenIdsRef = useRef<Set<string>>(new Set());
  const likedTitlesRef = useRef<string[]>([]);
  const startDeckOptionsRef = useRef<StartDeckOptions | undefined>(undefined);
  const prefetchedRef = useRef<PostSummary[] | null>(null);
  const swipesInBatchRef = useRef(0);
  const prefetchTriggeredRef = useRef(false);
  const selectedTagsRef = useRef<string[]>([]);
  // Keep a PostSummary lookup so we can access tags/title on swipe
  const postLookupRef = useRef<Map<string, PostSummary>>(new Map());
  const batchSizeRef = useRef(0);
  const isFetchingRef = useRef(false);

  selectedTagsRef.current = selectedTags;
  // Tags whose decision (in or out) has been locked after TAG_DECISION_LIMIT
  // sightings. Their scores are no longer updated by handleSwipe.
  const tagDecidedRef = useRef<Set<string>>(new Set());

  const registerPosts = useCallback((posts: PostSummary[]): void => {
    posts.forEach((post) => {
      seenIdsRef.current.add(post.postId);
      postLookupRef.current.set(post.postId, post);
    });
  }, []);

  const fetchPopularPosts = useCallback(
    async (limit: number): Promise<PostSummary[]> => {
      const popularPosts = await fetchSwipeOnboardingPopularDeck();
      return popularPosts
        .filter((post) => !seenIdsRef.current.has(post.id))
        .slice(0, limit)
        .map(postToSummary);
    },
    [],
  );

  const fetchAdaptiveOrPopular = useCallback(
    async (
      fetchAdaptive: () => Promise<PostSummary[]>,
      limit = BATCH_SIZE,
    ): Promise<PostSummary[]> => {
      try {
        const adaptivePosts = await fetchAdaptive();
        if (adaptivePosts.length > 0) {
          registerPosts(adaptivePosts);
          return adaptivePosts;
        }
      } catch {
        // Fall through to the popular deck when adaptive discovery fails.
      }

      try {
        const popularPosts = await fetchPopularPosts(limit);
        registerPosts(popularPosts);
        return popularPosts;
      } catch {
        return [];
      }
    },
    [fetchPopularPosts, registerPosts],
  );

  const doFetch = useCallback(
    async (n = BATCH_SIZE): Promise<PostSummary[]> => {
      return fetchAdaptiveOrPopular(async () => {
        const result = await discoverPosts({
          selectedTags: selectedTagsRef.current,
          likedTitles: likedTitlesRef.current,
          excludeIds: [...seenIdsRef.current],
          n,
        });
        return result.posts;
      }, n);
    },
    [fetchAdaptiveOrPopular],
  );

  const getBookmarkablePost = useCallback(
    (cardId: string): Post | undefined => {
      const post = postLookupRef.current.get(cardId);
      return post ? toBookmarkablePost(post) : undefined;
    },
    [],
  );

  const loadBatch = useCallback((posts: PostSummary[]) => {
    setCards(posts.map(toSwipeCard));
    batchSizeRef.current = posts.length;
    swipesInBatchRef.current = 0;
    prefetchTriggeredRef.current = false;
  }, []);

  const startDeck = useCallback(
    async (options?: StartDeckOptions) => {
      if (isFetchingRef.current) {
        return;
      }
      isFetchingRef.current = true;
      setIsLoading(true);
      try {
        if (options) {
          startDeckOptionsRef.current = options;
        }
        // Seed with initial tags if provided. Seeded tags are selected
        // from the start; their score evolves with swipes from 0 and the
        // tag is locked in/out after TAG_DECISION_LIMIT sightings.
        if (options?.initialTags?.length) {
          setSelectedTags(options.initialTags);
          selectedTagsRef.current = options.initialTags;
          tagScoresRef.current = {};
        }
        const posts = await fetchAdaptiveOrPopular(async () => {
          const result = await discoverPosts({
            prompt: options?.prompt ?? '',
            selectedTags: selectedTagsRef.current,
            likedTitles: likedTitlesRef.current,
            excludeIds: [...seenIdsRef.current],
            n: BATCH_SIZE,
          });
          return result.posts;
        });
        loadBatch(posts);
      } finally {
        setIsLoading(false);
        isFetchingRef.current = false;
      }
    },
    [fetchAdaptiveOrPopular, loadBatch],
  );

  const retryFetch = useCallback(async () => {
    await startDeck(startDeckOptionsRef.current);
  }, [startDeck]);

  const triggerPrefetch = useCallback(async () => {
    if (prefetchedRef.current) {
      return;
    }
    try {
      prefetchedRef.current = await doFetch();
    } catch {
      // Prefetch failure is non-critical
    }
  }, [doFetch]);

  const loadNextBatch = useCallback(async () => {
    // Only flip the loading UI when we have to wait for the network; when
    // the prefetch already landed, swap into it synchronously so the user
    // never sees a "loading" flash between batches.
    const hasPrefetched = !!prefetchedRef.current;
    if (!hasPrefetched) {
      setIsLoading(true);
    }
    try {
      let posts: PostSummary[];
      if (prefetchedRef.current) {
        posts = prefetchedRef.current;
        prefetchedRef.current = null;
      } else {
        posts = await doFetch();
      }
      loadBatch(posts);
    } finally {
      if (!hasPrefetched) {
        setIsLoading(false);
      }
    }
  }, [doFetch, loadBatch]);

  const handleSwipe = useCallback(
    (direction: 'left' | 'right', cardId: string) => {
      const post = postLookupRef.current.get(cardId);
      if (!post) {
        return;
      }

      const delta = direction === 'right' ? LIKE_SCORE : DISLIKE_SCORE;
      const { tags } = post;

      // Track liked posts
      if (direction === 'right') {
        likedTitlesRef.current.push(post.title);
      }

      // --- Tag scoring ---
      // Per tag on the swiped post: accumulate score across sightings; once
      // a tag has been seen TAG_DECISION_LIMIT times, lock its membership in
      // selectedTags based on the sign of the score and stop scoring it.
      const scores = { ...tagScoresRef.current };
      const currentSelected = [...selectedTagsRef.current];
      const selectedSet = new Set(currentSelected);
      const promoted: string[] = [];
      const demoted: string[] = [];

      tags.forEach((tag) => {
        if (tagDecidedRef.current.has(tag)) {
          return;
        }

        const isSelected = selectedSet.has(tag);
        tagSeenCountRef.current[tag] = (tagSeenCountRef.current[tag] || 0) + 1;
        const newScore = (scores[tag] || 0) + delta;
        scores[tag] = newScore;

        if (tagSeenCountRef.current[tag] < TAG_DECISION_LIMIT) {
          return;
        }

        // Decision: lock in (positive) or drop (zero/negative).
        tagDecidedRef.current.add(tag);
        delete scores[tag];

        if (newScore > 0) {
          if (!isSelected) {
            promoted.push(tag);
          }
        } else if (isSelected) {
          demoted.push(tag);
        }
      });

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
    [triggerPrefetch, loadNextBatch],
  );

  const appendSeedTags = useCallback((tags: string[]) => {
    if (!tags.length) {
      return;
    }
    const existing = new Set(selectedTagsRef.current);
    const additions = tags.filter(
      (tag) => !existing.has(tag) && !tagDecidedRef.current.has(tag),
    );
    if (!additions.length) {
      return;
    }
    const nextTags = [...selectedTagsRef.current, ...additions];
    selectedTagsRef.current = nextTags;
    setSelectedTags(nextTags);
  }, []);

  return {
    cards,
    getBookmarkablePost,
    isLoading,
    startDeck,
    handleSwipe,
    retryFetch,
    selectedTags,
    appendSeedTags,
  };
}

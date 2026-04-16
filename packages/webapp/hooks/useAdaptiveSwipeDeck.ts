import { useCallback, useRef, useState } from 'react';
import type { OnboardingSwipeCard } from '@dailydotdev/shared/src/components/modals/hotTakes/HotAndColdModal';
import type { PostSummary } from '../lib/swipingBackendApi';
import { discoverPosts } from '../lib/swipingBackendApi';

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

function toSwipeCard(post: PostSummary): OnboardingSwipeCard {
  return {
    id: post.post_id,
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

  // Refs for mutable state that persists across batches
  const tagScoresRef = useRef<Record<string, number>>({});
  const tagSeenCountRef = useRef<Record<string, number>>({});
  const seenIdsRef = useRef<Set<string>>(new Set());
  const likedTitlesRef = useRef<string[]>([]);
  const initialPromptRef = useRef('');
  const prefetchedRef = useRef<PostSummary[] | null>(null);
  const swipesInBatchRef = useRef(0);
  const prefetchTriggeredRef = useRef(false);
  const selectedTagsRef = useRef<string[]>([]);
  // Keep a PostSummary lookup so we can access tags/title on swipe
  const postLookupRef = useRef<Map<string, PostSummary>>(new Map());
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

  const doFetch = useCallback(
    async (n = BATCH_SIZE): Promise<PostSummary[]> => {
      const result = await discoverPosts({
        selected_tags: selectedTagsRef.current,
        confirmed_tags: getConfirmedTags(),
        liked_titles: likedTitlesRef.current,
        exclude_ids: [...seenIdsRef.current],
        saturated_tags: getSaturatedTags(),
        n,
      });
      const { posts } = result;
      for (const p of posts) {
        seenIdsRef.current.add(p.post_id);
        postLookupRef.current.set(p.post_id, p);
      }
      return posts;
    },
    [getSaturatedTags, getConfirmedTags],
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
        const result = await discoverPosts({
          prompt: options?.prompt ?? '',
          selected_tags: selectedTagsRef.current,
          liked_titles: likedTitlesRef.current,
          exclude_ids: [...seenIdsRef.current],
          saturated_tags: getSaturatedTags(),
          n: BATCH_SIZE,
        });
        const { posts } = result;
        for (const p of posts) {
          seenIdsRef.current.add(p.post_id);
          postLookupRef.current.set(p.post_id, p);
        }
        loadBatch(posts);
      } finally {
        setIsLoading(false);
        isFetchingRef.current = false;
      }
    },
    [getSaturatedTags, loadBatch],
  );

  const retryFetch = useCallback(async () => {
    await startDeck();
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
    setIsLoading(true);
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
      setIsLoading(false);
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
        setRightSwipedPostIds((prev) => {
          const next = new Set(prev);
          next.add(cardId);
          return next;
        });
      }

      // --- Tag scoring (ported from PostSwiper.tsx) ---
      const scores = { ...tagScoresRef.current };
      const currentSelected = [...selectedTagsRef.current];
      const selectedSet = new Set(currentSelected);
      const promoted: string[] = [];
      const demoted: string[] = [];

      for (const tag of tags) {
        const isSelected = selectedSet.has(tag);
        tagSeenCountRef.current[tag] = (tagSeenCountRef.current[tag] || 0) + 1;

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
    [triggerPrefetch, loadNextBatch],
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

import { useCallback, useEffect, useMemo, useRef } from 'react';
import usePersistentContext from '../../hooks/usePersistentContext';
import { ANON_FEED_TAGS_KEY } from './common';

const MAX_SEED_TAGS = 5;

interface UseAnonFeedTagsProps {
  /** Tags of the post currently being read — the personalization seed. */
  postTags: string[];
  /** Only seed/persist when the experience is active. */
  enabled: boolean;
}

interface UseAnonFeedTags {
  /** Tag chips to render: this post's tags plus anything followed earlier. */
  chips: string[];
  /** The tags the visitor is currently following (accumulates across posts). */
  selectedTags: string[];
  /** Tags to drive the live feed taste — falls back to the post's tags. */
  previewTags: string[];
  isReady: boolean;
  toggleTag: (tag: string) => void;
}

const dedupe = (tags: string[]): string[] => Array.from(new Set(tags));

/**
 * Progressive, no-password personalization. The article's own tags are the
 * single strongest signal we have about an anonymous reader, so we pre-select
 * them and let the visitor refine — all stored locally (IndexedDB) with no
 * account. The selection accumulates across posts so the feed they're shown
 * keeps getting more "theirs" the more they read.
 */
export const useAnonFeedTags = ({
  postTags,
  enabled,
}: UseAnonFeedTagsProps): UseAnonFeedTags => {
  const cleanPostTags = useMemo(() => dedupe(postTags ?? []), [postTags]);
  const [stored, setStored, isFetched] =
    usePersistentContext<string[]>(ANON_FEED_TAGS_KEY);
  const hasSeeded = useRef(false);

  // Seed once from the current article's tags for a brand-new visitor.
  useEffect(() => {
    if (!enabled || !isFetched || hasSeeded.current) {
      return;
    }
    hasSeeded.current = true;
    if (!stored && cleanPostTags.length > 0) {
      setStored(cleanPostTags.slice(0, MAX_SEED_TAGS));
    }
  }, [enabled, isFetched, stored, cleanPostTags, setStored]);

  const selectedTags = useMemo(() => stored ?? [], [stored]);

  const toggleTag = useCallback(
    (tag: string) => {
      const next = selectedTags.includes(tag)
        ? selectedTags.filter((item) => item !== tag)
        : [...selectedTags, tag];
      setStored(next);
    },
    [selectedTags, setStored],
  );

  const chips = useMemo(
    () => dedupe([...cleanPostTags, ...selectedTags]),
    [cleanPostTags, selectedTags],
  );

  const previewTags = selectedTags.length > 0 ? selectedTags : cleanPostTags;

  return {
    chips,
    selectedTags,
    previewTags,
    isReady: isFetched,
    toggleTag,
  };
};

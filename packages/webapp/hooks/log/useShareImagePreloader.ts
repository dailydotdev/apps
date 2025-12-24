import { useState, useRef, useEffect, useCallback } from 'react';
import { apiUrl } from '@dailydotdev/shared/src/lib/config';

// Card order for preloading
const SHAREABLE_CARDS = [
  'total-impact',
  'when-you-read',
  'topic-evolution',
  'favorite-sources',
  'community',
  'contributions',
  'records',
  'archetype',
  'share',
] as const;

type ShareableCard = (typeof SHAREABLE_CARDS)[number];

interface UseShareImagePreloaderProps {
  currentCardId: string;
  userId: string | undefined;
  isReady: boolean;
  hasContributions: boolean;
}

interface UseShareImagePreloaderReturn {
  imageCache: Map<string, Blob>;
  onImageFetched: (cardType: string, blob: Blob) => void;
}

/**
 * Hook to progressively preload share images for log cards.
 * Maintains a 2-screen buffer ahead of the current card.
 */
export function useShareImagePreloader({
  currentCardId,
  userId,
  isReady,
  hasContributions,
}: UseShareImagePreloaderProps): UseShareImagePreloaderReturn {
  const [imageCache, setImageCache] = useState<Map<string, Blob>>(new Map());
  const inFlightRef = useRef<Set<string>>(new Set());

  // Callback for when a share image is fetched on-demand (from ShareStatButton)
  const onImageFetched = useCallback((cardType: string, blob: Blob) => {
    setImageCache((prev) => new Map(prev).set(cardType, blob));
  }, []);

  // Progressive preloading - maintains 2-screen buffer ahead
  useEffect(() => {
    if (!userId || !isReady) {
      return undefined;
    }

    const preloadAhead = async () => {
      // Find current card's position in shareable cards
      const currentIdx = SHAREABLE_CARDS.indexOf(
        currentCardId as ShareableCard,
      );

      // Get the next 2 shareable cards (to maintain 2-screen buffer ahead)
      const next2Cards = SHAREABLE_CARDS.slice(currentIdx + 1)
        .filter((cardId) => {
          // Skip contributions if user doesn't have any
          if (cardId === 'contributions' && !hasContributions) {
            return false;
          }
          return true;
        })
        .slice(0, 2);

      // Only fetch the ones not already cached or in-flight
      const cardsToPreload = next2Cards.filter(
        (cardId) => !imageCache.has(cardId) && !inFlightRef.current.has(cardId),
      );

      // Mark as in-flight before fetching
      cardsToPreload.forEach((cardId) => inFlightRef.current.add(cardId));

      // Preload each card's image in parallel
      await Promise.all(
        cardsToPreload.map(async (cardId) => {
          try {
            const response = await fetch(
              `${apiUrl}/log/images?card=${encodeURIComponent(
                cardId,
              )}&userId=${encodeURIComponent(userId)}`,
              { credentials: 'include' },
            );
            if (response.ok) {
              const blob = await response.blob();
              setImageCache((prev) => new Map(prev).set(cardId, blob));
            }
          } catch {
            // Silent fail - will retry on next navigation or fetch on demand
          } finally {
            inFlightRef.current.delete(cardId);
          }
        }),
      );
    };

    // Use requestIdleCallback for non-blocking preload
    if (typeof requestIdleCallback !== 'undefined') {
      const handle = requestIdleCallback(preloadAhead, { timeout: 5000 });
      return () => cancelIdleCallback(handle);
    }
    // Fallback for browsers without requestIdleCallback
    const timer = setTimeout(preloadAhead, 100);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally exclude imageCache to only preload on navigation
  }, [currentCardId, userId, isReady, hasContributions]);

  return { imageCache, onImageFetched };
}

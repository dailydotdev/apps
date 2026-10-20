import type { ReactElement } from 'react';
import React from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { usePlusSubscription } from '../../hooks/usePlusSubscription';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import { useViewSize, ViewSize } from '../../hooks/useViewSize';
import { featureExcoPlayer } from '../../lib/featureManagement';
import { shouldSkipSourceAds } from '../../lib/ads';
import { checkIsExtension } from '../../lib/func';
import type { Post } from '../../graphql/posts';
import { ExcoPlayer } from '../../features/monetization/ExcoPlayer';

interface PostExcoPlayerWidgetProps {
  /** Its niche picks the playlist; an ad-free squad's post gets no player. */
  post: Pick<Post, 'source' | 'niche'>;
}

const playerClassName =
  'aspect-video w-full overflow-hidden rounded-16 bg-surface-float';

export function PostExcoPlayerWidget({
  post,
}: PostExcoPlayerWidgetProps): ReactElement | null {
  const { isAuthReady } = useAuthContext();
  const { isPlus } = usePlusSubscription();
  const isLaptop = useViewSize(ViewSize.Laptop);
  // The player is ad-monetized, so it follows PostSidebarAdWidget's ad-free
  // rules. Extension pages can't load remote scripts at all.
  const canEvaluate =
    isLaptop &&
    isAuthReady &&
    !isPlus &&
    !shouldSkipSourceAds(post.source) &&
    !checkIsExtension();
  const { value: config } = useConditionalFeature({
    feature: featureExcoPlayer,
    shouldEvaluate: canEvaluate,
  });
  const nicheSlug = post.niche?.slug;
  const playlistId =
    (nicheSlug ? config?.playlists?.[nicheSlug] : undefined) ??
    config?.playlistId;

  if (!canEvaluate || !config?.playerId || !playlistId) {
    return null;
  }

  // Server-rendered and feed posts don't carry the niche yet, so the box
  // waits for the post query instead of starting the fallback playlist.
  if (post.niche === undefined) {
    return <div className={playerClassName} />;
  }

  return (
    <ExcoPlayer
      key={playlistId}
      playerId={config.playerId}
      playlistId={playlistId}
      className={playerClassName}
    />
  );
}

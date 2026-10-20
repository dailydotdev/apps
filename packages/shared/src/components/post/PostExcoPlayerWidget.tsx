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
  /** The post's source; an ad-free squad gets no player and no script. */
  source: Post['source'];
}

export function PostExcoPlayerWidget({
  source,
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
    !shouldSkipSourceAds(source) &&
    !checkIsExtension();
  const { value: config } = useConditionalFeature({
    feature: featureExcoPlayer,
    shouldEvaluate: canEvaluate,
  });

  if (!canEvaluate || !config?.playerId || !config?.playlistId) {
    return null;
  }

  return (
    <ExcoPlayer
      playerId={config.playerId}
      playlistId={config.playlistId}
      className="aspect-video w-full overflow-hidden rounded-16 bg-surface-float"
    />
  );
}

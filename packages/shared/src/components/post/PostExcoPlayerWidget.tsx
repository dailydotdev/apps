import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { useAuthContext } from '../../contexts/AuthContext';
import { usePlusSubscription } from '../../hooks/usePlusSubscription';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import { useViewSize, ViewSize } from '../../hooks/useViewSize';
import { featureExcoPlayer } from '../../lib/featureManagement';
import { shouldSkipSourceAds } from '../../lib/ads';
import { checkIsExtension } from '../../lib/func';
import type { Post } from '../../graphql/posts';
import type { ExcoPlayerProps } from '../../features/monetization/ExcoPlayer';
import { ExcoPlayer } from '../../features/monetization/ExcoPlayer';
import type { ExcoPlacement } from '../../features/monetization/useExcoPlayerLogging';
import { useExcoPlayerLogging } from '../../features/monetization/useExcoPlayerLogging';

interface PostExcoPlayerWidgetProps {
  /** The post's source; an ad-free squad gets no player and no script. */
  source: Post['source'];
  /** `rail` from laptop up, `inline` above the comments below it. */
  placement: ExcoPlacement;
  className?: string;
}

// On a wrapper, not the player's element: EX.CO adds its `pbs` class there
// and hides any `.pbs` that also carries `hidden`, media query or not.
const placementClassName: Record<ExcoPlacement, string> = {
  rail: 'hidden laptop:block',
  inline: 'laptop:hidden',
};

// Below laptop a floating player would cover the post it sits in.
const inlineSticky: ExcoPlayerProps['sticky'] = {
  desktop: { enabled: false },
  mobile: { enabled: false },
};

export function PostExcoPlayerWidget({
  source,
  placement,
  className,
}: PostExcoPlayerWidgetProps): ReactElement | null {
  const { isAuthReadyOrCached } = useAuthContext();
  const { isPlus } = usePlusSubscription();
  const isLaptop = useViewSize(ViewSize.Laptop);
  // The player is ad-monetized, so it follows PostSidebarAdWidget's ad-free
  // rules. Extension pages can't load remote scripts at all.
  const isAdFree = shouldSkipSourceAds(source) || checkIsExtension();
  const canEvaluate = isAuthReadyOrCached && !isPlus && !isAdFree;
  const { value: config, isLoading } = useConditionalFeature({
    feature: featureExcoPlayer,
    shouldEvaluate: canEvaluate,
  });
  const { onEvent, onError } = useExcoPlayerLogging({
    playerId: config?.playerId ?? '',
    playlistId: config?.playlistId ?? '',
    placement,
  });
  const boxClassName =
    'aspect-video w-full overflow-hidden rounded-16 bg-surface-float';
  const wrapperClassName = classNames(placementClassName[placement], className);

  if (isAdFree) {
    return null;
  }

  // The server render can't know the viewer, so the box holds the player's
  // space until auth and the flag settle, and only collapses for viewers who
  // turn out not to get one.
  if (!isAuthReadyOrCached || (canEvaluate && isLoading)) {
    return (
      <div className={wrapperClassName}>
        <div className={boxClassName} />
      </div>
    );
  }

  const isPlacementShown = placement === 'rail' ? isLaptop : !isLaptop;

  if (
    !canEvaluate ||
    !config?.playerId ||
    !config?.playlistId ||
    !isPlacementShown
  ) {
    return null;
  }

  return (
    <div className={wrapperClassName}>
      <ExcoPlayer
        playerId={config.playerId}
        playlistId={config.playlistId}
        className={boxClassName}
        sticky={placement === 'inline' ? inlineSticky : undefined}
        onEvent={onEvent}
        onError={onError}
      />
    </div>
  );
}

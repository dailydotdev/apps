import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { useAuthContext } from '../../contexts/AuthContext';
import { usePlusSubscription } from '../../hooks/usePlusSubscription';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import { useViewSize, ViewSize } from '../../hooks/useViewSize';
import { featureExcoPlayer } from '../../lib/featureManagement';
import { shouldSkipSourceAds } from '../../lib/ads';
import { checkIsExtension } from '../../lib/func';
import type { Post } from '../../graphql/posts';
import { SourceType } from '../../graphql/sources';
import type {
  ExcoPlayerFailure,
  ExcoPlayerProps,
} from '../../features/monetization/ExcoPlayer';
import { ExcoPlayer } from '../../features/monetization/ExcoPlayer';
import { ExcoPlayerFrame } from '../../features/monetization/ExcoPlayerFrame';
import {
  isExcoId,
  isExcoPlayerBlocked,
} from '../../features/monetization/exco';
import type { ExcoPlacement } from '../../features/monetization/useExcoPlayerLogging';
import { useExcoPlayerLogging } from '../../features/monetization/useExcoPlayerLogging';

interface PostExcoPlayerWidgetProps {
  /** Its playlist plays; an ad-free squad's post gets no player. */
  post: Pick<Post, 'id' | 'source' | 'excoPlaylistId'>;
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

interface PostExcoPlayerProps {
  playerId: string;
  playlistId: string;
  placement: ExcoPlacement;
  className: { wrapper: string; box: string };
}

function PostExcoPlayer({
  playerId,
  playlistId,
  placement,
  className,
}: PostExcoPlayerProps): ReactElement | null {
  const [hasFailed, setHasFailed] = useState(false);
  const { onEvent, onError } = useExcoPlayerLogging({
    playerId,
    playlistId,
    placement,
  });
  const onPlayerError = (reason: ExcoPlayerFailure) => {
    setHasFailed(true);
    onError(reason);
  };

  if (hasFailed) {
    return null;
  }

  // Extension pages can't load the player's remote script, so the extension
  // frames it from the webapp.
  return (
    <div className={className.wrapper}>
      {checkIsExtension() ? (
        <ExcoPlayerFrame
          playerId={playerId}
          playlistId={playlistId}
          className={className.box}
          onEvent={onEvent}
          onError={onPlayerError}
        />
      ) : (
        <ExcoPlayer
          playerId={playerId}
          playlistId={playlistId}
          className={className.box}
          sticky={placement === 'inline' ? inlineSticky : undefined}
          onEvent={onEvent}
          onError={onPlayerError}
        />
      )}
    </div>
  );
}

export function PostExcoPlayerWidget({
  post,
  placement,
  className,
}: PostExcoPlayerWidgetProps): ReactElement | null {
  const { isAuthReadyOrCached } = useAuthContext();
  const { isPlus } = usePlusSubscription();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const [qaPlayerId, setQaPlayerId] = useState<string>();

  // EX.CO QAs the integration on any post page with `?exco_player=<id>`,
  // which stands in for the flag and the Plus check on that page. The post
  // page's layout rewrite keeps the param out of the router's query.
  useEffect(() => {
    const id = new URLSearchParams(globalThis.location.search).get(
      'exco_player',
    );

    if (id && isExcoId(id)) {
      setQaPlayerId(id);
    }
  }, []);

  // The player is ad-monetized, so it follows PostSidebarAdWidget's ad-free
  // rules. A feed post's squad comes without `adFree`, so it waits for the
  // post query instead of holding space for an ad-free squad.
  const isAdFree =
    shouldSkipSourceAds(post.source) ||
    (post.source?.type === SourceType.Squad &&
      post.source.features?.adFree === undefined);
  const canEvaluate =
    isAuthReadyOrCached && !isPlus && !isAdFree && !qaPlayerId;
  const { value: config, isLoading } = useConditionalFeature({
    feature: featureExcoPlayer,
    shouldEvaluate: canEvaluate,
  });
  const playerId = qaPlayerId ?? (canEvaluate ? config?.playerId : undefined);
  const playlistId = post.excoPlaylistId;
  const boxClassName =
    'aspect-video w-full overflow-hidden rounded-16 bg-surface-float';
  const wrapperClassName = classNames(placementClassName[placement], className);

  // Once blocked, the script stays blocked for the page's lifetime, so later
  // posts don't hold a box only to collapse it.
  if (isAdFree || (!!playerId && isExcoPlayerBlocked(playerId))) {
    return null;
  }

  // The server render can't know the viewer, and server-rendered or feed
  // posts don't carry the playlist until the post query lands. Nothing holds
  // the player's space until auth, the flag and the playlist settle, so with
  // `exco_player` off the page renders as if the player didn't exist, and a
  // viewer's box appears when the player mounts.
  const isPlaylistPending = playlistId === undefined && !!playerId;

  if (!isAuthReadyOrCached || (canEvaluate && isLoading) || isPlaylistPending) {
    return null;
  }

  const isPlacementShown = placement === 'rail' ? isLaptop : !isLaptop;

  if (!playerId || !playlistId || !isPlacementShown) {
    return null;
  }

  // Keyed by post: the modal swaps posts in place, and each post gets its own
  // player and impression.
  return (
    <PostExcoPlayer
      key={`${post.id}:${playlistId}`}
      playerId={playerId}
      playlistId={playlistId}
      placement={placement}
      className={{ wrapper: wrapperClassName, box: boxClassName }}
    />
  );
}

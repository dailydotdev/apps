import type { ReactElement } from 'react';
import React, { useCallback, useEffect } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import EntityCard from '@dailydotdev/shared/src/components/cards/entity/EntityCard';
import EntityCardSkeleton from '@dailydotdev/shared/src/components/cards/entity/EntityCardSkeleton';
import AdAttribution from '@dailydotdev/shared/src/components/cards/ad/common/AdAttribution';
import { AdPixel } from '@dailydotdev/shared/src/components/cards/ad/common/AdPixel';
import { AdViewability } from '@dailydotdev/shared/src/components/cards/ad/common/AdViewability';
import type { ViewabilityData } from '@dailydotdev/shared/src/features/monetization/viewability';
import { viewabilityLogExtra } from '@dailydotdev/shared/src/features/monetization/viewability';
import { getAdFaviconImageLink } from '@dailydotdev/shared/src/components/cards/ad/common/getAdFaviconImageLink';
import { useFeature } from '@dailydotdev/shared/src/components/GrowthBookProvider';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { useAdQuery } from '@dailydotdev/shared/src/features/monetization/useAdQuery';
import { usePlusSubscription } from '@dailydotdev/shared/src/hooks/usePlusSubscription';
import { ImpressionStatus } from '@dailydotdev/shared/src/hooks/feed/useLogImpression';
import {
  AdActions,
  AdPlacement,
  shouldSkipSourceAds,
} from '@dailydotdev/shared/src/lib/ads';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { adLogEvent } from '@dailydotdev/shared/src/lib/feed';
import { adImprovementsV3Feature } from '@dailydotdev/shared/src/lib/featureManagement';
import {
  generateQueryKey,
  RequestKey,
  StaleTime,
} from '@dailydotdev/shared/src/lib/query';
import { TargetId } from '@dailydotdev/shared/src/lib/log';
import { combinedClicks } from '@dailydotdev/shared/src/lib/click';
import { anchorSponsoredRel } from '@dailydotdev/shared/src/lib/strings';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { AdvertiseLink } from '@dailydotdev/shared/src/components/cards/ad/common/AdvertiseLink';
import {
  isSquadAd,
  SquadAdEntityCard,
} from '@dailydotdev/shared/src/components/cards/ad/squad/SquadAdEntityCard';

/**
 * PostSidebarAdWidget with one change: "Advertise here" sits flush left
 * under the copy instead of pushed to the right edge.
 */
interface SidebarAdProps {
  postId: string;
  /** The post's source; an ad-free squad gets no ad and no ad request. */
  source: Post['source'];
  className?: {
    container?: string;
  };
}

export function SidebarAd({
  postId,
  source,
  className,
}: SidebarAdProps): ReactElement | null {
  const { user } = useAuthContext();
  const { isPlus } = usePlusSubscription();
  const { logEvent } = useLogContext();
  const adImprovementsV3 = Boolean(useFeature(adImprovementsV3Feature));
  const isAdFree = isPlus || shouldSkipSourceAds(source);

  const { data: ad, isPending } = useAdQuery({
    placement: AdPlacement.PostSidebar,
    queryKey: generateQueryKey(RequestKey.Ads, user, postId, 'post-sidebar'),
    enabled: !isAdFree,
    staleTime: StaleTime.OneHour,
  });

  const onAdAction = useCallback(
    (action: AdActions, extra?: Record<string, unknown>) => {
      if (!ad) {
        return;
      }

      logEvent(
        adLogEvent(action, ad, {
          extra: { origin: 'post page sidebar widget', ...extra },
        }),
      );
    },
    [logEvent, ad],
  );

  const onViewable = useCallback(
    (data: ViewabilityData) =>
      onAdAction(AdActions.Viewable, viewabilityLogExtra(data)),
    [onAdAction],
  );

  const squadAd = isSquadAd(ad) ? ad : undefined;
  const shouldShowAd =
    !isAdFree && (squadAd ? squadAd.data.source.id !== source?.id : !!ad?.link);

  useEffect(() => {
    if (
      !ad ||
      !shouldShowAd ||
      ad.impressionStatus === ImpressionStatus.LOGGED
    ) {
      return;
    }

    onAdAction(AdActions.Impression);
    ad.impressionStatus = ImpressionStatus.LOGGED;
  }, [ad, onAdAction, shouldShowAd]);

  if (isAdFree) {
    return null;
  }

  if (isPending) {
    return <EntityCardSkeleton className={className} />;
  }

  if (!ad || !shouldShowAd) {
    return null;
  }

  if (squadAd) {
    return (
      <SquadAdEntityCard
        ad={squadAd}
        variant="card"
        className={className?.container}
        onClickAd={() => onAdAction(AdActions.Click)}
        onViewable={onViewable}
      />
    );
  }

  const company = ad.company?.trim();
  const hasDescription = !!ad.description || !!ad.tagLine;
  const imageLink = getAdFaviconImageLink({
    ad,
    adImprovementsV3,
    size: 24,
  });

  return (
    <EntityCard
      image={imageLink}
      permalink={ad.link}
      entityName={ad.source}
      className={{
        container: classNames('relative cursor-pointer', className?.container),
        image: 'size-10 rounded-full',
      }}
      actionButtons={
        <Button
          tag="a"
          href={ad.link}
          target="_blank"
          rel={anchorSponsoredRel}
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
          className="relative z-1"
          onClick={() => onAdAction(AdActions.Click)}
        >
          Visit
        </Button>
      }
    >
      <a
        href={ad.link}
        target="_blank"
        rel={anchorSponsoredRel}
        title={ad.description}
        className="absolute inset-0 z-0"
        {...combinedClicks(() => onAdAction(AdActions.Click))}
      />
      <div className="mt-3 flex w-full flex-col gap-2">
        {company && (
          <Typography
            tag={TypographyTag.P}
            type={TypographyType.Body}
            color={TypographyColor.Primary}
            bold
          >
            {company}
          </Typography>
        )}
        <AdAttribution ad={ad} className={{ main: 'relative z-1' }} />
        {hasDescription && (
          <Typography
            tag={TypographyTag.P}
            type={TypographyType.Callout}
            color={TypographyColor.Primary}
            className="whitespace-pre-line"
          >
            {ad.tagLine && <strong>{ad.tagLine}</strong>}
            {ad.tagLine && ad.description ? ' ' : ''}
            {ad.description}
          </Typography>
        )}
        <AdvertiseLink
          targetId={TargetId.AdSidebar}
          className="relative z-1 w-fit whitespace-nowrap hover:underline"
        />
      </div>
      <AdPixel pixel={ad.pixel} />
      <AdViewability ad={ad} onViewable={onViewable} />
    </EntityCard>
  );
}

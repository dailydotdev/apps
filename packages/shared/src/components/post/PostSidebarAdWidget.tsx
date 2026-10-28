import type { ReactElement } from 'react';
import React, { useCallback, useEffect } from 'react';
import classNames from 'classnames';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import EntityCard from '../cards/entity/EntityCard';
import EntityCardSkeleton from '../cards/entity/EntityCardSkeleton';
import AdAttribution from '../cards/ad/common/AdAttribution';
import { AdPixel } from '../cards/ad/common/AdPixel';
import { AdViewability } from '../cards/ad/common/AdViewability';
import type { ViewabilityData } from '../../features/monetization/viewability';
import { viewabilityLogExtra } from '../../features/monetization/viewability';
import { getAdFaviconImageLink } from '../cards/ad/common/getAdFaviconImageLink';
import { useFeature } from '../GrowthBookProvider';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import { useAdQuery } from '../../features/monetization/useAdQuery';
import { usePlusSubscription } from '../../hooks/usePlusSubscription';
import { ImpressionStatus } from '../../hooks/feed/useLogImpression';
import { AdActions, AdPlacement, shouldSkipSourceAds } from '../../lib/ads';
import type { Post } from '../../graphql/posts';
import { adLogEvent } from '../../lib/feed';
import { adImprovementsV3Feature } from '../../lib/featureManagement';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import { TargetId } from '../../lib/log';
import { combinedClicks } from '../../lib/click';
import { anchorSponsoredRel } from '../../lib/strings';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { AdvertiseLink } from '../cards/ad/common/AdvertiseLink';
import {
  isSquadAd,
  SquadAdEntityCard,
} from '../cards/ad/squad/SquadAdEntityCard';

interface PostSidebarAdWidgetProps {
  postId: string;
  /** The post's source; an ad-free squad gets no ad and no ad request. */
  source: Post['source'];
  className?: {
    container?: string;
  };
}

export function PostSidebarAdWidget({
  postId,
  source,
  className,
}: PostSidebarAdWidgetProps): ReactElement | null {
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
          className="relative z-1 ml-auto whitespace-nowrap hover:underline"
        />
      </div>
      <AdPixel pixel={ad.pixel} />
      <AdViewability ad={ad} onViewable={onViewable} />
    </EntityCard>
  );
}

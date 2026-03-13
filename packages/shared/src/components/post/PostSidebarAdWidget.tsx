import type { ReactElement } from 'react';
import React, { useCallback, useEffect } from 'react';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import EntityCard from '../cards/entity/EntityCard';
import EntityCardSkeleton from '../cards/entity/EntityCardSkeleton';
import AdAttribution from '../cards/ad/common/AdAttribution';
import { AdPixel } from '../cards/ad/common/AdPixel';
import { getAdFaviconImageLink } from '../cards/ad/common/getAdFaviconImageLink';
import { useFeature } from '../GrowthBookProvider';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import { useAdQuery } from '../../features/monetization/useAdQuery';
import { usePlusSubscription } from '../../hooks/usePlusSubscription';
import { ImpressionStatus } from '../../hooks/feed/useLogImpression';
import { AdActions, AdPlacement } from '../../lib/ads';
import { adLogEvent } from '../../lib/feed';
import { adImprovementsV3Feature } from '../../lib/featureManagement';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';

interface PostSidebarAdWidgetProps {
  postId: string;
  className?: {
    container?: string;
  };
}

export function PostSidebarAdWidget({
  postId,
  className,
}: PostSidebarAdWidgetProps): ReactElement | null {
  const { user } = useAuthContext();
  const { isPlus } = usePlusSubscription();
  const { logEvent } = useLogContext();
  const adImprovementsV3 = useFeature(adImprovementsV3Feature);

  const { data: ad, isPending } = useAdQuery({
    placement: AdPlacement.PostSidebar,
    queryKey: generateQueryKey(RequestKey.Ads, user, postId, 'post-sidebar'),
    enabled: !isPlus,
    staleTime: StaleTime.OneHour,
  });

  const onAdAction = useCallback(
    (action: AdActions) => {
      if (!ad) {
        return;
      }

      logEvent(
        adLogEvent(action, ad, {
          extra: { origin: 'post page sidebar widget' },
        }),
      );
    },
    [logEvent, ad],
  );

  useEffect(() => {
    if (!ad || ad.impressionStatus === ImpressionStatus.LOGGED) {
      return;
    }

    onAdAction(AdActions.Impression);
    ad.impressionStatus = ImpressionStatus.LOGGED;
  }, [ad, onAdAction]);

  if (isPlus) {
    return null;
  }

  if (isPending) {
    return <EntityCardSkeleton className={className} />;
  }

  if (!ad) {
    return null;
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
        container: className?.container,
        image: 'size-10 rounded-full',
      }}
      actionButtons={
        <Button
          tag="a"
          href={ad.link}
          target="_blank"
          rel="noopener"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
          onClick={() => onAdAction(AdActions.Click)}
        >
          Visit
        </Button>
      }
    >
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
        <AdAttribution ad={ad} />
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
      </div>
      <AdPixel pixel={ad.pixel} />
    </EntityCard>
  );
}

import type { ReactElement } from 'react';
import React, { useCallback, useEffect } from 'react';
import classNames from 'classnames';
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
import { TargetId } from '../../lib/log';
import { combinedClicks } from '../../lib/click';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { AdvertiseLink } from '../cards/ad/common/AdvertiseLink';
import { Image } from '../image/Image';

interface PostSidebarAdWidgetProps {
  postId: string;
  /**
   * `card` (default) is the boxed sidebar widget. `inline` is a flat,
   * borderless-background layout for in-content placements: the company name
   * sits on the favicon line, with "Promoted" + the advertise link below it.
   */
  variant?: 'card' | 'inline';
  className?: {
    container?: string;
  };
}

export function PostSidebarAdWidget({
  postId,
  variant = 'card',
  className,
}: PostSidebarAdWidgetProps): ReactElement | null {
  const { user } = useAuthContext();
  const { isPlus } = usePlusSubscription();
  const { logEvent } = useLogContext();
  const adImprovementsV3 = Boolean(useFeature(adImprovementsV3Feature));

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

  if (!ad?.link) {
    return null;
  }

  const company = ad.company?.trim();
  const hasDescription = !!ad.description || !!ad.tagLine;
  const imageLink = getAdFaviconImageLink({
    ad,
    adImprovementsV3,
    size: 24,
  });

  if (variant === 'inline') {
    const tagLine = ad.tagLine?.trim();
    const description = ad.description?.trim();
    // Always surface a title on the icon line: the company, else the
    // tagline, else the description. Whatever is left over renders in the
    // body — so a description-only ad has no extra body row.
    const inlineTitle = company || tagLine || description;
    const inlineBodyTagLine = company ? tagLine : undefined;
    const inlineBodyDescription = company || tagLine ? description : undefined;
    const inlineHasBody = !!inlineBodyTagLine || !!inlineBodyDescription;

    return (
      <div
        className={classNames(
          'relative flex w-full flex-col gap-2 rounded-16 border border-border-subtlest-tertiary p-3 transition-colors hover:border-border-subtlest-primary hover:bg-surface-hover',
          className?.container,
        )}
      >
        <a
          href={ad.link}
          target="_blank"
          rel="noopener"
          title={ad.description}
          className="absolute inset-0 z-0"
          {...combinedClicks(() => onAdAction(AdActions.Click))}
        />
        <div className="flex w-full items-center gap-3">
          <Image
            src={imageLink}
            alt={ad.source}
            className="size-10 shrink-0 rounded-full object-cover"
          />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            {inlineTitle && (
              <Typography
                tag={TypographyTag.P}
                type={TypographyType.Callout}
                color={TypographyColor.Primary}
                className="line-clamp-2 font-medium"
              >
                {inlineTitle}
              </Typography>
            )}
            <div className="flex items-center gap-1.5">
              <AdAttribution ad={ad} className={{ main: 'relative z-1' }} />
              <span aria-hidden className="text-text-quaternary typo-footnote">
                ·
              </span>
              <AdvertiseLink
                targetId={TargetId.AdSidebar}
                className="relative z-1 whitespace-nowrap hover:underline"
              />
            </div>
          </div>
          <Button
            tag="a"
            href={ad.link}
            target="_blank"
            rel="noopener"
            variant={ButtonVariant.Primary}
            size={ButtonSize.Small}
            className="relative z-1 ml-auto shrink-0"
            onClick={() => onAdAction(AdActions.Click)}
          >
            Visit
          </Button>
        </div>
        {inlineHasBody && (
          <Typography
            tag={TypographyTag.P}
            type={TypographyType.Callout}
            color={TypographyColor.Primary}
            className="relative z-1 whitespace-pre-line"
          >
            {inlineBodyTagLine && <strong>{inlineBodyTagLine}</strong>}
            {inlineBodyTagLine && inlineBodyDescription ? ' ' : ''}
            {inlineBodyDescription}
          </Typography>
        )}
        <span className="absolute bottom-0 left-0">
          <AdPixel pixel={ad.pixel} />
        </span>
      </div>
    );
  }

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
          rel="noopener"
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
        rel="noopener"
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
    </EntityCard>
  );
}

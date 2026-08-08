import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { Button } from '../../../components/buttons/Button';
import { ButtonSize, ButtonVariant } from '../../../components/buttons/common';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { AdPixel } from '../../../components/cards/ad/common/AdPixel';
import { AdMeasurement } from '../../../components/cards/ad/common/AdMeasurement';
import { AdViewability } from '../../../components/cards/ad/common/AdViewability';
import { AdvertiseLink } from '../../../components/cards/ad/common/AdvertiseLink';
import { RemoveAd } from '../../../components/cards/ad/common/RemoveAd';
import { getAdFaviconImageLink } from '../../../components/cards/ad/common/getAdFaviconImageLink';
import { Image } from '../../../components/image/Image';
import { adFaviconPlaceholder } from '../../../lib/image';
import { useFeature } from '../../../components/GrowthBookProvider';
import { adImprovementsV3Feature } from '../../../lib/featureManagement';
import type { Ad } from '../../../graphql/posts';
import type { ViewabilityData } from '../../monetization/viewability';
import { useAdClickUrl } from '../../monetization/useAdClickUrl';
import { useAdLabel } from '../../monetization/useAdLabel';
import { usePlusSubscription } from '../../../hooks/usePlusSubscription';
import { combinedClicks } from '../../../lib/click';
import { TargetId } from '../../../lib/log';
import { DealsAdLabel } from './DealsAdLabel';

interface DealsAdPanelProps {
  ad: Ad;
  onLinkClick?: (ad: Ad) => void;
  onViewable?: (ad: Ad, data: ViewabilityData) => void;
  className?: string;
}

/**
 * The one paid slot a deal page carries, built on the same anatomy as the post
 * page's inline ad. It sits below the trust content on purpose: nothing paid
 * comes between the offer and what a reader has to watch out for.
 */
export const DealsAdPanel = ({
  ad,
  onLinkClick,
  onViewable,
  className,
}: DealsAdPanelProps): ReactElement | null => {
  const { isPlus } = usePlusSubscription();
  const { showAdvertiseLink } = useAdLabel();
  const adImprovementsV3 = !!useFeature(adImprovementsV3Feature);
  const clickUrl = useAdClickUrl(ad);
  const faviconLink = getAdFaviconImageLink({ ad, adImprovementsV3, size: 40 });

  if (isPlus) {
    return null;
  }

  return (
    <aside
      data-testid="dealsAdPanel"
      aria-label="Advertisement"
      className={classNames(
        'relative flex w-full flex-col gap-3 rounded-16 border border-border-subtlest-tertiary p-4 transition-colors hover:bg-surface-hover',
        className,
      )}
    >
      <a
        href={clickUrl}
        target="_blank"
        rel="sponsored nofollow noopener"
        title={ad.description}
        aria-label={`${ad.tagLine ?? ad.description}, promoted by ${
          ad.company
        }, opens in a new tab`}
        className="absolute inset-0 z-0"
        {...combinedClicks(() => onLinkClick?.(ad))}
      />

      <div className="flex w-full items-center gap-3">
        <Image
          src={faviconLink}
          alt={ad.company}
          fallbackSrc={adFaviconPlaceholder}
          className="size-10 shrink-0 rounded-full object-cover"
          style={{ backgroundColor: ad.backgroundColor }}
        />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Callout}
            bold
            truncate
          >
            {ad.company}
          </Typography>
          <div className="flex items-center gap-1.5">
            <DealsAdLabel ad={ad} className="relative z-1 typo-footnote" />
            {showAdvertiseLink && (
              <>
                <span
                  aria-hidden
                  className="text-text-quaternary typo-footnote"
                >
                  ·
                </span>
                <AdvertiseLink
                  targetId={TargetId.AdCard}
                  className="relative z-1 whitespace-nowrap hover:underline"
                />
              </>
            )}
          </div>
        </div>
        {!!ad.callToAction && (
          <Button
            tag="a"
            href={clickUrl}
            target="_blank"
            rel="sponsored nofollow noopener"
            variant={ButtonVariant.Secondary}
            size={ButtonSize.Small}
            className="relative z-1 shrink-0"
            {...combinedClicks(() => onLinkClick?.(ad))}
          >
            {ad.callToAction}
          </Button>
        )}
      </div>

      <Typography
        tag={TypographyTag.P}
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
        className="relative z-1"
      >
        {ad.tagLine && (
          <strong className="text-text-primary">{ad.tagLine}. </strong>
        )}
        {ad.description}
      </Typography>

      <RemoveAd
        size={ButtonSize.XSmall}
        className="relative z-1 !font-normal typo-caption1"
      />

      <AdPixel pixel={ad.pixel} />
      <AdMeasurement ad={ad} />
      <AdViewability ad={ad} onViewable={(data) => onViewable?.(ad, data)} />
    </aside>
  );
};

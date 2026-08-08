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
import { AdImage } from '../../../components/cards/ad/common/AdImage';
import { AdPixel } from '../../../components/cards/ad/common/AdPixel';
import { AdMeasurement } from '../../../components/cards/ad/common/AdMeasurement';
import { AdViewability } from '../../../components/cards/ad/common/AdViewability';
import { AdvertiseLink } from '../../../components/cards/ad/common/AdvertiseLink';
import { RemoveAd } from '../../../components/cards/ad/common/RemoveAd';
import { Image } from '../../../components/image/Image';
import classed from '../../../lib/classed';
import type { Ad } from '../../../graphql/posts';
import type { ViewabilityData } from '../../monetization/viewability';
import { useAdClickUrl } from '../../monetization/useAdClickUrl';
import { useAdLabel } from '../../monetization/useAdLabel';
import { usePlusSubscription } from '../../../hooks/usePlusSubscription';
import { combinedClicks } from '../../../lib/click';
import { TargetId } from '../../../lib/log';
import { DealsAdLabel } from './DealsAdLabel';

interface DealsAdRowProps {
  ad: Ad;
  onLinkClick?: (ad: Ad) => void;
  onViewable?: (ad: Ad, data: ViewabilityData) => void;
  className?: string;
}

const AdRowImage = classed(Image, 'size-full object-cover');

/**
 * A paid slot shaped like a deal row so the list still scans, and worded so it
 * can never be mistaken for one: no value badge, no community proof, no pick
 * label, and the promoted disclosure sits where a deal prints its type.
 */
export const DealsAdRow = ({
  ad,
  onLinkClick,
  onViewable,
  className,
}: DealsAdRowProps): ReactElement | null => {
  const { isPlus } = usePlusSubscription();
  const { showAdvertiseLink } = useAdLabel();
  const clickUrl = useAdClickUrl(ad);

  if (isPlus) {
    return null;
  }

  return (
    <li
      data-testid="dealsAdRow"
      className={classNames(
        'relative flex gap-4 border-t border-border-subtlest-tertiary px-2 py-4 transition-colors first:border-t-0 hover:bg-surface-hover',
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

      <div
        className="size-16 shrink-0 overflow-hidden rounded-16 tablet:size-20"
        style={{ backgroundColor: ad.backgroundColor }}
      >
        <AdImage
          ad={ad}
          ImageComponent={AdRowImage}
          className="!my-0 size-full"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3 tablet:flex-row tablet:items-start tablet:gap-6">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2">
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Footnote}
              bold
              truncate
            >
              {ad.company}
            </Typography>
            <DealsAdLabel ad={ad} className="relative z-1 typo-caption1" />
          </div>

          <Typography
            tag={TypographyTag.P}
            type={TypographyType.Body}
            bold
            className="line-clamp-1"
          >
            {ad.tagLine ?? ad.description}
          </Typography>

          {!!ad.tagLine && (
            <Typography
              tag={TypographyTag.P}
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
              className="line-clamp-1"
            >
              {ad.description}
            </Typography>
          )}

          {showAdvertiseLink && (
            <AdvertiseLink targetId={TargetId.AdCard} className="z-1 w-fit" />
          )}
        </div>

        <div className="z-1 flex shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-2 tablet:min-w-52 tablet:flex-col tablet:items-end">
          {!!ad.callToAction && (
            <Button
              tag="a"
              href={clickUrl}
              target="_blank"
              rel="sponsored nofollow noopener"
              variant={ButtonVariant.Secondary}
              size={ButtonSize.Small}
              {...combinedClicks(() => onLinkClick?.(ad))}
            >
              {ad.callToAction}
            </Button>
          )}
          <RemoveAd
            size={ButtonSize.XSmall}
            className="!ml-0 !font-normal typo-caption1"
          />
        </div>
      </div>

      <AdPixel pixel={ad.pixel} />
      <AdMeasurement ad={ad} />
      <AdViewability ad={ad} onViewable={(data) => onViewable?.(ad, data)} />
    </li>
  );
};

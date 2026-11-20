import type { CSSProperties, ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import { AdSlot } from '../../../components/cards/ad/common/AdSlot';
import { AdPixel } from '../../../components/cards/ad/common/AdPixel';
import { getViewedPixels } from '../../../components/cards/ad/common/ownPixels';
import { anchorSponsoredRel } from '../../../lib/strings';
import { boxedLogoHeight, boxedLogoWidth } from './sponsorLogoSizing';
import type { ResolvedSponsor } from './sponsorStripCreative';
import { getSponsorAd, getSponsorLogo } from './sponsorStripCreative';
import { useSponsorSlotLog } from './useSponsorSlotLog';
import { useIsLightTheme } from '../../../hooks/utils/useThemedAsset';
import { useAdLifecycle } from '../useAdLifecycle';

interface SponsorLogoProps {
  sponsor: ResolvedSponsor;
  slotIndex: number;
  height: number;
  /** Width ceiling for long wordmarks; the link keeps the artwork's width. */
  maxWidth?: number;
  /**
   * Draw the mark as a single-colour silhouette that takes the surrounding
   * text colour, instead of the file's own inks. This is what makes a wall of
   * marks from a dozen advertisers read as one row in both themes — full
   * colour there is a patchwork, and half the marks die against one ground.
   * The gold slot is the exception: its brand colour is what was sold.
   */
  monochrome?: boolean;
  className?: string;
}

export const SponsorLogo = ({
  sponsor,
  slotIndex,
  height,
  maxWidth,
  monochrome = false,
  className,
}: SponsorLogoProps): ReactElement => {
  const ad = useMemo(() => getSponsorAd(sponsor), [sponsor]);
  const { isEnabled } = useAdLifecycle(!!sponsor.lifecycle);
  const { ref, isViewable, onClick } = useSponsorSlotLog<HTMLAnchorElement>({
    sponsor,
    slotIndex,
  });
  const viewedPixels = useMemo(
    () =>
      isEnabled && sponsor.lifecycle?.on.viewable
        ? []
        : getViewedPixels(sponsor.pixel),
    [isEnabled, sponsor.pixel, sponsor.lifecycle],
  );
  const isLightTheme = useIsLightTheme();
  const logo = getSponsorLogo(sponsor, isLightTheme);
  const { ratio } = sponsor;

  const fittedHeight = boxedLogoHeight(
    ratio,
    height,
    maxWidth ?? Number.POSITIVE_INFINITY,
  );
  const size: CSSProperties = {
    height: `${fittedHeight}px`,
    width:
      monochrome || maxWidth
        ? `${boxedLogoWidth(
            ratio,
            height,
            maxWidth ?? Number.POSITIVE_INFINITY,
          )}px`
        : 'auto',
  };

  return (
    <AdSlot ad={ad} trackClicks={false}>
      {(slotProps) => (
        <a
          {...slotProps}
          ref={ref}
          href={sponsor.link}
          target="_blank"
          rel={anchorSponsoredRel}
          title={sponsor.company}
          onClick={onClick}
          className={classNames(
            'relative flex shrink-0 items-center justify-center',
            className,
          )}
        >
          {monochrome ? (
            <span
              role="img"
              aria-label={sponsor.company}
              className="block"
              style={{
                ...size,
                // `bg-current` is not in this palette — the design tokens replace
                // the default colours — so the ink is painted directly and the
                // logo file is what shapes it.
                backgroundColor: 'currentColor',
                maskImage: `url(${logo})`,
                maskRepeat: 'no-repeat',
                maskPosition: 'center',
                maskSize: 'contain',
                WebkitMaskImage: `url(${logo})`,
                WebkitMaskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                WebkitMaskSize: 'contain',
              }}
            />
          ) : (
            <img
              src={logo}
              alt={sponsor.company}
              className="object-contain"
              style={size}
            />
          )}
          {/* No `fireOnMount`: the ad server should count the impression when the
          mark reaches the viewport, which is how every other placement counts
          it. Only the viewable re-fire below is already gated by then. */}
          <AdPixel ad={ad} />
          {isViewable && !!viewedPixels.length && (
            <AdPixel pixel={viewedPixels} fireOnMount />
          )}
        </a>
      )}
    </AdSlot>
  );
};

import type { CSSProperties, ReactElement } from 'react';
import React, { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import { AdPixel } from '../../../components/cards/ad/common/AdPixel';
import { getViewedPixels } from '../../../components/cards/ad/common/getViewedPixels';
import { anchorSponsoredRel } from '../../../lib/strings';
import { boxedLogoHeight } from './sponsorLogoSizing';
import type { ResolvedSponsor } from './sponsorStripCreative';
import { useSponsorSlotLog } from './useSponsorSlotLog';
import { useIsLightTheme } from '../../../hooks/utils/useThemedAsset';

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
  const { ref, isViewable, onClick } = useSponsorSlotLog<HTMLAnchorElement>({
    sponsor,
    slotIndex,
  });
  const viewedPixels = useMemo(
    () => getViewedPixels(sponsor.pixel),
    [sponsor.pixel],
  );
  const isLightTheme = useIsLightTheme();
  const logo =
    (isLightTheme ? sponsor.logoLight : sponsor.logoDark) ||
    sponsor.logoLight ||
    sponsor.logoDark ||
    sponsor.logo;
  const [dimensions, setDimensions] = useState<{
    logo: string;
    ratio: number;
  }>();
  const ratio =
    (dimensions?.logo === logo && dimensions.ratio) || sponsor.ratio;

  useEffect(() => {
    if (!monochrome && !maxWidth) {
      return undefined;
    }

    const image = new Image();
    image.onload = () => {
      if (image.naturalWidth > 0 && image.naturalHeight > 0) {
        setDimensions({
          logo,
          ratio: image.naturalWidth / image.naturalHeight,
        });
      }
    };
    image.src = logo;

    return () => {
      image.onload = null;
    };
  }, [monochrome, maxWidth, logo]);

  const fittedHeight = boxedLogoHeight(
    ratio,
    height,
    maxWidth ?? Number.POSITIVE_INFINITY,
  );
  const size: CSSProperties = {
    height: `${fittedHeight}px`,
    width:
      monochrome || maxWidth ? `${Math.round(fittedHeight * ratio)}px` : 'auto',
  };

  return (
    <a
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
      <AdPixel pixel={sponsor.pixel} />
      {isViewable && !!viewedPixels.length && (
        <AdPixel pixel={viewedPixels} fireOnMount />
      )}
    </a>
  );
};

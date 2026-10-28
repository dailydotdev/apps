import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { getSiteIconUrl } from '../../lib/links';

interface ToolLogoProps {
  title: string;
  /** The logo stored on the tool, when the dataset has one. */
  faviconUrl?: string | null;
  /** The tool's website — the icon service resolves its real logo. */
  url?: string | null;
  /** Pixel size to request from the icon service. */
  size?: number;
  /** Styles the tile: size, radius, border. */
  className?: string;
  /**
   * Plate inset applied only while a real logo renders, on a white plate, or a
   * black one when the logo is too light to read on white. The initial
   * fallback stays on the ambient surface so its token color keeps contrast
   * in both themes.
   */
  plateClassName?: string;
  /** Replaces the initial when there is no logo to show. */
  fallback?: ReactNode;
}

const LOGO_SAMPLE_SIZE = 32;

// True when nearly every visible pixel is near-white, so the logo would vanish
// on a white plate.
const isLightLogo = (image: HTMLImageElement): boolean => {
  const canvas = document.createElement('canvas');
  canvas.width = LOGO_SAMPLE_SIZE;
  canvas.height = LOGO_SAMPLE_SIZE;
  const context = canvas.getContext('2d');

  if (!context) {
    return false;
  }

  context.drawImage(image, 0, 0, LOGO_SAMPLE_SIZE, LOGO_SAMPLE_SIZE);
  const { data } = context.getImageData(
    0,
    0,
    LOGO_SAMPLE_SIZE,
    LOGO_SAMPLE_SIZE,
  );
  let visible = 0;
  let light = 0;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] >= 128) {
      visible += 1;

      if (Math.min(data[i], data[i + 1], data[i + 2]) >= 224) {
        light += 1;
      }
    }
  }

  return visible > 0 && light / visible >= 0.95;
};

// A tool's real logo, from the dataset when it has one and from the API's icon
// service otherwise, falling back to the initial only when both are missing or
// the image fails to load.
export const ToolLogo = ({
  title,
  faviconUrl,
  url,
  size,
  className,
  plateClassName,
  fallback,
}: ToolLogoProps): ReactElement => {
  const [hasFailed, setHasFailed] = useState(false);
  const [lightSrc, setLightSrc] = useState<string>();
  const src = faviconUrl || (url ? getSiteIconUrl({ url, size }) : null);
  const showsLogo = !!src && !hasFailed;

  // Reading pixels needs CORS, which the stored logos allow and the icon
  // service's favicons don't, so only stored logos are probed.
  useEffect(() => {
    if (!plateClassName || !faviconUrl) {
      return undefined;
    }

    const probe = new Image();
    probe.crossOrigin = 'anonymous';
    probe.onload = () => {
      if (isLightLogo(probe)) {
        setLightSrc(faviconUrl);
      }
    };
    probe.src = faviconUrl;

    return () => {
      probe.onload = null;
    };
  }, [faviconUrl, plateClassName]);

  if (fallback && !showsLogo) {
    return <>{fallback}</>;
  }

  return (
    <span
      className={classNames(
        'grid flex-none place-items-center overflow-hidden',
        className,
        showsLogo &&
          plateClassName && [
            plateClassName,
            lightSrc === src ? 'bg-black' : 'bg-white',
          ],
      )}
    >
      {!showsLogo ? (
        <span aria-hidden className="font-bold text-text-tertiary">
          {title.charAt(0).toUpperCase()}
        </span>
      ) : (
        <img
          key={src}
          src={src}
          alt={`${title} logo`}
          className="size-full object-contain"
          onError={() => setHasFailed(true)}
        />
      )}
    </span>
  );
};

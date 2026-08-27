import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
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
  /** Styles the tile: size, radius, background, border, padding. */
  className?: string;
  /** Replaces the initial when there is no logo to show. */
  fallback?: ReactNode;
}

// A tool's real logo, from the dataset when it has one and from the API's icon
// service otherwise, falling back to the initial only when both are missing or
// the image fails to load.
export const ToolLogo = ({
  title,
  faviconUrl,
  url,
  size,
  className,
  fallback,
}: ToolLogoProps): ReactElement => {
  const [hasFailed, setHasFailed] = useState(false);
  const src = faviconUrl || (url ? getSiteIconUrl({ url, size }) : null);

  if (fallback && (!src || hasFailed)) {
    return <>{fallback}</>;
  }

  return (
    <span
      className={classNames(
        'grid flex-none place-items-center overflow-hidden',
        className,
      )}
    >
      {!src || hasFailed ? (
        <span aria-hidden className="font-bold text-text-tertiary">
          {title.charAt(0).toUpperCase()}
        </span>
      ) : (
        <img
          src={src}
          alt={`${title} logo`}
          className="size-full object-contain"
          onError={() => setHasFailed(true)}
        />
      )}
    </span>
  );
};

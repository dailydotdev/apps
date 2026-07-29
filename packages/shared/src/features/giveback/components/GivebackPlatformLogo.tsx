import type { ComponentType, ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { IconSize } from '../../../components/Icon';
import type { IconProps } from '../../../components/Icon';

interface GivebackPlatformLogoProps {
  logoUrl?: string;
  Icon: ComponentType<IconProps>;
  forceDark?: boolean;
  // Non-actionable tiles (done/in-review/cooldown) already grayscale the parent,
  // so the glyph shouldn't be force-darkened on top of that.
  isDimmed?: boolean;
  iconSize?: IconSize;
  className?: string;
}

// Prefers the real brand logo (an SVG from the logo CDN) and falls back to the
// internal glyph if there is no logo for the surface or the remote one fails to
// load - so a tile is never broken or blank. The parent tile pins the
// background and applies any dimmed/grayscale treatment.
export const GivebackPlatformLogo = ({
  logoUrl,
  Icon,
  forceDark,
  isDimmed,
  iconSize = IconSize.Small,
  className,
}: GivebackPlatformLogoProps): ReactElement => {
  const [failed, setFailed] = useState(false);

  if (logoUrl && !failed) {
    return (
      <img
        src={logoUrl}
        alt=""
        aria-hidden
        loading="lazy"
        onError={() => setFailed(true)}
        className={classNames('object-contain', className ?? 'size-6')}
      />
    );
  }

  return (
    <Icon
      secondary
      size={iconSize}
      className={classNames(!isDimmed && forceDark && 'brightness-0')}
    />
  );
};

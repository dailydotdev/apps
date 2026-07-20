import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { ExtensionShowcaseMedia as Media } from './types';

interface ExtensionShowcaseMediaProps {
  media?: Media;
  className?: string;
}

export function ExtensionShowcaseMedia({
  media,
  className,
}: ExtensionShowcaseMediaProps): ReactElement {
  const wrapperClass = classNames(
    'relative aspect-video w-full overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-surface-float',
    className,
  );

  if (!media) {
    return <div className={wrapperClass} aria-hidden />;
  }

  if (media.type === 'video') {
    return (
      <div className={wrapperClass}>
        <video
          // key forces a remount so the clip restarts when the feature changes
          key={media.src}
          className="h-full w-full object-cover"
          src={media.src}
          poster={media.poster}
          aria-label={media.alt}
          autoPlay
          muted
          loop
          playsInline
        />
      </div>
    );
  }

  return (
    <div className={wrapperClass}>
      <img
        className="h-full w-full object-cover"
        src={media.src}
        srcSet={
          media.retinaSrc ? `${media.src} 1x, ${media.retinaSrc} 2x` : undefined
        }
        alt={media.alt ?? ''}
        loading="lazy"
      />
    </div>
  );
}

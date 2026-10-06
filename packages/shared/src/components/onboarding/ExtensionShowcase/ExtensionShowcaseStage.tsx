import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { ExtensionShowcaseFeature } from './types';

interface ExtensionShowcaseStageProps {
  feature: ExtensionShowcaseFeature;
}

const glowSizes = ['size-[22.5rem]', 'size-[26.25rem]'];
const glowDrift = ['animate-showcase-glow-a', 'animate-showcase-glow-b'];

function StageMedia({
  media,
}: Pick<ExtensionShowcaseFeature, 'media'>): ReactElement {
  if (media.type === 'video') {
    return (
      <div className="absolute inset-0 flex items-center justify-center p-[6%]">
        <video
          className="aspect-video max-h-full max-w-full rounded-16 border border-border-subtlest-quaternary bg-background-subtle object-cover shadow-2"
          src={media.src}
          aria-label={media.alt}
          autoPlay
          muted
          loop
          playsInline
          disablePictureInPicture
        />
      </div>
    );
  }

  return (
    <img
      className="h-full w-full object-contain"
      src={media.src}
      alt={media.alt}
      decoding="async"
    />
  );
}

export function ExtensionShowcaseStage({
  feature,
}: ExtensionShowcaseStageProps): ReactElement {
  return (
    <div className="relative w-full overflow-hidden rounded-24 border border-border-subtlest-tertiary bg-gradient-to-b from-background-subtle to-background-default shadow-2">
      {feature.glow.map((glow, index) => (
        <div
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          aria-hidden
          className={classNames(
            'pointer-events-none absolute left-1/2 top-1/2 transition-transform duration-700 ease-in-out motion-reduce:transition-none',
            glowSizes[index],
          )}
          style={{ transform: glow.transform }}
        >
          <div
            className={classNames(
              'size-full rounded-max blur-[4rem] transition-colors duration-700 motion-reduce:transition-none',
              glowDrift[index],
            )}
            style={{ backgroundColor: glow.color }}
          />
        </div>
      ))}
      <div
        key={feature.id}
        className="animate-showcase-media-in relative z-1 aspect-[1024/502] w-full"
      >
        <StageMedia media={feature.media} />
      </div>
    </div>
  );
}

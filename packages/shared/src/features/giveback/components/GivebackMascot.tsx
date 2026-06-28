import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';

// The daily.dev charm, themed as a "wish-granting genie" for Giveback: you make
// a wish (pick a cause / take an action) and daily.dev grants it.
const GIVEBACK_CHARM_IMAGE = {
  src: 'https://media.daily.dev/image/upload/s--d1dldAty--/f_auto,q_auto/v1780848838/public/daily.dev%20Charm%20-%20Giveback%20(1)',
  alt: 'daily.dev charm celebrating community impact for the Giveback campaign',
};

interface GivebackMascotProps {
  className?: string;
  imageClassName?: string;
  // Override the charm illustration (e.g. a different dog from the collection
  // for a specific moment). Defaults to the Giveback charm.
  image?: { src: string; alt: string };
}

export const GivebackMascot = ({
  className,
  imageClassName,
  image = GIVEBACK_CHARM_IMAGE,
}: GivebackMascotProps): ReactElement => (
  <div
    className={classNames(
      'pointer-events-none relative flex flex-col items-center gap-3',
      className,
    )}
  >
    <div className="relative flex items-center justify-center">
      {/* Magic "lamp smoke" glow behind the charm. */}
      <span
        aria-hidden
        className="bg-accent-cabbage-default/20 absolute inset-0 m-auto size-3/4 rounded-full blur-3xl motion-safe:animate-glow-pulse"
      />
      {/* The render sits on solid black; `mix-blend-screen` drops the black so
          the charm reads as floating on the dark page. The charm artwork is
          2812x2024; pinning that aspect ratio reserves the width from the fixed
          height before the image loads, so it never reflows the hero row (and
          the tab bar/content below it) on load. */}
      <img
        src={image.src}
        alt={image.alt}
        loading="lazy"
        className={classNames(
          'relative aspect-[703/506] h-44 w-auto select-none object-contain mix-blend-screen motion-safe:animate-mascot-bob tablet:h-56',
          imageClassName,
        )}
      />
    </div>
  </div>
);

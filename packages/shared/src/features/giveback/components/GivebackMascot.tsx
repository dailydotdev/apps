import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';

// The daily.dev charm, themed as a "wish-granting genie" for Giveback: you make
// a wish (pick a cause / take an action) and daily.dev grants it. Each section
// can show a different mood/pose, so this stays a single reusable surface.
export enum GivebackMascotMood {
  Thoughtful = 'thoughtful',
}

const moodToAsset: Record<GivebackMascotMood, { src: string; alt: string }> = {
  [GivebackMascotMood.Thoughtful]: {
    src: 'https://media.daily.dev/image/upload/s--d1dldAty--/f_auto,q_auto/v1780848838/public/daily.dev%20Charm%20-%20Giveback%20(1)',
    alt: 'daily.dev charm celebrating community impact for the Giveback campaign',
  },
};

interface GivebackMascotProps {
  mood?: GivebackMascotMood;
  className?: string;
  imageClassName?: string;
}

export const GivebackMascot = ({
  mood = GivebackMascotMood.Thoughtful,
  className,
  imageClassName,
}: GivebackMascotProps): ReactElement => {
  const asset = moodToAsset[mood];

  return (
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
            the charm reads as floating on the dark page. */}
        <img
          src={asset.src}
          alt={asset.alt}
          loading="lazy"
          className={classNames(
            'relative h-44 w-auto select-none object-contain mix-blend-screen motion-safe:animate-mascot-bob tablet:h-56',
            imageClassName,
          )}
        />
      </div>
    </div>
  );
};

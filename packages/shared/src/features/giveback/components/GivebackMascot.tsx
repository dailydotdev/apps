import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';

// The daily.dev charm, themed as a "wish-granting genie" for Giveback: you make
// a wish (pick a cause / take an action) and daily.dev grants it. Each section
// can show a different mood/pose, so this stays a single reusable surface.
export enum GivebackMascotMood {
  Thoughtful = 'thoughtful',
}

const moodToAsset: Record<GivebackMascotMood, { src: string; alt: string }> = {
  [GivebackMascotMood.Thoughtful]: {
    src: '/assets/giveback-genie.png',
    alt: 'daily.dev genie charm pondering a wish',
  },
};

interface GivebackMascotProps {
  mood?: GivebackMascotMood;
  /** Optional one-liner shown in a small speech bubble under the charm. */
  speech?: string;
  className?: string;
  imageClassName?: string;
}

export const GivebackMascot = ({
  mood = GivebackMascotMood.Thoughtful,
  speech,
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
        {/* The shared render sits on solid black; `mix-blend-screen` drops the
            black so the charm reads as floating on the dark page until we have a
            transparent cutout hosted on the CDN. */}
        <img
          src={asset.src}
          alt={asset.alt}
          loading="lazy"
          className={classNames(
            'relative h-44 w-auto select-none object-contain mix-blend-screen motion-safe:animate-mascot-bob',
            imageClassName,
          )}
        />
      </div>
      {speech && (
        <div className="max-w-[15rem] rounded-16 border border-border-subtlest-tertiary bg-surface-float px-3 py-2 text-center">
          <Typography
            tag={TypographyTag.P}
            type={TypographyType.Caption1}
            color={TypographyColor.Secondary}
          >
            {speech}
          </Typography>
        </div>
      )}
    </div>
  );
};

import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { StarIcon, HashtagIcon, DiscussIcon } from '../../components/icons';
import { IconSize } from '../../components/Icon';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../components/typography/Typography';

const Avatars = (): ReactElement => (
  <div className="flex -space-x-2">
    {Array.from({ length: 5 }).map((_, index) => (
      <span
        // eslint-disable-next-line react/no-array-index-key
        key={index}
        className="size-8 rounded-full border-2 border-background-default bg-surface-float"
      />
    ))}
  </div>
);

const Stat = ({
  icon,
  label,
}: {
  icon: ReactNode;
  label: string;
}): ReactElement => (
  <div className="flex flex-1 flex-col items-center gap-1 rounded-16 bg-surface-float p-4 text-center">
    {icon}
    <Typography
      type={TypographyType.Footnote}
      color={TypographyColor.Secondary}
      bold
    >
      {label}
    </Typography>
  </div>
);

/**
 * Social-proof band — the "you're joining something big and trusted" beat,
 * G2/Trustpilot style but honest: star visual, a community avatar pile, the
 * "millions of developers" signal, and what the product gives. No fabricated
 * counts or reviews.
 */
export const SocialProofBand = (): ReactElement => (
  <div className="flex flex-col items-center gap-4 py-2 text-center">
    <Avatars />
    <div className="flex items-center gap-1" aria-label="Five star rated">
      {Array.from({ length: 5 }).map((_, index) => (
        <StarIcon
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          secondary
          size={IconSize.Small}
          className="text-accent-cheese-default"
        />
      ))}
    </div>
    <Typography bold tag={TypographyTag.H2} type={TypographyType.Title2}>
      Loved by millions of developers
    </Typography>
    <Typography
      type={TypographyType.Body}
      color={TypographyColor.Secondary}
      className="max-w-xl"
    >
      daily.dev is the home where developers stay ahead — the best news, tools,
      and discussions across the dev world, in one feed built around you.
    </Typography>
    <div className="mt-2 flex w-full max-w-2xl flex-col gap-3 tablet:flex-row">
      <Stat
        icon={
          <HashtagIcon size={IconSize.Medium} className="text-text-primary" />
        }
        label="Every major dev source, in one place"
      />
      <Stat
        icon={
          <DiscussIcon size={IconSize.Medium} className="text-text-primary" />
        }
        label="A real community, not a comment void"
      />
      <Stat
        icon={<StarIcon size={IconSize.Medium} className="text-text-primary" />}
        label="A feed that learns what you love"
      />
    </div>
  </div>
);

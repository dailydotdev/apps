import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { cloudinaryCharmGiveback } from '../../../lib/image';
import { webappUrl } from '../../../lib/constants';

interface GivebackInviteCardProps {
  onClick?: () => void;
  className?: string;
}

// Cross-promo into /giveback, wearing the same treatment as the giveback
// founding-reward card: a 1px gradient frame over an opaque base washed with
// the same gradient at a true 8% via color-mix (Tailwind's `/opacity`
// modifier doesn't take on these token gradient stops).
export const GivebackInviteCard = ({
  onClick,
  className,
}: GivebackInviteCardProps): ReactElement => (
  <div
    className={classNames(
      'rounded-16 bg-gradient-to-r from-accent-avocado-default via-accent-cabbage-default to-accent-cheese-default p-px shadow-2',
      className,
    )}
  >
    <div
      className="flex flex-col items-start gap-3 rounded-[15px] bg-background-default p-4 tablet:flex-row tablet:items-center"
      style={{
        backgroundImage:
          'linear-gradient(to right, color-mix(in srgb, var(--theme-accent-avocado-default) 8%, transparent), color-mix(in srgb, var(--theme-accent-cabbage-default) 8%, transparent), color-mix(in srgb, var(--theme-accent-cheese-default) 8%, transparent))',
      }}
    >
      <div className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
        <span className="bg-gradient-to-r from-accent-avocado-default via-accent-cabbage-default to-accent-cheese-default bg-clip-text font-bold uppercase tracking-wide text-transparent typo-caption2">
          Community giveback
        </span>
        <Typography type={TypographyType.Callout} bold>
          Turn community actions into real donations
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Secondary}
          className="[text-wrap:pretty]"
        >
          We redirect our growth budget to causes the community picks — you
          never pay a cent.
        </Typography>
        <Button
          tag="a"
          href={`${webappUrl}giveback`}
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
          className="mt-3"
          onClick={onClick}
        >
          Explore Giveback
        </Button>
      </div>
      {/* The charm artwork sits on black; screen-blend drops the black on the
          dark card. */}
      <span className="relative mx-auto flex size-24 shrink-0 items-center justify-center tablet:mx-0">
        <span
          aria-hidden
          className="bg-accent-cabbage-default/25 absolute inset-0 m-auto size-3/4 rounded-full blur-2xl motion-safe:animate-glow-pulse"
        />
        <img
          src={cloudinaryCharmGiveback}
          alt="daily.dev Giveback charm"
          loading="lazy"
          className="relative size-full select-none object-contain mix-blend-screen"
        />
      </span>
    </div>
  </div>
);

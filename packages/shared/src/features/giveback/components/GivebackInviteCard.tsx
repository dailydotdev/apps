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
import { webappUrl } from '../../../lib/constants';
import { cloudinaryCharmGiveback } from '../../../lib/image';

interface GivebackInviteCardProps {
  onClick?: () => void;
  className?: string;
}

const charmCutoutId = 'giveback-charm-cutout';

// Cross-promo into /giveback for surfaces outside the campaign (today: the
// invite settings page). It wears the same treatment as the founding-reward
// card in GivebackFoundingAward: a 1px gradient frame over an opaque base
// washed with the same gradient at a true 8% via color-mix (Tailwind's
// `/opacity` modifier doesn't take on these token gradient stops).
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
      className="flex flex-col items-start gap-3 rounded-[0.9375rem] bg-background-default p-4 tablet:flex-row tablet:items-center"
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
          We redirect our growth budget to causes the community picks. You never
          pay a cent.
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
      {/* Not GivebackMascot: its `h-44 tablet:h-56` is baked into the same
          class string a caller would override, and class names here are
          concatenated rather than merged, so the hero size always wins. This
          card needs a compact charm, so it sizes its own. */}
      <span className="relative mx-auto flex size-24 shrink-0 items-center justify-center tablet:mx-0">
        {/* The render ships on solid black. `mix-blend-screen` only drops that
            over a dark surface, so on the light theme the charm blended away
            entirely. Cut the black out instead: derive the alpha channel from
            the artwork's own brightness, so it reads on any background. The
            ramp keeps the mid-dark parts of the art (the podium, the phone
            bezel) fully opaque rather than fading them out. */}
        <svg aria-hidden className="absolute size-0">
          <filter id={charmCutoutId} colorInterpolationFilters="sRGB">
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  1 1 1 0 0"
            />
            <feComponentTransfer>
              <feFuncA type="linear" slope="4" intercept="-0.25" />
            </feComponentTransfer>
          </filter>
        </svg>
        <span
          aria-hidden
          className="bg-accent-cabbage-default/25 absolute inset-0 m-auto size-3/4 rounded-full blur-2xl motion-safe:animate-glow-pulse"
        />
        <img
          src={cloudinaryCharmGiveback}
          alt=""
          loading="lazy"
          className="relative size-full select-none object-contain"
          style={{ filter: `url(#${charmCutoutId})` }}
        />
      </span>
    </div>
  </div>
);

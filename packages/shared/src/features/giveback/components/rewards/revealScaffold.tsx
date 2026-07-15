import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../../components/typography/Typography';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import { FlexCol } from '../../../../components/utilities';
import { GivebackReveal as Reveal } from '../GivebackReveal';
import type { RewardReveal } from './rewardReveal';

export const STAGGER_STEP = 70;
export const STORE_URL = 'https://store.daily.dev';

// The level chip (profile-image style) — no "reward unlocked" label. Hidden when
// the level isn't known (e.g. the founding award, which isn't a numbered tier).
export const LevelChip = ({
  levelNumber,
}: {
  levelNumber?: number;
}): ReactElement | null => {
  if (!levelNumber || levelNumber <= 0) {
    return null;
  }
  return (
    <span className="rounded-8 border border-border-subtlest-tertiary bg-background-subtle px-2.5 py-0.5 font-bold text-accent-cabbage-default typo-caption1">
      Lvl {levelNumber}
    </span>
  );
};

// The copy under the hero object: a big cinematic headline + the line.
export const RevealCopy = ({
  reveal,
  delayBase = 0,
  hideHeadline = false,
}: {
  reveal: RewardReveal;
  delayBase?: number;
  hideHeadline?: boolean;
}): ReactElement => (
  <FlexCol className="items-center gap-1.5 text-center">
    {!hideHeadline && (
      <Reveal delay={delayBase}>
        <Typography
          tag={TypographyTag.H3}
          bold
          type={TypographyType.Title1}
          className="[text-wrap:balance]"
        >
          {reveal.headline}
        </Typography>
      </Reveal>
    )}
    <Reveal delay={delayBase + STAGGER_STEP}>
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Secondary}
        className="max-w-sm [text-wrap:pretty]"
      >
        {reveal.body}
      </Typography>
    </Reveal>
  </FlexCol>
);

// Standard scene scaffold: hero object, then copy, then an optional action.
export const Scene = ({
  object,
  reveal,
  levelNumber,
  action,
  hideHeadline,
}: {
  object: ReactNode;
  reveal: RewardReveal;
  levelNumber?: number;
  action?: ReactNode;
  hideHeadline?: boolean;
}): ReactElement => (
  <FlexCol className="items-center gap-6">
    <Reveal delay={0}>
      <LevelChip levelNumber={levelNumber} />
    </Reveal>
    <Reveal
      delay={STAGGER_STEP}
      className="relative flex items-center justify-center"
    >
      {object}
    </Reveal>
    <RevealCopy
      reveal={reveal}
      delayBase={STAGGER_STEP * 3}
      hideHeadline={hideHeadline}
    />
    {action && <Reveal delay={STAGGER_STEP * 6}>{action}</Reveal>}
  </FlexCol>
);

// Every reveal closes on a solid Primary CTA — the confident "take the win"
// action. With no destination wired yet, it simply dismisses the celebration.
export const DismissButton = ({
  label,
  icon,
  onClose,
}: {
  label: string;
  icon?: ReactElement;
  onClose: () => void;
}): ReactElement => (
  <Button
    type="button"
    size={ButtonSize.Medium}
    variant={ButtonVariant.Primary}
    icon={icon}
    onClick={onClose}
  >
    {label}
  </Button>
);

// A gold EMV-style chip for the membership card.
export const CardChip = (): ReactElement => (
  <span className="relative flex h-7 w-10 items-center justify-center overflow-hidden rounded-6 bg-gradient-to-br from-accent-cheese-default to-accent-bun-default">
    <span className="bg-accent-bun-default/60 absolute inset-y-1 left-1/2 w-px -translate-x-1/2" />
    <span className="bg-accent-bun-default/60 absolute inset-x-1 top-1/2 h-px -translate-y-1/2" />
    <span className="ring-accent-bun-default/60 size-3 rounded-2 ring-1" />
  </span>
);

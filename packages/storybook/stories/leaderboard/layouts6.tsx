import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  CopyIcon,
  InviteIcon,
  SlackIcon,
  VIcon,
} from '@dailydotdev/shared/src/components/icons';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { PlusTitle } from '@dailydotdev/shared/src/components/plus/PlusTitle';
import { TypographyType } from '@dailydotdev/shared/src/components/typography/Typography';
import {
  DEVS,
  ME,
  MY_LADDER_FRIENDS,
  REFERRAL_LADDER,
  rankBoard,
} from './data';
import { Avatar, Delta, youHighlight } from './kit';
import { useYouControls } from './layouts4';

// The first row of the full-width leaderboard: your rank as the hero, with
// the Slack digest and the Plus invite in a rail beside it.

/* ------------------------------------------------------------ shared bits */

const teammates = () =>
  rankBoard('reputation', 'week', [
    ME,
    ...DEVS.filter((dev) => dev.company === ME.company),
  ]).slice(0, 3);

const NEXT_STEP = REFERRAL_LADDER.find(
  (step) => step.friends > MY_LADDER_FRIENDS,
);

export const NEXT_REWARD = NEXT_STEP
  ? `${NEXT_STEP.friends - MY_LADDER_FRIENDS} more friend unlocks ${
      NEXT_STEP.reward
    }`
  : 'You unlocked a year of Plus';

/** The ladder as one thin bar of three steps. */
export const LadderBar = (): ReactElement => (
  <span className="grid w-full grid-cols-3 gap-1">
    {REFERRAL_LADDER.map((step) => (
      <span
        key={step.friends}
        className={classNames(
          'h-1.5 rounded-4',
          MY_LADDER_FRIENDS >= step.friends
            ? 'bg-action-plus-default'
            : 'bg-surface-float',
        )}
      />
    ))}
  </span>
);

export const TopThreeStack = (): ReactElement => (
  <span className="flex -space-x-2">
    {teammates().map((entry) => (
      <Avatar
        key={entry.dev.id}
        dev={entry.dev}
        size="size-6"
        className="ring-2 ring-background-default"
      />
    ))}
  </span>
);

const useToggle = (): [boolean, () => void] => {
  const [on, setOn] = useState(false);
  return [on, () => setOn(!on)];
};

export const DigestButton = ({
  size = ButtonSize.Small,
  full = false,
}: {
  size?: ButtonSize;
  full?: boolean;
}): ReactElement => {
  const [added, toggle] = useToggle();
  return (
    <Button
      type="button"
      size={size}
      variant={added ? ButtonVariant.Tertiary : ButtonVariant.Primary}
      icon={added ? <VIcon /> : <SlackIcon />}
      onClick={toggle}
      className={classNames('shrink-0', full && 'w-full')}
    >
      {added ? 'Added' : 'Add weekly digest'}
    </Button>
  );
};

export const InviteButton = ({
  size = ButtonSize.Small,
  full = false,
  label = 'Copy invite link',
}: {
  size?: ButtonSize;
  full?: boolean;
  label?: string;
}): ReactElement => (
  <Button
    type="button"
    size={size}
    variant={ButtonVariant.Secondary}
    icon={<CopyIcon />}
    className={classNames('shrink-0', full && 'w-full')}
  >
    {label}
  </Button>
);

export const IconTile = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => (
  <span className="flex size-10 shrink-0 items-center justify-center rounded-12 bg-surface-float">
    {children}
  </span>
);

/* ------------------------------------------------------- hero + rail */

export const HeroAndRailRow = (): ReactElement => {
  const { detail, picker, share } = useYouControls();
  return (
    <div className="grid grid-cols-3 gap-4">
      <section
        className={`col-span-2 flex items-center gap-6 rounded-24 ${youHighlight} p-6`}
      >
        <Avatar dev={ME} size="size-16" className="rounded-16" />
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="flex items-center gap-3">
            <span className="font-bold tabular-nums typo-mega3">
              #{detail.rank}
            </span>
            <Delta value={detail.delta} className="!w-auto" />
          </span>
          <span className="font-bold typo-title3">{detail.value}</span>
          {detail.gap && (
            <span className="text-text-secondary typo-callout">
              {detail.gap}.
            </span>
          )}
        </span>
        <span className="flex flex-col items-end gap-3">
          {share}
          {picker}
        </span>
      </section>
      <div className="flex flex-col gap-3">
        <section className="flex flex-1 items-center gap-3 rounded-16 border border-border-subtlest-tertiary p-4">
          <IconTile>
            <SlackIcon />
          </IconTile>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="font-bold typo-callout">Weekly Slack digest</span>
            <span className="flex items-center gap-2 text-text-tertiary typo-footnote">
              <TopThreeStack /> Mon 9:00 · #northwind-devs
            </span>
          </span>
          <DigestButton />
        </section>
        <section className="flex flex-1 items-center gap-3 rounded-16 border border-border-subtlest-tertiary p-4">
          <IconTile>
            <InviteIcon />
          </IconTile>
          <span className="flex min-w-0 flex-1 flex-col gap-1.5">
            <PlusTitle type={TypographyType.Caption1} bold />
            <span className="truncate font-bold typo-footnote">
              {NEXT_REWARD}
            </span>
            <LadderBar />
          </span>
          <InviteButton label="Invite" />
        </section>
      </div>
    </div>
  );
};

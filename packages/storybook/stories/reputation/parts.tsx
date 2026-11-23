import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { fn } from 'storybook/test';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  ArrowIcon,
  CoreIcon,
  MiniCloseIcon,
  LockIcon,
  ReputationIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import NotificationItem from '@dailydotdev/shared/src/components/notifications/NotificationItem';
import {
  NotificationIconType,
  NotificationType,
} from '@dailydotdev/shared/src/components/notifications/utils';
import { cloudinaryReputationPrivilegesUnlocked } from '@dailydotdev/shared/src/lib/image';
import { reputation as reputationDocsUrl } from '@dailydotdev/shared/src/lib/constants';
import { userAvatar } from '../hero-cover/widgets/notificationsMock';
import type { FirstReputation } from './data';
import {
  privilegeUnlocks,
  privilegesDocsUrl,
  privilegesThreshold,
  reputationPageUrl,
  roadMilestones,
  STARTING_REPUTATION,
} from './data';

/* ------------------------------------------------------------------ */
/* Review furniture                                                    */
/* ------------------------------------------------------------------ */

export type Tag = 'Today' | 'Production' | 'Proposed' | 'Decide';

const tagClass: Record<Tag, string> = {
  Today: 'bg-surface-float text-text-tertiary',
  Production: 'bg-surface-float text-text-tertiary',
  Proposed: 'bg-accent-onion-default text-background-default',
  Decide: 'bg-accent-bun-default text-background-default',
};

export const State = ({
  title,
  note,
  tag,
  children,
}: {
  title: string;
  note?: string;
  tag: Tag;
  children: ReactNode;
}): ReactElement => (
  <figure className="flex min-w-0 flex-col gap-2">
    <figcaption className="flex max-w-[26.25rem] flex-col gap-1">
      <span className="flex items-center gap-2">
        <span className="font-bold text-text-primary typo-callout">
          {title}
        </span>
        <span
          className={`rounded-6 px-1.5 py-0.5 font-bold typo-caption2 ${tagClass[tag]}`}
        >
          {tag}
        </span>
      </span>
      {note && <span className="text-text-tertiary typo-footnote">{note}</span>}
    </figcaption>
    {children}
  </figure>
);

export const StateGrid = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => (
  <div className="flex flex-wrap items-start gap-x-10 gap-y-12">{children}</div>
);

/** A table of rows for the "what changes" and rules sections. */
export const Table = ({
  head,
  rows,
}: {
  head: string[];
  rows: ReactNode[][];
}): ReactElement => (
  <div className="max-w-[64rem] overflow-x-auto rounded-16 border border-border-subtlest-tertiary">
    <table className="w-full border-collapse text-left typo-footnote">
      <thead>
        <tr className="bg-surface-float">
          {head.map((cell) => (
            <th
              key={cell}
              className="px-3 py-2 font-bold text-text-tertiary typo-caption1"
            >
              {cell}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            className="border-t border-border-subtlest-tertiary align-top"
          >
            {row.map((cell, cellIndex) => (
              <td
                // eslint-disable-next-line react/no-array-index-key
                key={cellIndex}
                className={classNames(
                  'px-3 py-2',
                  cellIndex === 0
                    ? 'font-bold text-text-primary'
                    : 'text-text-secondary',
                )}
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const Status = ({ tag }: { tag: Tag }): ReactElement => (
  <span
    className={`whitespace-nowrap rounded-6 px-1.5 py-0.5 font-bold typo-caption2 ${tagClass[tag]}`}
  >
    {tag}
  </span>
);

/* ------------------------------------------------------------------ */
/* Surfaces: modal on tablet and up, drawer on phones                  */
/* ------------------------------------------------------------------ */

/** Modal's XSmall FlexibleCenter box, as production draws it from tablet up. */
const ModalBox = ({ children }: { children: ReactNode }): ReactElement => (
  <div className="relative flex w-[21.25rem] flex-col rounded-16 border border-border-subtlest-secondary bg-accent-pepper-subtlest p-6 shadow-2">
    {children}
  </div>
);

/** isDrawerOnMobile: the same content in a bottom sheet over a dimmed page. */
const DrawerBox = ({ children }: { children: ReactNode }): ReactElement => (
  <div className="flex w-[23.4375rem] flex-col overflow-hidden rounded-24 border border-border-subtlest-tertiary bg-overlay-quaternary-onion pt-24">
    <div className="flex flex-col rounded-t-24 bg-background-default px-4 pb-6 pt-3">
      <span className="mx-auto mb-3 h-1 w-10 rounded-4 bg-surface-float" />
      {children}
    </div>
  </div>
);

export const Surface = ({
  isPhone,
  children,
}: {
  isPhone?: boolean;
  children: ReactNode;
}): ReactElement =>
  isPhone ? <DrawerBox>{children}</DrawerBox> : <ModalBox>{children}</ModalBox>;

const CloseCorner = (): ReactElement => (
  <Button
    className="absolute right-2 top-2"
    size={ButtonSize.Small}
    variant={ButtonVariant.Tertiary}
    icon={<MiniCloseIcon />}
    aria-label="Close"
  />
);

/* ------------------------------------------------------------------ */
/* The badge                                                           */
/* ------------------------------------------------------------------ */

/**
 * Stand-in for the 3D reputation badge: the streak milestone's layout (a big
 * art piece with the number on it) until design delivers the asset.
 */
export const ReputationBadge = ({
  amount,
  size = 'large',
}: {
  amount: number;
  size?: 'large' | 'small';
}): ReactElement => (
  <span
    className={classNames(
      'relative flex items-center justify-center rounded-full bg-gradient-to-b from-accent-onion-subtler to-accent-onion-subtlest shadow-2',
      size === 'large' ? 'size-36' : 'size-24',
    )}
  >
    <span
      className={classNames(
        'opacity-90 absolute rounded-full border-4 border-accent-onion-default bg-gradient-to-br from-accent-onion-default to-accent-onion-bolder',
        size === 'large' ? 'inset-4' : 'inset-3',
      )}
    />
    <span className="relative flex flex-col items-center">
      <ReputationIcon
        secondary
        size={size === 'large' ? IconSize.XLarge : IconSize.Large}
        className="text-background-default"
      />
      <strong
        className={classNames(
          'tabular-nums text-background-default',
          size === 'large' ? 'typo-title1' : 'typo-title3',
        )}
      >
        +{amount}
      </strong>
    </span>
  </span>
);

/* ------------------------------------------------------------------ */
/* Road to 250                                                         */
/* ------------------------------------------------------------------ */

/**
 * The analytics tab's progress bar from 0 to 250, a dot per milestone on the
 * way, the next one named, and the three privileges 250 unlocks.
 */
export const RoadTo250 = ({
  reputation,
}: {
  reputation: number;
}): ReactElement => {
  const progress = Math.min(reputation / privilegesThreshold, 1);
  const next = roadMilestones.find(
    (milestone) =>
      milestone.reputation > reputation &&
      milestone.reputation < privilegesThreshold,
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-2">
          <span className="flex items-center gap-1 font-bold tabular-nums text-text-primary typo-callout">
            <ReputationIcon
              size={IconSize.Size16}
              className="text-accent-onion-default"
            />
            {reputation.toLocaleString('en-US')}
          </span>
          <span className="tabular-nums text-text-tertiary typo-footnote">
            {(privilegesThreshold - reputation).toLocaleString('en-US')} to{' '}
            {privilegesThreshold}
          </span>
        </div>
        <div
          className="relative h-2 rounded-4 bg-surface-float"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={privilegesThreshold}
          aria-valuenow={reputation}
          aria-label={`Progress to ${privilegesThreshold} reputation`}
        >
          <div
            className="h-full rounded-4 bg-accent-onion-default"
            style={{ width: `${progress * 100}%` }}
          />
          {roadMilestones
            .filter((milestone) => milestone.reputation < privilegesThreshold)
            .map((milestone) => (
              <span
                key={milestone.reputation}
                title={`${milestone.reputation}: ${milestone.unlocks.join(', ')}`}
                className={classNames(
                  'absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full',
                  reputation >= milestone.reputation
                    ? 'bg-background-default'
                    : 'bg-border-subtlest-primary',
                )}
                style={{
                  left: `${(milestone.reputation / privilegesThreshold) * 100}%`,
                }}
              />
            ))}
        </div>
        {next && (
          <span className="text-text-tertiary typo-caption1">
            Next at {next.reputation}: {next.unlocks[0]}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="font-bold text-text-primary typo-footnote">
          At {privilegesThreshold} you unlock
        </span>
        <ul className="flex flex-col gap-1">
          {privilegeUnlocks.map((unlock) => (
            <li
              key={unlock}
              className="flex items-start gap-1.5 text-text-secondary typo-footnote"
            >
              <LockIcon
                size={IconSize.Size16}
                className="shrink-0 text-text-quaternary"
              />
              {unlock}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* The first reputation moment (proposed)                              */
/* ------------------------------------------------------------------ */

/** Buttons in the 250 modal's order: the analytics tab leads, docs second. */
export const FirstReputationModal = ({
  moment,
  isPhone,
}: {
  moment: FirstReputation;
  isPhone?: boolean;
}): ReactElement => {
  const reputation = STARTING_REPUTATION + moment.amount;

  return (
    <Surface isPhone={isPhone}>
      {!isPhone && <CloseCorner />}
      <div className="flex flex-col items-center gap-6 text-center">
        <ReputationBadge amount={moment.amount} />
        <div className="flex flex-col gap-2">
          <h3 className="font-bold text-text-primary typo-title2">
            {moment.subject} earned +{moment.amount} reputation
          </h3>
          <p className="line-clamp-2 text-text-tertiary typo-callout">
            “{moment.quote}”
          </p>
        </div>
        <div className="w-full rounded-16 border border-border-subtlest-tertiary p-3 text-left">
          <RoadTo250 reputation={reputation} />
        </div>
        <div className="flex w-full flex-col gap-2">
          <Button
            tag="a"
            href={reputationPageUrl}
            className="w-full"
            variant={ButtonVariant.Primary}
          >
            See your reputation
          </Button>
          <Button
            tag="a"
            target="_blank"
            href={privilegesDocsUrl}
            className="w-full"
            variant={ButtonVariant.Float}
          >
            See all privileges
          </Button>
          <Button
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            className="w-full"
          >
            {moment.seeLabel}
          </Button>
        </div>
      </div>
    </Surface>
  );
};

/* ------------------------------------------------------------------ */
/* Production: the 250 "Privileges unlocked" modal, unchanged          */
/* ------------------------------------------------------------------ */

export const PrivilegesUnlockedModal = ({
  isPhone,
}: {
  isPhone?: boolean;
}): ReactElement => (
  <Surface isPhone={isPhone}>
    {!isPhone && <CloseCorner />}
    <div className="flex flex-col items-center gap-10 text-center">
      <img
        src={cloudinaryReputationPrivilegesUnlocked}
        alt="Privileges unlocked!"
      />
      <div className="flex flex-col gap-5">
        <h3 className="font-bold text-text-primary typo-title1">
          Privileges unlocked!
        </h3>
        <p className="text-text-tertiary typo-body">
          Congratulations on your 250 reputation points achievement! Your
          meaningful contributions has propelled you into a realm of special
          privileges and superpowers. Keep up the fantastic work!
        </p>
      </div>
      <div className="flex w-full flex-col gap-3">
        <Button
          tag="a"
          href={reputationPageUrl}
          className="w-full"
          variant={ButtonVariant.Primary}
        >
          See your reputation
        </Button>
        <Button
          tag="a"
          target="_blank"
          href={reputationDocsUrl}
          className="w-full"
          variant={ButtonVariant.Float}
        >
          Tell me more
        </Button>
      </div>
    </div>
  </Surface>
);

/* ------------------------------------------------------------------ */
/* Today: Customer.io campaign 16's in-app popover                     */
/* ------------------------------------------------------------------ */

/** Drawn from the campaign's recording; the body copy is approximate. */
export const CustomerIoPopover = (): ReactElement => (
  <div className="relative flex w-64 flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-4 shadow-2">
    <span className="w-fit rounded-6 bg-accent-avocado-default px-1.5 font-bold text-background-default typo-caption2">
      Pro tip
    </span>
    <strong className="text-text-primary typo-title3">
      Sweet! You&apos;ve earned reputation points!
    </strong>
    <p className="text-text-tertiary typo-footnote">
      Reputation unlocks privileges on daily.dev as you contribute.
    </p>
    <span className="flex h-28 items-center justify-center rounded-12 bg-surface-float">
      <ReputationIcon
        secondary
        size={IconSize.XXLarge}
        className="text-accent-onion-default"
      />
    </span>
    <Button size={ButtonSize.Small} variant={ButtonVariant.Primary}>
      See all privileges
    </Button>
  </div>
);

/* ------------------------------------------------------------------ */
/* Points where people already look                                    */
/* ------------------------------------------------------------------ */

/** The reputation earned, as a chip. Hidden when nothing was earned. */
export const EarnedChip = ({ amount }: { amount: number }): ReactElement => (
  <span className="inline-flex items-center gap-0.5 rounded-6 bg-accent-onion-flat px-1 font-bold tabular-nums text-accent-onion-default typo-caption2">
    <ReputationIcon size={IconSize.Size16} />+{amount}
  </span>
);

const earnedChipHtml = (amount: number): string =>
  ` <span class="inline-flex items-center rounded-6 bg-accent-onion-flat px-1 font-bold text-accent-onion-default typo-caption2">+${amount} reputation</span>`;

/**
 * Production's NotificationItem for comment_upvote_milestone, with the
 * daily-api title. `earned` is the reputation from this batch of upvotes,
 * which only upvoters at 250+ grant, so it can be 0 and then shows nothing.
 */
export const UpvoteNotification = ({
  upvotes,
  earned,
}: {
  upvotes: 1 | 3 | 5;
  earned?: number;
}): ReactElement => {
  const titles = {
    1: '<span class="text-theme-color-avocado">1 upvote!</span> Off to a good start 🎉',
    3: '<span class="text-theme-color-avocado">3 upvotes!</span> No bugs, just vibes ✨',
    5: '<span class="text-theme-color-avocado">5 upvotes!</span> Gaining traction 👀',
  };

  return (
    <div className="w-[26rem] overflow-hidden rounded-16 border border-border-subtlest-tertiary">
      <NotificationItem
        type={NotificationType.CommentUpvoteMilestone}
        icon={NotificationIconType.Upvote}
        title={`${titles[upvotes]}${earned ? earnedChipHtml(earned) : ''}`}
        description="We moved our cache in front of the API and p95 dropped from 900ms to 120ms."
        avatars={[
          userAvatar('ido', 'Ido'),
          userAvatar('tsahi', 'Tsahi'),
          userAvatar('nimrod', 'Nimrod'),
        ].slice(0, upvotes)}
        numTotalAvatars={upvotes}
        referenceId={`upvote-${upvotes}-${earned ?? 0}`}
        targetUrl="/posts/123#c-1"
        createdAt={new Date(Date.now() - 20 * 60_000)}
        isUnread
        hideActions
        onClick={fn()}
      />
    </div>
  );
};

/**
 * SidebarProfileStats, the reputation and Cores strip at the top of the
 * profile menu, with the earned chip next to the count.
 */
export const ProfileStats = ({
  reputation,
  earned,
}: {
  reputation: number;
  earned?: number;
}): ReactElement => (
  <div className="flex w-64 items-stretch overflow-hidden rounded-12 border border-border-subtlest-tertiary bg-background-default">
    <a
      href={reputationPageUrl}
      className="flex flex-1 items-center justify-center gap-1.5 px-3 py-1.5 hover:bg-surface-hover"
    >
      <ReputationIcon
        size={IconSize.Small}
        className="text-accent-onion-default"
      />
      <span className="font-bold tabular-nums text-text-primary typo-footnote">
        {reputation}
      </span>
      {!!earned && (
        <span className="rounded-6 bg-accent-onion-flat px-1 font-bold tabular-nums text-accent-onion-default typo-caption2">
          +{earned}
        </span>
      )}
    </a>
    <span
      aria-hidden
      className="w-px self-stretch bg-border-subtlest-tertiary"
    />
    <span className="flex flex-1 items-center justify-center gap-1.5 px-3 py-1.5">
      <CoreIcon size={IconSize.Small} className="text-accent-cheese-default" />
      <span className="font-bold tabular-nums text-text-primary typo-footnote">
        120
      </span>
    </span>
  </div>
);

/** The hand-off: the first moment points at the analytics tab, which already
 * draws the road to the next milestone. */
export const FlowArrow = (): ReactElement => (
  <span className="flex items-center self-center text-text-quaternary">
    <ArrowIcon size={IconSize.Medium} className="rotate-90" />
  </span>
);

import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  BellIcon,
  BookmarkIcon,
  CompassIcon,
  HelpIcon,
  HomeIcon,
  InviteIcon,
  LockIcon,
  PlusIcon,
  ReadingStreakIcon,
  SearchIcon,
  SettingsIcon,
  SquadIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';
import LogoText from '@dailydotdev/shared/src/svg/LogoText';
import { IntroMotion, NativePermissionPrompt, Toast } from '../kit';

// Two app shells, just detailed enough to judge where the setup entry point
// lives: the classic layout (top header + sidebar) and layout v2 (icon rail
// with Invite, Support and Settings at the bottom, page header strip on top).

const FeedGrid = ({ columns = 3 }: { columns?: number }): ReactElement => (
  <div
    className="grid flex-1 gap-4 overflow-hidden p-6"
    style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
  >
    {Array.from({ length: columns * 2 }).map((_, index) => (
      <div
        // eslint-disable-next-line react/no-array-index-key
        key={index}
        className="flex h-72 flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-4"
      >
        <span className="h-3 w-3/4 rounded-max bg-surface-float" />
        <span className="h-3 w-1/2 rounded-max bg-surface-float" />
        <span className="mt-auto h-32 rounded-12 bg-surface-float" />
      </div>
    ))}
  </div>
);

export const EntryStage = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => (
  <div className="relative flex h-[50rem] w-full flex-col overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-default">
    <IntroMotion />
    <div className="z-2 flex h-10 shrink-0 items-center gap-2 border-b border-border-subtlest-tertiary bg-background-subtle px-3">
      <span className="flex gap-1.5">
        <span className="size-2.5 rounded-max bg-surface-hover" />
        <span className="size-2.5 rounded-max bg-surface-hover" />
        <span className="size-2.5 rounded-max bg-surface-hover" />
      </span>
      <span className="ml-14 flex h-6 w-72 items-center gap-1.5 rounded-8 bg-surface-float px-2 text-text-tertiary typo-caption1">
        <LockIcon size={IconSize.XXSmall} />
        app.daily.dev
      </span>
    </div>
    <div className="relative min-h-0 flex-1">
      {children}
      <Toast />
    </div>
    <NativePermissionPrompt />
  </div>
);

const IconButton = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}): ReactElement => (
  <span
    className={classNames(
      'flex size-10 items-center justify-center rounded-12 text-text-tertiary',
      className,
    )}
  >
    {children}
  </span>
);

export const ClassicLayout = ({
  headerRight,
  avatar,
  feedActionsRight,
  overlay,
}: {
  headerRight?: ReactNode;
  avatar?: ReactNode;
  feedActionsRight?: ReactNode;
  overlay?: ReactNode;
}): ReactElement => (
  <div className="relative flex h-full flex-col">
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border-subtlest-tertiary px-4">
      <span className="flex items-center gap-1.5">
        <LogoIcon className={{ container: 'h-6' }} />
        <LogoText className={{ container: 'h-4' }} />
      </span>
      <span className="mx-auto flex h-10 w-96 items-center gap-2 rounded-12 bg-surface-float px-3 text-text-quaternary typo-callout">
        <SearchIcon />
        Search
      </span>
      <div className="flex items-center gap-2">
        {headerRight}
        <span className="flex h-10 items-center gap-1 rounded-12 bg-surface-float px-3 font-bold text-text-primary typo-callout">
          <PlusIcon />
          New post
        </span>
        <IconButton>
          <BellIcon />
        </IconButton>
        {avatar ?? <DefaultAvatar />}
      </div>
    </header>
    <div className="flex min-h-0 flex-1">
      <nav className="flex w-56 shrink-0 flex-col gap-1 border-r border-border-subtlest-tertiary p-3">
        {[
          'My feed',
          'Explore',
          'Following',
          'Bookmarks',
          'Squads',
          'History',
        ].map((item, index) => (
          <span
            key={item}
            className={classNames(
              'flex h-9 items-center gap-3 rounded-10 px-3 typo-callout',
              index === 0
                ? 'bg-surface-float font-bold text-text-primary'
                : 'text-text-tertiary',
            )}
          >
            <span className="size-4 rounded-4 bg-surface-hover" />
            {item}
          </span>
        ))}
      </nav>
      <main className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-14 shrink-0 items-center gap-2 px-6">
          <span className="font-bold text-text-primary typo-title3">
            My feed
          </span>
          <span className="ml-3 h-8 w-20 rounded-10 bg-surface-float" />
          <span className="h-8 w-8 rounded-10 bg-surface-float" />
          <span className="flex-1" />
          {feedActionsRight}
        </div>
        <FeedGrid />
      </main>
    </div>
    {overlay}
  </div>
);

export const DefaultAvatar = (): ReactElement => (
  <span className="size-8 rounded-10 bg-accent-cabbage-default" />
);

const railTab = (icon: ReactElement, isActive = false) => (
  <IconButton
    className={isActive ? 'bg-surface-float text-text-primary' : undefined}
  >
    {icon}
  </IconButton>
);

export const RailLayout = ({
  railExtra,
  stripRight,
  avatar,
  overlay,
}: {
  railExtra?: ReactNode;
  stripRight?: ReactNode;
  avatar?: ReactNode;
  overlay?: ReactNode;
}): ReactElement => (
  <div className="relative flex h-full">
    <nav className="flex w-16 shrink-0 flex-col items-center gap-1 border-r border-border-subtlest-tertiary bg-background-subtle py-3">
      <span className="mb-2 flex size-10 items-center justify-center">
        <LogoIcon className={{ container: 'h-7' }} />
      </span>
      {railTab(<HomeIcon />)}
      {railTab(<SearchIcon />)}
      <span className="my-1 h-px w-8 bg-border-subtlest-tertiary" />
      {railTab(<CompassIcon />, true)}
      {railTab(<SquadIcon />)}
      {railTab(<BookmarkIcon />)}
      {railTab(<ReadingStreakIcon />)}
      <span className="my-1 flex size-10 items-center justify-center">
        {avatar ?? <DefaultAvatar />}
      </span>
      {railTab(<PlusIcon />)}
      <span className="flex-1" />
      {railExtra}
      {railTab(<InviteIcon />)}
      {railTab(<HelpIcon />)}
      {railTab(<SettingsIcon />)}
    </nav>
    <main className="flex min-w-0 flex-1 flex-col">
      <div className="flex h-14 shrink-0 items-center gap-2 border-b border-border-subtlest-tertiary px-6">
        {['For you', 'Following', 'Popular', 'Upvoted'].map((chip, index) => (
          <span
            key={chip}
            className={classNames(
              'flex h-8 items-center rounded-10 px-3 typo-callout',
              index === 0
                ? 'bg-text-primary font-bold text-surface-invert'
                : 'text-text-tertiary',
            )}
          >
            {chip}
          </span>
        ))}
        <span className="flex-1" />
        {stripRight}
      </div>
      <FeedGrid columns={4} />
    </main>
    {overlay}
  </div>
);

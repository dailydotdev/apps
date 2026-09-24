import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  BellIcon,
  BookmarkIcon,
  CompassIcon,
  GiftIcon,
  HelpIcon,
  HomeIcon,
  MenuIcon,
  NewPostIcon,
  SearchIcon,
  SettingsIcon,
  SquadIcon,
} from '@dailydotdev/shared/src/components/icons';
import {
  RAIL_ICON_SIZE,
  railColumnGapClass,
  railCountBubbleClass,
  railDividerBgClass,
  railGlyphBoxClass,
  railTabClass,
  railTabLabelClass,
} from '@dailydotdev/shared/src/components/sidebar/common';
import { StreakBadge } from '@dailydotdev/shared/src/components/sidebar/StreakBadge';
import { Bubble } from '@dailydotdev/shared/src/components/tooltips/utils';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';
import { squad, team } from './data';

// The v2 rail as production renders it on a squad page, collapsed: logo,
// Home and Search, the tabs with Squads selected, the shortcuts dock with
// this squad pinned, and Invite / Support / Settings at the bottom. Built
// from the rail's own class constants in shared so it cannot drift.

export const railBackgroundClass =
  'bg-[color-mix(in_srgb,var(--theme-surface-secondary)_3%,var(--theme-background-default))]';

const railButtonClass =
  'focus-outline flex size-10 items-center justify-center rounded-12 text-text-tertiary transition-[background-color,color,transform] duration-150 ease-out hover:bg-surface-hover hover:text-text-primary active:scale-90 motion-reduce:transition-none';

const Divider = ({ className }: { className?: string }): ReactElement => (
  <div
    aria-hidden
    className={classNames('h-px w-6', railDividerBgClass, className)}
  />
);

const Tab = ({
  label,
  icon,
  selected = false,
  className,
}: {
  label: string;
  icon: ReactNode;
  selected?: boolean;
  className?: string;
}): ReactElement => (
  <button
    type="button"
    role="tab"
    aria-selected={selected}
    title={label}
    className={classNames(
      railTabClass,
      selected && 'bg-background-default !text-text-primary',
      className,
    )}
  >
    <span className="relative flex items-center justify-center">{icon}</span>
    <span className={railTabLabelClass}>{label}</span>
  </button>
);

export const ProductionRail = ({
  loggedIn = true,
}: {
  loggedIn?: boolean;
}): ReactElement => (
  <nav
    aria-label="Primary navigation"
    className={classNames(
      'group/rail flex w-20 shrink-0 flex-col items-center px-1.5 pb-3 pt-[13px]',
      railColumnGapClass,
      railBackgroundClass,
    )}
  >
    <div className="mt-2.5">
      <a
        href="/"
        aria-label="daily.dev"
        title="daily.dev"
        className="focus-outline flex size-10 items-center justify-center rounded-12 text-text-primary transition-[background-color,transform] duration-150 ease-out hover:bg-surface-hover active:scale-90"
      >
        <span className={railGlyphBoxClass}>
          <LogoIcon className={{ container: 'h-[1.125rem] w-auto' }} />
        </span>
      </a>
    </div>
    <a href="/" aria-label="Home" title="Home" className={railButtonClass}>
      <span className={railGlyphBoxClass}>
        <HomeIcon size={RAIL_ICON_SIZE} aria-hidden />
      </span>
    </a>
    <button
      type="button"
      aria-label="Search"
      title="Search ⌘K"
      className={railButtonClass}
    >
      <SearchIcon size={RAIL_ICON_SIZE} aria-hidden />
    </button>

    <Divider className="my-1" />

    <div
      className={classNames(
        'flex min-h-0 w-full flex-1 flex-col items-center',
        railColumnGapClass,
      )}
    >
      <div
        role="tablist"
        aria-label="Sidebar categories"
        className={classNames(
          'flex w-full flex-col items-center',
          railColumnGapClass,
        )}
      >
        <Tab
          label="Explore"
          icon={
            <CompassIcon
              size={RAIL_ICON_SIZE}
              aria-hidden
              className="scale-105"
            />
          }
        />
        <Tab
          label="Squads"
          selected
          icon={<SquadIcon secondary size={RAIL_ICON_SIZE} aria-hidden />}
        />
        {loggedIn && (
          <>
            <Tab
              label="Activity"
              icon={
                <>
                  <BellIcon size={RAIL_ICON_SIZE} aria-hidden />
                  <Bubble className={railCountBubbleClass}>3</Bubble>
                </>
              }
            />
            <Tab
              label="12"
              className="group/streaktab"
              icon={<StreakBadge state="safe" hasReadToday />}
            />
            <Tab
              label="You"
              icon={
                <span className={railGlyphBoxClass}>
                  <img
                    src={team[2].image}
                    alt=""
                    className="size-5 !rounded-8 object-cover"
                  />
                </span>
              }
            />
            <div className="flex justify-center">
              <Button
                type="button"
                variant={ButtonVariant.Primary}
                size={ButtonSize.Small}
                icon={<NewPostIcon />}
                aria-label="New post"
                title="New post"
                className="my-2 !size-9 !rounded-12 [&_svg]:!size-6"
              />
            </div>
          </>
        )}
      </div>

      {loggedIn && (
        <>
          <Divider className="mb-2" />
          <div className="flex w-full flex-col items-center gap-1 p-0.5">
            <button
              type="button"
              aria-label="Customize shortcuts"
              title="Customize shortcuts"
              className={railButtonClass}
            >
              <MenuIcon size={RAIL_ICON_SIZE} aria-hidden className="rotate-90" />
            </button>
            <a
              href="#"
              aria-label={squad.name}
              title={squad.name}
              className={classNames(railButtonClass, '!text-text-primary')}
            >
              <img
                src={squad.image}
                alt=""
                className="size-6 rounded-8 object-cover"
              />
            </a>
            <a
              href="#"
              aria-label="Bookmarks"
              title="Bookmarks"
              className={railButtonClass}
            >
              <BookmarkIcon size={RAIL_ICON_SIZE} aria-hidden />
            </a>
          </div>
        </>
      )}
    </div>

    <div
      aria-label="Sidebar utilities"
      className={classNames(
        'flex w-full flex-col items-center',
        railColumnGapClass,
      )}
    >
      {loggedIn && <Divider className="my-1" />}
      <a
        href="#"
        aria-label="Invite friends"
        title="Invite friends"
        className={railButtonClass}
      >
        <GiftIcon size={RAIL_ICON_SIZE} aria-hidden />
      </a>
      <button
        type="button"
        aria-label="Support"
        title="Support"
        className={railButtonClass}
      >
        <HelpIcon size={RAIL_ICON_SIZE} aria-hidden />
      </button>
      {loggedIn && (
        <button
          type="button"
          aria-label="Settings"
          title="Settings"
          className={railButtonClass}
        >
          <SettingsIcon size={RAIL_ICON_SIZE} aria-hidden />
        </button>
      )}
    </div>
  </nav>
);

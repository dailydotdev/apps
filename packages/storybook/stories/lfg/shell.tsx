import type { ReactElement, ReactNode } from 'react';
import React, { useLayoutEffect, useRef } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { ProfileImageSize } from '@dailydotdev/shared/src/components/ProfilePicture';
import { Bubble } from '@dailydotdev/shared/src/components/tooltips/utils';
import {
  RAIL_ICON_SIZE,
  railCountBubbleClass,
  railGlyphBoxClass,
  railTabClass,
  railTabLabelClass,
} from '@dailydotdev/shared/src/components/sidebar/common';
import { ShellSquare } from '@dailydotdev/shared/src/components/shell/ShellSquare';
import { ShellRow } from '@dailydotdev/shared/src/components/shell/ShellRow';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';
import { HomeIcon } from '@dailydotdev/shared/src/components/icons/Home';
import { SearchIcon } from '@dailydotdev/shared/src/components/icons/Search';
import { CompassIcon } from '@dailydotdev/shared/src/components/icons/Compass';
import { MailIcon } from '@dailydotdev/shared/src/components/icons/Mail';
import { BellIcon } from '@dailydotdev/shared/src/components/icons/Bell';
import { MoveToIcon } from '@dailydotdev/shared/src/components/icons/MoveTo';
import { LfgIcon } from './icons';
import { me, spamReasons } from './data';
import type { Route } from './store';
import { currentMe, isLooking, useProto } from './store';
import { LfgAvatar } from './ui';

type Tab = 'home' | 'lfg' | 'messages' | 'activity' | 'you';

const tabOf = (route: Route): Tab => {
  switch (route.name) {
    case 'messages':
      return 'messages';
    case 'activity':
      return 'activity';
    case 'discussion':
      return 'home';
    case 'profile':
      return route.userId === me.id ? 'you' : 'home';
    default:
      return 'lfg';
  }
};

const MyAvatar = (): ReactElement => {
  const { state } = useProto();
  return (
    <LfgAvatar
      user={currentMe(state)}
      size={ProfileImageSize.Small}
      looking={isLooking(state, me.id)}
    />
  );
};

export const useBadges = (): { messages: number; activity: number } => {
  const { state } = useProto();
  const requests = state.reachOuts.filter(
    (item) =>
      item.toId === me.id &&
      item.status === 'pending' &&
      !spamReasons[item.fromId],
  ).length;
  const unreadChats = state.chats.filter((chat) => chat.unread).length;
  return {
    messages: requests + unreadChats,
    activity: state.notifications.filter(
      (item) => item.unread && !state.seen.includes(item.id),
    ).length,
  };
};

/* ------------------------------------------------------- desktop rail */

const RailTab = ({
  label,
  active = false,
  count = 0,
  onClick,
  icon,
}: {
  label: string;
  active?: boolean;
  count?: number;
  onClick?: () => void;
  icon: (active: boolean) => ReactElement;
}): ReactElement => (
  <button
    type="button"
    onClick={onClick}
    aria-current={active ? 'page' : undefined}
    className={classNames(
      railTabClass,
      active && '!text-text-primary bg-surface-float',
    )}
  >
    <span className={railGlyphBoxClass}>
      {icon(active)}
      {count > 0 && <Bubble className={railCountBubbleClass}>{count}</Bubble>}
    </span>
    <span className={railTabLabelClass}>{label}</span>
  </button>
);

const railIconButton =
  'flex size-10 items-center justify-center rounded-12 text-text-tertiary hover:bg-surface-hover hover:text-text-primary';

const Rail = (): ReactElement => {
  const { state, navigate } = useProto();
  const tab = tabOf(state.route);
  const badges = useBadges();
  return (
    <nav
      aria-label="Primary navigation"
      className="hidden w-20 shrink-0 flex-col items-center gap-0.5 border-r border-border-subtlest-quaternary px-1.5 pb-3 pt-3 laptop:flex"
    >
      <span className="mb-1 flex size-10 items-center justify-center text-text-primary">
        <LogoIcon className={{ container: 'h-[1.125rem] w-auto' }} />
      </span>
      <button
        type="button"
        aria-label="Home"
        className={classNames(
          railIconButton,
          tab === 'home' && '!text-text-primary bg-surface-float',
        )}
        onClick={() => navigate({ name: 'discussion' })}
      >
        <HomeIcon secondary={tab === 'home'} size={RAIL_ICON_SIZE} />
      </button>
      <span className={railIconButton}>
        <SearchIcon size={RAIL_ICON_SIZE} />
      </span>
      <span className="my-3 h-px w-8 bg-border-subtlest-quaternary" />
      <RailTab
        label="Explore"
        icon={(active) => (
          <CompassIcon secondary={active} size={RAIL_ICON_SIZE} />
        )}
      />
      <RailTab
        label="LFG"
        active={tab === 'lfg'}
        onClick={() => navigate({ name: 'board' })}
        icon={(active) => <LfgIcon secondary={active} size={RAIL_ICON_SIZE} />}
      />
      <RailTab
        label="Messages"
        active={tab === 'messages'}
        count={badges.messages}
        onClick={() => navigate({ name: 'messages', tab: 'chats' })}
        icon={(active) => <MailIcon secondary={active} size={RAIL_ICON_SIZE} />}
      />
      <RailTab
        label="Activity"
        active={tab === 'activity'}
        count={badges.activity}
        onClick={() => navigate({ name: 'activity' })}
        icon={(active) => <BellIcon secondary={active} size={RAIL_ICON_SIZE} />}
      />
      <RailTab
        label="You"
        active={tab === 'you'}
        onClick={() => navigate({ name: 'profile', userId: me.id })}
        icon={() => <MyAvatar />}
      />
    </nav>
  );
};

/* ------------------------------------------------- phone: the block */

// The phone shell's top block, after ShellBlock: a root view gets a big
// title; a leaf page gets a back square and a small title. Actions are
// ShellSquares or one primary pill, and an optional row of chips sits under.
export const PhoneHeader = ({
  title,
  onBack,
  actions,
  row,
}: {
  title: ReactNode;
  onBack?: () => void;
  actions?: ReactNode;
  row?: ReactNode;
}): ReactElement => (
  <header className="sticky top-0 z-header flex shrink-0 flex-col bg-background-default laptop:hidden">
    <div className="flex h-[3.25rem] items-center gap-2 px-4">
      {onBack && (
        <ShellSquare aria-label="Back" onClick={onBack}>
          <MoveToIcon size={IconSize.Small} className="rotate-180" />
        </ShellSquare>
      )}
      <Typography
        tag={TypographyTag.H1}
        type={onBack ? TypographyType.Callout : TypographyType.Title3}
        bold
        truncate
        className={classNames('min-w-0 flex-1', onBack && 'px-1')}
      >
        {title}
      </Typography>
      {actions}
    </div>
    {row && <ShellRow>{row}</ShellRow>}
  </header>
);

/* --------------------------------------------- phone: the bottom bar */

// After ShellCluster: a floating bar on the 16px gutter, in shell material.
const PhoneCluster = (): ReactElement => {
  const { state, navigate } = useProto();
  const tab = tabOf(state.route);
  const badges = useBadges();
  const items: {
    id: Tab;
    label: string;
    count: number;
    route: Route;
    icon: (active: boolean) => ReactElement;
  }[] = [
    {
      id: 'home',
      label: 'Home',
      count: 0,
      route: { name: 'discussion' },
      icon: (active) => <HomeIcon secondary={active} size={RAIL_ICON_SIZE} />,
    },
    {
      id: 'lfg',
      label: 'LFG',
      count: 0,
      route: { name: 'board' },
      icon: (active) => <LfgIcon secondary={active} size={RAIL_ICON_SIZE} />,
    },
    {
      id: 'messages',
      label: 'Messages',
      count: badges.messages,
      route: { name: 'messages', tab: 'chats' },
      icon: (active) => <MailIcon secondary={active} size={RAIL_ICON_SIZE} />,
    },
    {
      id: 'activity',
      label: 'Activity',
      count: badges.activity,
      route: { name: 'activity' },
      icon: (active) => <BellIcon secondary={active} size={RAIL_ICON_SIZE} />,
    },
    {
      id: 'you',
      label: 'You',
      count: 0,
      route: { name: 'profile', userId: me.id },
      icon: () => <MyAvatar />,
    },
  ];

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-header px-4 pb-3 laptop:hidden">
      <nav
        aria-label="Tabs"
        className="shell-material pointer-events-auto flex h-14 items-center justify-around rounded-22 px-1"
      >
        {items.map((item) => {
          const active = item.id === tab;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(item.route)}
              aria-current={active ? 'page' : undefined}
              className={classNames(
                'shell-press flex flex-1 flex-col items-center gap-0.5 text-text-tertiary',
                active && '!text-text-primary',
              )}
            >
              <span className={railGlyphBoxClass}>
                {item.icon(active)}
                {item.count > 0 && (
                  <Bubble className={railCountBubbleClass}>{item.count}</Bubble>
                )}
              </span>
              <span className={railTabLabelClass}>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export const AppShell = ({
  children,
  scrolls = true,
  hideBar = false,
  routeKey,
}: {
  children: ReactNode;
  // A new page starts at the top, like a route change does.
  routeKey?: string;
  // Screens like Messages own their scrolling.
  scrolls?: boolean;
  // Forms and threads are places you finish, so they drop the bottom bar.
  hideBar?: boolean;
}): ReactElement => {
  const mainRef = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [routeKey]);

  return (
    <div className="flex min-h-0 flex-1 bg-background-default">
      <Rail />
      <div className="relative flex min-w-0 flex-1 flex-col">
        <main
          ref={mainRef}
          className={classNames(
            'flex min-h-0 flex-1 flex-col',
            scrolls ? 'overflow-y-auto' : 'overflow-hidden',
            !hideBar && scrolls && 'pb-20 laptop:pb-0',
            !hideBar && !scrolls && 'pb-[4.75rem] laptop:pb-0',
          )}
        >
          {children}
        </main>
        {!hideBar && <PhoneCluster />}
      </div>
    </div>
  );
};

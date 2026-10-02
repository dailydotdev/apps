import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useQueryClient } from '@tanstack/react-query';
import classNames from 'classnames';
import Link from '../utilities/Link';
import { useAuthContext } from '../../contexts/AuthContext';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { ProfileImageSize, ProfilePicture } from '../ProfilePicture';
import type { IconProps } from '../Icon';
import { IconSize } from '../Icon';
import {
  AddUserIcon,
  BookmarkIcon,
  CoreIcon,
  DevCardIcon,
  DevPlusIcon,
  FeedbackIcon,
  FilterIcon,
  HelpIcon,
  MagicIcon,
  ReputationIcon,
  SettingsIcon,
  TimerIcon,
  UserIcon,
} from '../icons';
import { Drawer } from '../drawers/Drawer';
import { RootPortal } from '../tooltips/Portal';
import { usePlusSubscription } from '../../hooks/usePlusSubscription';
import { SubscriptionStatus } from '../../lib/plus';
import { useHasAccessToCores } from '../../hooks/useCoresFeature';
import { useSettingsContext } from '../../contexts/SettingsContext';
import {
  plusUrl,
  settingsUrl,
  docs,
  reputation as reputationDocsUrl,
  walletUrl,
  webappUrl,
} from '../../lib/constants';
import { largeNumberFormat } from '../../lib';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import { ContentPreferenceType } from '../../graphql/contentPreference';
import { useUserFollowStats } from '../../hooks/profile/useUserFollowStats';
import useCustomDefaultFeed from '../../hooks/feed/useCustomDefaultFeed';
import { FeedSettingsMenu } from '../feeds/FeedSettings/types';
import { PlusUser } from '../PlusUser';
import { motion } from './constants';
import { ShellPage } from './ShellPageContext';

interface YouRowProps {
  icon: (props: IconProps) => ReactElement;
  label: string;
  meta?: string;
  href?: string;
  external?: boolean;
  onClick?: () => void;
}

const YouRow = ({
  icon: Icon,
  label,
  meta,
  href,
  external = false,
  onClick,
}: YouRowProps): ReactElement => {
  const content = (
    <>
      <span className="flex text-text-secondary">
        <Icon size={IconSize.Medium} />
      </span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {meta && (
        <span className="shrink-0 text-text-tertiary typo-footnote">
          {meta}
        </span>
      )}
    </>
  );
  const className =
    'flex h-12 w-full items-center gap-3 px-4 text-left text-text-primary transition-colors typo-callout hover:bg-surface-hover active:bg-surface-hover';

  if (href && external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {content}
      </a>
    );
  }

  if (href) {
    return (
      <Link href={href} passHref>
        <a className={className}>{content}</a>
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
};

const YouGroup = ({
  title,
  children,
  className,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}): ReactElement => (
  <div
    className={classNames(
      'flex flex-col border-t border-border-subtlest-tertiary py-2',
      className,
    )}
  >
    {title && (
      <span className="px-4 pb-1 pt-1 text-text-tertiary typo-caption1">
        {title}
      </span>
    )}
    {children}
  </div>
);

// A count the member can act on: the follow counts read inline under the
// handle, as on the profile.
const FollowStat = ({
  amount,
  label,
  onClick,
}: {
  amount: number;
  label: string;
  onClick: () => void;
}): ReactElement => (
  <button
    type="button"
    onClick={onClick}
    className="flex items-center gap-1 rounded-8 transition-colors typo-footnote hover:bg-surface-hover active:bg-surface-hover"
  >
    <b className="text-text-primary">{largeNumberFormat(amount)}</b>
    <span className="text-text-tertiary">{label}</span>
  </button>
);

// Reputation and Cores as the v2 rail shows them: one strip, two cells,
// each a full-height tap target, the number large enough to read at a
// glance. The streak stays on the Home row.
const StatCell = ({
  icon,
  amount,
  label,
  href,
  external = false,
}: {
  icon: ReactNode;
  amount: number;
  label: string;
  href: string;
  external?: boolean;
}): ReactElement => {
  const className =
    'flex min-w-0 flex-1 items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-hover active:bg-surface-hover';
  const content = (
    <>
      {icon}
      <span className="flex min-w-0 flex-col">
        <b className="tabular-nums text-text-primary typo-title3">
          {largeNumberFormat(amount)}
        </b>
        <span className="text-text-tertiary typo-caption1">{label}</span>
      </span>
    </>
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        aria-label={`${label}: ${amount}`}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} passHref>
      <a className={className} aria-label={`${label}: ${amount}`}>
        {content}
      </a>
    </Link>
  );
};

const usePlusRow = (): { label: string; meta: string } => {
  const { isPlus, status } = usePlusSubscription();

  if (!isPlus) {
    return { label: 'daily.dev Plus', meta: 'Upgrade' };
  }
  if (status === SubscriptionStatus.Cancelled) {
    return { label: 'daily.dev Plus', meta: 'Renew' };
  }

  return { label: 'daily.dev Plus', meta: 'Manage' };
};

// Behind the avatar: who you are and your counts on top, then only the
// places nothing else leads to, then the utilities. One screen, no scroll;
// what the tabs and the header already reach (feeds, squads, following,
// the streak) is not repeated here. On a phone it slides in from the left
// over the page (YouDrawer); /you renders the same panel as a page.
export function YouPanel({
  inDrawer = false,
  onLeave,
}: {
  inDrawer?: boolean;
  // The drawer's close: a modal opened from the menu first sends the page
  // home, since the page is inert and away while the menu shows.
  onLeave?: () => void;
}): ReactElement | null {
  const { openModal } = useLazyModal();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthContext();
  const { isPlus } = usePlusSubscription();
  const { data: followStats } = useUserFollowStats(user?.id);
  const { isCustomDefaultFeed, defaultFeedId } = useCustomDefaultFeed();
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const hasAccessToCores = useHasAccessToCores();
  const { optOutAchievements, optOutLevelSystem, optOutQuestSystem } =
    useSettingsContext();
  const plusRow = usePlusRow();
  const hideGameCenter =
    optOutAchievements && optOutLevelSystem && optOutQuestSystem;

  if (!user) {
    return null;
  }

  const profileUrl = `${webappUrl}${user.username}`;
  const feedSettingsUrl = isCustomDefaultFeed
    ? `${webappUrl}feeds/${defaultFeedId}/edit`
    : `${webappUrl}feeds/${user.id}/edit?dview=${FeedSettingsMenu.Tags}`;
  const followQuery = {
    queryProps: { id: user.id, entity: ContentPreferenceType.User },
  };
  const openFromMenu = (open: () => void) => {
    if (!onLeave) {
      open();
      return;
    }
    onLeave();
    window.setTimeout(open, motion.enter);
  };
  const openFollowList = (
    type: LazyModal.UserFollowersModal | LazyModal.UserFollowingModal,
    placeholderAmount: number,
  ) => {
    if (!placeholderAmount) {
      return;
    }
    openFromMenu(() =>
      openModal({ type, props: { ...followQuery, placeholderAmount } }),
    );
  };

  const helpButton = (
    <button
      type="button"
      onClick={() => setIsHelpOpen(true)}
      className="shell-material shell-press shell-hit relative flex h-[2.375rem] shrink-0 items-center gap-1.5 rounded-14 px-3 font-bold text-text-primary typo-callout"
    >
      <HelpIcon size={IconSize.Small} />
      Help
    </button>
  );

  return (
    <div className="flex flex-col pb-6">
      {!inDrawer && <ShellPage title="You" actions={helpButton} />}
      <div className="flex flex-col gap-3 px-4 pb-4 pt-3">
        {inDrawer && (
          <div className="flex items-center justify-between">
            <Link href={profileUrl} passHref>
              <a aria-label="Profile">
                <ProfilePicture
                  user={user}
                  size={ProfileImageSize.XXLarge}
                  nativeLazyLoading
                />
              </a>
            </Link>
            {helpButton}
          </div>
        )}
        <Link href={profileUrl} passHref>
          <a className="flex items-center gap-3">
            {!inDrawer && (
              <ProfilePicture
                user={user}
                size={ProfileImageSize.XLarge}
                nativeLazyLoading
              />
            )}
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="flex min-w-0 items-center gap-1">
                <span className="truncate font-bold typo-title3">
                  {user.name}
                </span>
                {isPlus && <PlusUser withText={false} />}
              </span>
              <span className="truncate text-text-tertiary typo-footnote">
                @{user.username}
              </span>
            </span>
          </a>
        </Link>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <FollowStat
            amount={followStats?.numFollowing ?? 0}
            label="Following"
            onClick={() =>
              openFollowList(
                LazyModal.UserFollowingModal,
                followStats?.numFollowing ?? 0,
              )
            }
          />
          <FollowStat
            amount={followStats?.numFollowers ?? 0}
            label="Followers"
            onClick={() =>
              openFollowList(
                LazyModal.UserFollowersModal,
                followStats?.numFollowers ?? 0,
              )
            }
          />
        </div>
        <div className="flex items-stretch overflow-hidden rounded-14 border border-border-subtlest-tertiary bg-surface-float">
          <StatCell
            icon={
              <ReputationIcon
                size={IconSize.Medium}
                className="text-accent-onion-default"
              />
            }
            amount={user.reputation ?? 0}
            label="Reputation"
            href={reputationDocsUrl}
            external
          />
          {hasAccessToCores && (
            <>
              <span
                aria-hidden
                className="w-px self-stretch bg-border-subtlest-tertiary"
              />
              <StatCell
                icon={
                  <CoreIcon
                    size={IconSize.Medium}
                    className="text-accent-cheese-default"
                  />
                }
                amount={user.balance?.amount ?? 0}
                label="Cores"
                href={walletUrl}
              />
            </>
          )}
        </div>
      </div>
      <YouGroup className="border-t-0 pt-0">
        <YouRow icon={UserIcon} label="Profile" href={profileUrl} />
        <YouRow
          icon={DevPlusIcon}
          label={plusRow.label}
          meta={plusRow.meta}
          href={plusUrl}
        />
        <YouRow
          icon={FilterIcon}
          label="Feed settings"
          href={feedSettingsUrl}
        />
        <YouRow
          icon={BookmarkIcon}
          label="Bookmarks"
          href={`${webappUrl}bookmarks`}
        />
        <YouRow icon={TimerIcon} label="History" href={`${webappUrl}history`} />
        {!hideGameCenter && (
          <YouRow
            icon={MagicIcon}
            label="Game center"
            href={`${webappUrl}game-center`}
          />
        )}
        <YouRow
          icon={DevCardIcon}
          label="DevCard"
          href={`${webappUrl}devcard`}
        />
      </YouGroup>
      <YouGroup>
        <YouRow
          icon={AddUserIcon}
          label="Invite friends"
          href={`${settingsUrl}/invite`}
        />
        <YouRow
          icon={SettingsIcon}
          label="Settings"
          onClick={async () => {
            // On a phone the settings menu is state over the first settings
            // page; the layout closes it on arrival, so it opens after.
            await router.push(`${settingsUrl}/profile`);
            queryClient.setQueryData(
              generateQueryKey(RequestKey.AccountNavigation),
              true,
            );
          }}
        />
      </YouGroup>
      <RootPortal>
        <Drawer
          isOpen={isHelpOpen}
          onClose={() => setIsHelpOpen(false)}
          title="Help"
        >
          <YouRow
            icon={FeedbackIcon}
            label="Send feedback"
            onClick={() => {
              setIsHelpOpen(false);
              openFromMenu(() => openModal({ type: LazyModal.Feedback }));
            }}
          />
          <YouRow icon={HelpIcon} label="Help center" href={docs} external />
        </Drawer>
      </RootPortal>
    </div>
  );
}

export function YouPage(): ReactElement | null {
  return <YouPanel />;
}

// The phone's menu, X's side panel mirrored: the page slides to the left
// and uncovers the menu, which sits under it on the right. The avatar
// opens it; a swipe in from the right edge drags the page open under the
// finger, and dragging the page back, a tap on its edge, Escape or any
// navigation closes it. A release settles by speed first, then by how far
// the page went. The page is inert while it is away.
const youWidth = () => Math.min(window.innerWidth * 0.85, 352);
const edgeWidth = 24;
const claimDistance = 8;
const flick = 0.35;

export function YouDrawer({
  isOpen,
  onOpen,
  onClose,
}: {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}): ReactElement | null {
  const router = useRouter();
  const [mounted, setMounted] = useState(isOpen);
  const [dragging, setDragging] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const openRef = useRef(isOpen);
  openRef.current = isOpen;

  useEffect(() => {
    onClose();
    // Only the route change closes it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router?.asPath]);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      return undefined;
    }
    if (!mounted) {
      return undefined;
    }
    // The page keeps its card look while it slides back; the menu stays
    // under it until it has landed.
    const { documentElement } = document;
    documentElement.classList.add('you-closing');
    const timer = window.setTimeout(() => {
      documentElement.classList.remove('you-closing');
      setMounted(false);
    }, motion.enter);
    return () => {
      window.clearTimeout(timer);
      documentElement.classList.remove('you-closing');
    };
    // mounted is read, not watched: the exit runs once per close.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }
    const root = document.getElementById('__next');
    const { documentElement } = document;
    documentElement.classList.add('you-open');
    root?.setAttribute('inert', '');
    const previouslyFocused = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      documentElement.classList.remove('you-open');
      root?.removeAttribute('inert');
      previouslyFocused?.focus?.();
    };
  }, [isOpen, onClose]);

  // The drag: the finger owns the page's position through --you-progress
  // (0 home, 1 away); the release picks a side and hands back to the CSS
  // transition, whose length follows the distance left.
  useEffect(() => {
    const { documentElement, body } = document;
    let startX = 0;
    let startY = 0;
    let startProgress = 0;
    let progress = 0;
    let lastX = 0;
    let lastTime = 0;
    let velocity = 0;
    let state: 'idle' | 'maybe' | 'dragging' = 'idle';

    const setProgress = (value: number) => {
      progress = Math.min(1, Math.max(0, value));
      documentElement.style.setProperty('--you-progress', String(progress));
    };

    const finish = (open: boolean) => {
      const remaining = open ? 1 - progress : progress;
      documentElement.style.setProperty(
        '--you-duration',
        `${Math.max(120, Math.round(motion.enter * remaining))}ms`,
      );
      documentElement.classList.remove('you-dragging');
      setDragging(false);
      if (open) {
        onOpen();
      } else {
        onClose();
      }
      window.setTimeout(() => {
        documentElement.style.removeProperty('--you-duration');
        documentElement.style.removeProperty('--you-progress');
        // A drag that went back home from closed never opened; the panel
        // mounted for the drag leaves here.
        if (!open && !openRef.current) {
          setMounted(false);
        }
      }, motion.enter);
    };

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) {
        return;
      }
      const touch = event.touches[0];
      const open = openRef.current;
      // Closed: only a finger at the right edge may start it. Open: a
      // finger on the page's strip, or anywhere on the panel, may close it.
      const onEdge = touch.clientX >= window.innerWidth - edgeWidth;
      if (!open && !onEdge) {
        return;
      }
      startX = touch.clientX;
      startY = touch.clientY;
      lastX = startX;
      lastTime = event.timeStamp;
      velocity = 0;
      startProgress = open ? 1 : 0;
      state = 'maybe';
    };

    const onTouchMove = (event: TouchEvent) => {
      if (state === 'idle') {
        return;
      }
      const touch = event.touches[0];
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;
      if (state === 'maybe') {
        if (Math.abs(dx) < claimDistance) {
          return;
        }
        if (Math.abs(dy) > Math.abs(dx)) {
          state = 'idle';
          return;
        }
        const open = openRef.current;
        if ((!open && dx > 0) || (open && dx < 0)) {
          state = 'idle';
          return;
        }
        state = 'dragging';
        setDragging(true);
        setMounted(true);
        setProgress(startProgress);
        documentElement.classList.add('you-dragging');
      }
      event.preventDefault();
      const dt = Math.max(1, event.timeStamp - lastTime);
      velocity = (touch.clientX - lastX) / dt;
      lastX = touch.clientX;
      lastTime = event.timeStamp;
      setProgress(startProgress - dx / youWidth());
    };

    const onTouchEnd = () => {
      if (state !== 'dragging') {
        state = 'idle';
        return;
      }
      state = 'idle';
      if (velocity < -flick) {
        finish(true);
      } else if (velocity > flick) {
        finish(false);
      } else {
        finish(progress > 0.5);
      }
    };

    body.addEventListener('touchstart', onTouchStart, { passive: true });
    body.addEventListener('touchmove', onTouchMove, { passive: false });
    body.addEventListener('touchend', onTouchEnd);
    body.addEventListener('touchcancel', onTouchEnd);
    return () => {
      body.removeEventListener('touchstart', onTouchStart);
      body.removeEventListener('touchmove', onTouchMove);
      body.removeEventListener('touchend', onTouchEnd);
      body.removeEventListener('touchcancel', onTouchEnd);
      documentElement.classList.remove('you-dragging');
    };
  }, [onOpen, onClose]);

  if (!mounted && !dragging) {
    return null;
  }

  return (
    <RootPortal>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="You"
        tabIndex={-1}
        className="you-panel fixed bottom-0 right-0 top-0 flex w-[85%] max-w-[22rem] flex-col overflow-y-auto overscroll-contain bg-background-default pt-[var(--safe-area-top,0px)] focus:outline-none"
      >
        <YouPanel inDrawer onLeave={onClose} />
      </div>
      {/* The strip of the page still showing: a tap on it brings the page
          back. */}
      {isOpen && (
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="you-scrim fixed inset-y-0 left-0 w-[15%] bg-overlay-quaternary-onion"
        />
      )}
    </RootPortal>
  );
}

export default YouPage;

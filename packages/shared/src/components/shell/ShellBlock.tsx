import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import Link from '../utilities/Link';
import Logo, { LogoPosition } from '../Logo';
import { useAuthContext } from '../../contexts/AuthContext';
import { useReadingStreak } from '../../hooks/streaks';
import { ReadingStreakButton } from '../streak/ReadingStreakButton';
import { QuestHeaderButton } from '../header/QuestHeaderButton';
import { ButtonIconPosition } from '../buttons/common';
import { ProfileImageSize, ProfilePicture } from '../ProfilePicture';
import { ArrowIcon, DevPlusIcon, MailIcon, SettingsIcon } from '../icons';
import { AlertColor, AlertDot } from '../AlertDot';
import { IconSize } from '../Icon';
import { useMobileAppHeader } from '../../features/getApp/hooks/useMobileAppHeader';
import { MobileAppActions } from '../../features/getApp/components/MobileAppActions';
import { usePlusSubscription } from '../../hooks/usePlusSubscription';
import { LogEvent, TargetId } from '../../lib/log';
import { plusUrl, webappUrl } from '../../lib/constants';
import { ShellSquare } from './ShellSquare';
import { motion, topButton } from './constants';
import { revealShell, setShellEdge, useShellScroll } from './useShellScroll';
import { useOnline } from './useOnline';
import { useMessagesEnabled } from '../../features/messages/hooks/useMessagesEnabled';
import { useHasUnreadMessages } from '../../features/messages/hooks/useHasUnreadMessages';
import { DmOrigin, getMessagesUrl } from '../../features/messages/urls';
import { isIOS, isIOSNative } from '../../lib/func';
import {
  useShellActionsSlot,
  useShellDockedRow,
  useShellPageConfig,
} from './ShellPageContext';
import { ShellRoot, useShellBack } from './shellNav';

// The block is in the server HTML, where a layout effect only warns; the
// measurement is a client concern anyway.
const useClientLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;

const rootTitles: Record<Exclude<ShellRoot, ShellRoot.Home>, string> = {
  [ShellRoot.Explore]: 'Explore',
  [ShellRoot.Squads]: 'Squads',
  [ShellRoot.Activity]: 'Activity',
};

const AvatarSquare = (): ReactElement | null => {
  const { user } = useAuthContext();

  if (!user) {
    return null;
  }

  return (
    <Link href={`${webappUrl}you`} passHref>
      <ShellSquare tag="a" aria-label="You" className="overflow-hidden">
        <ProfilePicture
          user={user}
          size={ProfileImageSize.Large}
          nativeLazyLoading
          className="!size-[2.375rem] !rounded-14"
        />
      </ShellSquare>
    </Link>
  );
};

const PlusSquare = (): ReactElement | null => {
  const { isPlus, logSubscriptionEvent } = usePlusSubscription();

  if (isPlus) {
    return null;
  }

  return (
    <Link href={plusUrl} passHref>
      <ShellSquare
        tag="a"
        aria-label="daily.dev Plus"
        onClick={() =>
          logSubscriptionEvent({
            event_name: LogEvent.UpgradeSubscription,
            target_id: TargetId.MobileHeader,
          })
        }
      >
        <span className="flex text-action-plus-default">
          <DevPlusIcon secondary size={IconSize.Small} />
        </span>
      </ShellSquare>
    </Link>
  );
};

// The inbox door, beside the avatar on every root: messages are checked
// in passing, not browsed, so they live in the header rather than a tab.
const MessagesSquare = (): ReactElement | null => {
  const { isEnabled } = useMessagesEnabled();
  const hasUnread = useHasUnreadMessages(isEnabled);

  if (!isEnabled) {
    return null;
  }

  return (
    <Link
      href={getMessagesUrl(undefined, { origin: DmOrigin.Header })}
      passHref
    >
      <ShellSquare
        tag="a"
        aria-label={hasUnread ? 'Messages, unread' : 'Messages'}
      >
        <MailIcon size={IconSize.Small} />
        {hasUnread && (
          <AlertDot className="right-1.5 top-1.5" color={AlertColor.Cabbage} />
        )}
      </ShellSquare>
    </Link>
  );
};

const RootRow = ({ root }: { root: ShellRoot }): ReactElement => {
  const { user } = useAuthContext();
  const setActionsSlot = useShellActionsSlot();
  const { streak, isLoading, isStreaksEnabled } = useReadingStreak();
  const isMobileAppHeader = useMobileAppHeader();
  const { isPlus } = usePlusSubscription();
  const { isEnabled: hasMessages } = useMessagesEnabled();
  const isHome = root === ShellRoot.Home;

  return (
    <div
      className="shell-root-row flex items-center"
      style={{
        height: topButton.size + 14,
        paddingInline: topButton.inset,
        gap: topButton.gap,
      }}
    >
      {isHome ? (
        <Logo
          position={LogoPosition.Initial}
          isPlus={isPlus}
          // The Plus and messages squares together leave a 375px row no
          // room for the wordmark.
          hideTextNarrow={hasMessages && !isPlus}
        />
      ) : (
        <h1 className="min-w-0 flex-1 truncate font-bold typo-title3">
          {rootTitles[root]}
        </h1>
      )}
      {isHome && <span className="flex-1" />}
      {isMobileAppHeader && <MobileAppActions />}
      {user && isHome && isStreaksEnabled && streak && (
        <ReadingStreakButton
          isLoading={isLoading}
          streak={streak}
          compact
          iconPosition={ButtonIconPosition.Right}
          className="shell-material shell-hit relative !h-[2.375rem] !rounded-14 px-3"
        />
      )}
      {user && isHome && <QuestHeaderButton compact shell />}
      {user && isHome && <PlusSquare />}
      {user && root === ShellRoot.Activity && (
        <Link href={`${webappUrl}notifications/settings`} passHref>
          <ShellSquare tag="a" aria-label="Notification settings">
            <SettingsIcon size={IconSize.Small} />
          </ShellSquare>
        </Link>
      )}
      <div ref={setActionsSlot} className="contents" />
      {user && <MessagesSquare />}
      <AvatarSquare />
    </div>
  );
};

const PageRow = ({
  title,
  titleFades,
  isOverCover,
  onBack,
}: {
  title?: ReactNode;
  titleFades?: boolean;
  isOverCover?: boolean;
  onBack?: () => void;
}): ReactElement => {
  const historyBack = useShellBack();
  const goBack = onBack ?? historyBack;
  const setActionsSlot = useShellActionsSlot();
  const isMobileAppHeader = useMobileAppHeader();

  return (
    <div
      className="flex items-center"
      style={{
        height: topButton.size + 14,
        paddingInline: topButton.inset,
        gap: topButton.gap,
      }}
    >
      <ShellSquare aria-label="Go back" onClick={goBack}>
        <ArrowIcon size={IconSize.Small} className="-rotate-90" />
      </ShellSquare>
      {title ? (
        <h1
          className={classNames(
            'min-w-0 flex-1 truncate px-1 font-bold typo-callout',
            titleFades && 'shell-title-in',
          )}
        >
          {title}
        </h1>
      ) : (
        <span className="min-w-0 flex-1" />
      )}
      <div
        className="flex shrink-0 items-center"
        style={{ gap: topButton.gap }}
      >
        <div ref={setActionsSlot} className="contents" />
        {isMobileAppHeader && <MobileAppActions isFloating={isOverCover} />}
      </div>
    </div>
  );
};

interface ShellBlockProps {
  root?: ShellRoot;
  row?: ReactNode;
}

// The top block of a phone page: the brand or page row and the page's own
// row under it, one solid piece under the status bar that hides while
// reading down and returns on any scroll up. Content keeps a constant top
// padding from --shell-top, so hiding never reflows it.
export function ShellBlock({
  root,
  row,
}: ShellBlockProps): ReactElement | null {
  const router = useRouter();
  const config = useShellPageConfig();
  const dockedRow = useShellDockedRow();
  const { p } = useShellScroll();
  const online = useOnline();
  const ref = useRef<HTMLElement>(null);
  const hidden = !config?.hidden && p >= 0.99;
  // iOS 26 Safari paints its status area solid while a fixed element with a
  // background stands at the top, and looks again only when that element
  // leaves the layout: slid out of view or made invisible, the block left a
  // solid band over the page. There, once it has slid away it leaves the
  // layout ('out'). Coming back it first stands at the hidden position
  // ('returning'), since a box leaving `display: none` has no start for the
  // slide to run from.
  const [gone, setGone] = useState<'out' | 'returning' | false>(false);
  useEffect(() => {
    if (!hidden) {
      setGone((was) => (was === 'out' ? 'returning' : false));
      return undefined;
    }
    if (!isIOS() || isIOSNative()) {
      return undefined;
    }
    const timer = window.setTimeout(() => setGone('out'), motion.snap);
    return () => window.clearTimeout(timer);
  }, [hidden]);
  useClientLayoutEffect(() => {
    if (gone !== 'returning') {
      return;
    }
    // Reading the box settles the hidden position as the slide's start.
    ref.current?.getBoundingClientRect();
    setGone(false);
  }, [gone]);
  const offset = gone ? 1 : p;

  // The observer reports every later change of height (a row arriving, the
  // offline strip); only the header mounting or leaving needs a new one.
  useClientLayoutEffect(() => {
    const element = ref.current;
    const publish = () => {
      // Out of the layout (see `gone`) it measures 0; the last height holds.
      if (element && !element.getClientRects().length) {
        return;
      }
      document.documentElement.style.setProperty(
        '--shell-top',
        `${element?.offsetHeight ?? 0}px`,
      );
      setShellEdge(element ? element.offsetTop + element.offsetHeight : 0);
    };
    publish();
    const observer = element ? new ResizeObserver(publish) : undefined;
    if (element) {
      observer?.observe(element);
    }

    return () => {
      observer?.disconnect();
      document.documentElement.style.removeProperty('--shell-top');
    };
  }, [config?.hidden]);

  // Once the block is gone the status area turns into a soft scroll edge
  // (safeArea.css paints it solid while the block stands under it).
  useEffect(() => {
    document.documentElement.classList.toggle('shell-edge', hidden);
    return () => document.documentElement.classList.remove('shell-edge');
  }, [hidden]);

  // Over a cover the status area is the cover's too (safeArea.css paints it
  // solid everywhere else).
  const isOverCover = !!config?.transparent && !hidden;
  useEffect(() => {
    document.documentElement.classList.toggle('shell-over-cover', isOverCover);
    return () => document.documentElement.classList.remove('shell-over-cover');
  }, [isOverCover]);

  // Arrival never hides the block, and a focused field keeps it in view.
  useEffect(() => {
    revealShell();
  }, [router.asPath]);

  useEffect(() => {
    const onFocus = (event: FocusEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches?.('input, textarea, [contenteditable="true"]')) {
        revealShell();
      }
    };
    document.addEventListener('focusin', onFocus);
    return () => document.removeEventListener('focusin', onFocus);
  }, []);

  if (config?.hidden) {
    return null;
  }

  return (
    <header
      ref={ref}
      aria-hidden={hidden || undefined}
      className={classNames(
        'shell-block fixed inset-x-0 z-header flex flex-col tablet:hidden',
        !config?.transparent && 'bg-background-default',
        hidden && 'pointer-events-none',
      )}
      style={{
        display: gone === 'out' ? 'none' : undefined,
        top: 'calc(var(--safe-area-top, 0px) + var(--phone-top-ad-height, 0px))',
        transform: `translateY(calc((-100% - var(--safe-area-top, 0px)) * ${offset}))`,
        transition: `transform ${motion.snap}ms ${motion.interaction}, background-color ${motion.feedback}ms ease-out`,
      }}
    >
      {!online && (
        <div
          role="status"
          className="flex h-7 items-center justify-center bg-surface-float text-text-secondary typo-footnote"
        >
          You&apos;re offline
        </div>
      )}
      {root ? (
        <div className="shell-block-line">
          <RootRow root={root} />
          <div className="shell-block-row">
            {config?.row ?? dockedRow ?? row}
          </div>
        </div>
      ) : (
        <>
          <PageRow
            title={config?.title}
            titleFades={config?.titleFades}
            isOverCover={config?.transparent}
            onBack={config?.onBack}
          />
          {config?.row ?? dockedRow ?? row}
        </>
      )}
    </header>
  );
}

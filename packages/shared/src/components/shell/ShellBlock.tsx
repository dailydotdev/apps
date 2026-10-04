import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useLayoutEffect, useRef } from 'react';
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
import { ArrowIcon, DevPlusIcon, SettingsIcon } from '../icons';
import { IconSize } from '../Icon';
import { useMobileAppHeader } from '../../features/getApp/hooks/useMobileAppHeader';
import { MobileAppActions } from '../../features/getApp/components/MobileAppActions';
import { usePlusSubscription } from '../../hooks/usePlusSubscription';
import { LogEvent, TargetId } from '../../lib/log';
import { plusUrl, webappUrl } from '../../lib/constants';
import { ShellSquare } from './ShellSquare';
import { motion, topButton } from './constants';
import { revealShell, useShellScroll } from './useShellScroll';
import { useOnline } from './useOnline';
import { useShellActionsSlot, useShellPageConfig } from './ShellPageContext';
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
      <a
        aria-label="You"
        className="shell-material shell-press shell-hit relative flex size-[2.375rem] shrink-0 items-center justify-center overflow-hidden rounded-14"
      >
        <ProfilePicture
          user={user}
          size={ProfileImageSize.Large}
          nativeLazyLoading
          className="!size-[2.375rem] !rounded-14"
        />
      </a>
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

const RootRow = ({ root }: { root: ShellRoot }): ReactElement => {
  const { user } = useAuthContext();
  const setActionsSlot = useShellActionsSlot();
  const { streak, isLoading, isStreaksEnabled } = useReadingStreak();
  const isMobileAppHeader = useMobileAppHeader();
  const { isPlus } = usePlusSubscription();
  const isHome = root === ShellRoot.Home;

  return (
    <div className="flex h-12 items-center gap-3 px-4">
      {isHome ? (
        <Logo position={LogoPosition.Initial} isPlus={isPlus} />
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
        />
      )}
      {user && isHome && <QuestHeaderButton compact />}
      {user && isHome && <PlusSquare />}
      {user && root === ShellRoot.Activity && (
        <Link href={`${webappUrl}notifications/settings`} passHref>
          <ShellSquare tag="a" aria-label="Notification settings">
            <SettingsIcon size={IconSize.Small} />
          </ShellSquare>
        </Link>
      )}
      <div ref={setActionsSlot} className="contents" />
      <AvatarSquare />
    </div>
  );
};

const PageRow = ({
  title,
  onBack,
}: {
  title?: ReactNode;
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
        <h1 className="min-w-0 flex-1 truncate px-1 font-bold typo-title3">
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
        {isMobileAppHeader && <MobileAppActions />}
      </div>
    </div>
  );
};

export interface ShellBlockProps {
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
  const { p } = useShellScroll();
  const online = useOnline();
  const ref = useRef<HTMLElement>(null);
  const hidden = !config?.hidden && p >= 0.99;

  useClientLayoutEffect(() => {
    const element = ref.current;
    const publish = () => {
      document.documentElement.style.setProperty(
        '--shell-top',
        `${element?.offsetHeight ?? 0}px`,
      );
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
  }, [root, row, config?.hidden, config?.row, online]);

  // Once the block is gone the status area turns into a soft scroll edge
  // (safeArea.css paints it solid while the block stands under it).
  useEffect(() => {
    document.documentElement.classList.toggle('shell-edge', hidden);
    return () => document.documentElement.classList.remove('shell-edge');
  }, [hidden]);

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
        'fixed inset-x-0 z-header flex flex-col bg-background-default tablet:hidden',
        hidden && 'pointer-events-none',
      )}
      style={{
        top: 'calc(var(--safe-area-top, 0px) + var(--phone-top-ad-height, 0px))',
        transform: `translateY(calc((-100% - var(--safe-area-top, 0px)) * ${p}))`,
        transition: `transform ${motion.snap}ms ${motion.interaction}`,
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
        <RootRow root={root} />
      ) : (
        <PageRow title={config?.title} onBack={config?.onBack} />
      )}
      {config?.row ?? row}
    </header>
  );
}

export default ShellBlock;

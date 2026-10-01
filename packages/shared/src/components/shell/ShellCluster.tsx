import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import Link from '../utilities/Link';
import { useAuthContext } from '../../contexts/AuthContext';
import { useNotificationContext } from '../../contexts/NotificationsContext';
import { useLogContext } from '../../contexts/LogContext';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import { BellIcon, CompassIcon, HomeIcon, PlusIcon, SquadIcon } from '../icons';
import { IconSize } from '../Icon';
import { Bubble } from '../tooltips/utils';
import { railCountBubbleClass } from '../sidebar/common';
import { getUnreadText } from '../notifications/utils';
import { squadCategoriesPaths } from '../../lib/constants';
import { LogEvent, NotificationTarget, TargetId } from '../../lib/log';
import { AuthTriggers } from '../../lib/auth';
import type { AuthTriggersType } from '../../lib/auth';
import { cluster, lerp, motion } from './constants';
import { revealShell, useShellScroll } from './useShellScroll';
import { ShellRoot, owningRoot } from './shellNav';

interface ClusterTab {
  root: ShellRoot;
  label: string;
  href: string;
  Icon: typeof HomeIcon;
  requiresLogin?: boolean;
  trigger?: AuthTriggersType;
}

export function ShellCluster({
  className,
}: {
  className?: string;
}): ReactElement {
  const router = useRouter();
  const { user, squads, showLogin } = useAuthContext();
  const { unreadCount } = useNotificationContext();
  const { logEvent } = useLogContext();
  const { openModal } = useLazyModal();
  const { p, snapping } = useShellScroll();
  const active = owningRoot(router?.pathname ?? '');
  const hasSquads = (squads?.length ?? 0) > 0;

  const tabs: ClusterTab[] = [
    {
      root: ShellRoot.Home,
      label: 'Home',
      href: '/',
      Icon: HomeIcon,
      requiresLogin: true,
      trigger: AuthTriggers.MainButton,
    },
    {
      root: ShellRoot.Explore,
      label: 'Explore',
      href: '/posts',
      Icon: CompassIcon,
    },
    {
      root: ShellRoot.Squads,
      label: 'Squads',
      href: hasSquads
        ? squadCategoriesPaths['My Squads']
        : squadCategoriesPaths.discover,
      Icon: SquadIcon,
    },
    {
      root: ShellRoot.Activity,
      label: 'Activity',
      href: '/notifications',
      Icon: BellIcon,
      requiresLogin: true,
      trigger: AuthTriggers.FromNotification,
    },
  ];

  const height = lerp(cluster.rest, cluster.compact, p);
  const radius = lerp(cluster.radiusRest, cluster.radiusCompact, p);
  const transition = `height ${snapping ? motion.snap : motion.scrub}ms ${
    motion.interaction
  }, border-radius ${snapping ? motion.snap : motion.scrub}ms ${
    motion.interaction
  }, padding ${snapping ? motion.snap : motion.scrub}ms ${motion.interaction}`;

  const onTabClick = (tab: ClusterTab) => (event: React.MouseEvent) => {
    if (tab.root === ShellRoot.Activity) {
      logEvent({
        event_name: LogEvent.ClickNotificationIcon,
        target_id: NotificationTarget.Footer,
        extra: JSON.stringify({ notifications_number: unreadCount }),
      });
    } else {
      logEvent({
        event_name: LogEvent.Click,
        target_id: TargetId.MobileFooter,
        extra: JSON.stringify({ tab: tab.root }),
      });
    }

    if (!user && tab.requiresLogin) {
      event.preventDefault();
      showLogin({ trigger: tab.trigger ?? AuthTriggers.MainButton });
      return;
    }

    if (tab.root === active) {
      event.preventDefault();
      revealShell();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const onCreate = () => {
    if (!user) {
      showLogin({ trigger: AuthTriggers.CreateSquad });
      return;
    }

    openModal({ type: LazyModal.SmartComposer, props: {} });
  };

  return (
    <div
      className={classNames(
        'pointer-events-none fixed inset-x-0 z-3 flex items-end tablet:hidden',
        className,
      )}
      style={{
        bottom: `calc(env(safe-area-inset-bottom, 0px) + ${cluster.lift}px)`,
        paddingInline: lerp(cluster.inset, cluster.insetCompact, p),
        gap: cluster.gap,
        transition,
      }}
    >
      <nav
        aria-label="Main"
        className="shell-material pointer-events-auto flex min-w-0 flex-1 items-stretch"
        style={{
          height,
          borderRadius: radius,
          padding: cluster.padding,
          transition,
        }}
      >
        {tabs.map((tab) => {
          const isActive = tab.root === active;

          return (
            <Link key={tab.root} href={tab.href} passHref>
              <a
                aria-label={tab.label}
                aria-current={isActive ? 'page' : undefined}
                role="link"
                tabIndex={0}
                onClick={onTabClick(tab)}
                onKeyDown={(event) => {
                  if (event.key === ' ') {
                    event.preventDefault();
                    event.currentTarget.click();
                  }
                }}
                className="shell-press flex min-w-0 flex-1 items-center justify-center text-text-primary"
                style={{ borderRadius: radius - cluster.padding }}
              >
                <span className="relative flex">
                  {/* The rest dims the glyph only; the count bubble keeps its
                      full colour whether or not the tab is lit. */}
                  <span
                    className={classNames(
                      'flex',
                      !isActive && 'opacity-[0.72]',
                    )}
                  >
                    <tab.Icon size={IconSize.Large} secondary={isActive} />
                  </span>
                  {tab.root === ShellRoot.Activity && !!unreadCount && (
                    <Bubble className={railCountBubbleClass}>
                      {getUnreadText(unreadCount)}
                    </Bubble>
                  )}
                </span>
              </a>
            </Link>
          );
        })}
      </nav>
      <button
        type="button"
        aria-label="Create post"
        onClick={onCreate}
        className="shell-material shell-press pointer-events-auto flex shrink-0 items-center justify-center text-text-primary"
        style={{ width: height, height, borderRadius: radius, transition }}
      >
        <PlusIcon size={IconSize.Large} />
      </button>
    </div>
  );
}

export default ShellCluster;

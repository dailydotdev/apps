import type { ReactElement } from 'react';
import React, { useRef, useState } from 'react';
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
import { clamp, cluster, lerp, motion } from './constants';
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
  const trackRef = useRef<HTMLDivElement>(null);
  const pointer = useRef<{ id: number; startX: number; moved: boolean } | null>(
    null,
  );
  const suppressClick = useRef(false);
  // While a finger holds and moves along the bar the indicator follows it;
  // `index` is the tab under the finger, `left` the indicator's offset.
  const [drag, setDrag] = useState<{ left: number; index: number } | null>(
    null,
  );

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

  const logTab = (tab: ClusterTab) => {
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
  };

  const onTabClick = (tab: ClusterTab) => (event: React.MouseEvent) => {
    logTab(tab);

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

  const activeIndex = tabs.findIndex((tab) => tab.root === active);

  const tabAt = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || !rect.width) {
      return null;
    }
    const width = rect.width / tabs.length;
    const x = clientX - rect.left;
    return {
      left: Math.min(Math.max(x - width / 2, 0), rect.width - width),
      index: Math.min(
        tabs.length - 1,
        Math.floor(clamp(x / rect.width) * tabs.length),
      ),
    };
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }
    pointer.current = {
      id: event.pointerId,
      startX: event.clientX,
      moved: false,
    };
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const { current } = pointer;
    if (!current || current.id !== event.pointerId) {
      return;
    }
    if (!current.moved) {
      if (Math.abs(event.clientX - current.startX) < cluster.dragStart) {
        return;
      }
      current.moved = true;
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        // jsdom and older WebViews have no pointer capture; the bar still
        // tracks the finger while it stays over it.
      }
    }
    const next = tabAt(event.clientX);
    if (next) {
      setDrag(next);
    }
  };

  const endDrag = () => {
    pointer.current = null;
    setDrag(null);
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const { current } = pointer;
    if (!current || current.id !== event.pointerId) {
      return;
    }
    const { moved } = current;
    const target = tabAt(event.clientX);
    endDrag();
    if (!moved || !target) {
      return;
    }
    // The browser fires a click for the release; the drag already chose.
    suppressClick.current = true;
    const tab = tabs[target.index];
    if (tab.root === active) {
      return;
    }
    logTab(tab);
    if (!user && tab.requiresLogin) {
      showLogin({ trigger: tab.trigger ?? AuthTriggers.MainButton });
      return;
    }
    router.push(tab.href);
  };

  const onClickCapture = (event: React.MouseEvent) => {
    if (suppressClick.current) {
      suppressClick.current = false;
      event.preventDefault();
      event.stopPropagation();
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
        <div
          ref={trackRef}
          className="relative flex min-w-0 flex-1 touch-none items-stretch"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={endDrag}
          onClickCapture={onClickCapture}
        >
          {/* The selected tab's pill: behind the lit tab at rest, under the
              finger while it is held and moved along the bar. */}
          {activeIndex >= 0 && (
            <span
              aria-hidden
              data-testid="shell-cluster-indicator"
              className="pointer-events-none absolute inset-y-0 left-0 bg-surface-float motion-reduce:transition-none"
              style={{
                width: `${100 / tabs.length}%`,
                borderRadius: radius - cluster.padding,
                transform: drag
                  ? `translateX(${drag.left}px)`
                  : `translateX(${activeIndex * 100}%)`,
                transition: drag
                  ? 'none'
                  : `transform ${motion.snap}ms ${motion.travel}, border-radius ${motion.snap}ms ${motion.interaction}`,
              }}
            />
          )}
          {tabs.map((tab, index) => {
            const isActive = tab.root === active;
            const isLit = drag ? drag.index === index : isActive;

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
                  className="shell-press relative flex min-w-0 flex-1 items-center justify-center text-text-primary"
                  style={{ borderRadius: radius - cluster.padding }}
                >
                  <span className="relative flex">
                    {/* The rest dims the glyph only; the count bubble keeps its
                      full colour whether or not the tab is lit. */}
                    <span
                      className={classNames('flex', !isLit && 'opacity-[0.72]')}
                    >
                      <tab.Icon size={IconSize.Large} secondary={isLit} />
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
        </div>
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

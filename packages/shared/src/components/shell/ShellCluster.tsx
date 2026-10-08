import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { useQueryClient } from '@tanstack/react-query';
import Link from '../utilities/Link';
import { useAuthContext } from '../../contexts/AuthContext';
import { useNotificationContext } from '../../contexts/NotificationsContext';
import { useLogContext } from '../../contexts/LogContext';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import { BellIcon, SearchIcon, HomeIcon, PlusIcon, SourceIcon } from '../icons';
import { IconSize } from '../Icon';
import { Bubble } from '../tooltips/utils';
import { railCountBubbleClass } from '../sidebar/common';
import { getUnreadText } from '../notifications/utils';
import { squadCategoriesPaths } from '../../lib/constants';
import { LogEvent, NotificationTarget, TargetId } from '../../lib/log';
import { AuthTriggers } from '../../lib/auth';
import type { AuthTriggersType } from '../../lib/auth';
import { clamp, cluster, field, lerp, motion, settle } from './constants';
import { useShellField } from './shellFieldStore';
import { refreshShell } from './shellRefresh';
import { revealShell, useShellScroll } from './useShellScroll';
import { hidesCluster, isRootView, ShellRoot, owningRoot } from './shellNav';
import { ShellTopButton } from './ShellTopButton';

interface ClusterTab {
  root: ShellRoot;
  label: string;
  href: string;
  Icon: typeof HomeIcon;
  requiresLogin?: boolean;
  trigger?: AuthTriggersType;
}

export function ShellCluster(): ReactElement | null {
  const router = useRouter();
  const queryClient = useQueryClient();
  const hidden = hidesCluster(router?.pathname);
  const { user, squads, showLogin } = useAuthContext();
  const { unreadCount } = useNotificationContext();
  const { logEvent } = useLogContext();
  const { openModal } = useLazyModal();
  const { p } = useShellScroll();
  const shellField = useShellField();
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
  // A finger on the bar lifts the whole bar a touch (scale 1.04) for as
  // long as it stays down, the way Instagram's and iOS 26's bars do.
  const [pressed, setPressed] = useState(false);
  // The glass feel of a held bar: the pill is a lens that lifts, follows
  // the finger on a stiff spring and squashes along its motion; the whole
  // bar leans past its ends when the finger overshoots. The lens is driven
  // frame by frame on the element, outside React.
  const [pull, setPull] = useState(0);
  const pillRef = useRef<HTMLSpanElement>(null);
  const lens = useRef<{
    target: number;
    pos: number;
    vel: number;
    frame: number;
    last: number;
  } | null>(null);

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
      Icon: SearchIcon,
    },
    {
      root: ShellRoot.Squads,
      label: 'Squads',
      href: hasSquads
        ? squadCategoriesPaths['My Squads']
        : squadCategoriesPaths.discover,
      Icon: SourceIcon,
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

  // The space the bar takes at rest, for content that must clear it. The
  // bar sits above the home indicator, so the inset is part of that space.
  useEffect(() => {
    if (hidden) {
      return undefined;
    }
    document.documentElement.style.setProperty(
      '--shell-bottom',
      `${
        cluster.rest +
        cluster.floor +
        cluster.lift +
        (shellField.mounted ? field.rest + field.gap : 0)
      }px`,
    );
    return () => {
      document.documentElement.style.removeProperty('--shell-bottom');
    };
  }, [hidden, shellField.mounted]);

  const height = lerp(cluster.rest, cluster.compact, p);
  const radius = lerp(cluster.radiusRest, cluster.radiusCompact, p);
  const inset = lerp(cluster.inset, cluster.insetCompact, p);
  const showsTopButton =
    active === ShellRoot.Home &&
    isRootView(ShellRoot.Home, router?.pathname ?? '');
  const transition = `height ${motion.snap}ms ${motion.interaction}, border-radius ${motion.snap}ms ${motion.interaction}, padding ${motion.snap}ms ${motion.interaction}`;
  // A page with a search field gives the field the bar's slot once the
  // reader scrolls, and the whole of the bottom while the keyboard is up.
  const yieldsToField = shellField.focused || (shellField.mounted && p === 1);
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.inert = yieldsToField;
    }
  }, [yieldsToField]);

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
        target_id: TargetId.MobileFooterNav,
        extra: JSON.stringify({ tab: tab.root, logged_in: !!user }),
      });
    }
  };

  // What a tab does when chosen; the link's own navigation covers the
  // remaining case (a mouse click on another root).
  const activate = (tab: ClusterTab): boolean => {
    logTab(tab);

    if (!user && tab.requiresLogin) {
      showLogin({ trigger: tab.trigger ?? AuthTriggers.MainButton });
      return true;
    }

    // The lit tab, as on X and Instagram: from a leaf it returns to the
    // root; on the root it scrolls to the top; at the top it refreshes.
    if (tab.root === active) {
      if (!isRootView(tab.root, router.pathname)) {
        router.push(tab.href);
        return true;
      }
      revealShell();
      if (window.scrollY > 0) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        refreshShell(queryClient);
      }
      return true;
    }

    return false;
  };

  const onTabClick = (tab: ClusterTab) => (event: React.MouseEvent) => {
    if (activate(tab)) {
      event.preventDefault();
    }
  };

  // iOS Safari turns a finger held on a link into a URL preview and cancels
  // the pointer, so the bar owns its touches: nothing native starts from
  // them, and a touch tap is resolved on release like a drag is.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) {
      return undefined;
    }
    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 1) {
        event.preventDefault();
      }
    };
    track.addEventListener('touchstart', onTouchStart, { passive: false });
    return () => track.removeEventListener('touchstart', onTouchStart);
  }, []);

  const activeIndex = tabs.findIndex((tab) => tab.root === active);

  // The finger is measured on screen while the bar is lifted (scaled), but
  // the pill moves in the bar's own, unscaled pixels: map through the
  // layout width so the pill stops at the right edge as it does at the left.
  const tabAt = (clientX: number) => {
    const track = trackRef.current;
    const rect = track?.getBoundingClientRect();
    if (!track || !rect || !rect.width) {
      return null;
    }
    const trackWidth = track.offsetWidth || rect.width;
    const width = trackWidth / tabs.length;
    const x = ((clientX - rect.left) / rect.width) * trackWidth;
    return {
      left: Math.min(Math.max(x - width / 2, 0), trackWidth - width),
      index: Math.min(
        tabs.length - 1,
        Math.floor(clamp(x / trackWidth) * tabs.length),
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
    setPressed(true);
  };

  const stopLens = () => {
    if (lens.current) {
      cancelAnimationFrame(lens.current.frame);
      lens.current = null;
    }
  };

  // One spring step per frame: position chases the finger, the squash
  // follows the speed, and the lens stays lifted while held.
  const stepLens = (now: number) => {
    const state = lens.current;
    const pill = pillRef.current;
    if (!state || !pill) {
      return;
    }
    const dt = Math.min(32, now - state.last) / 1000;
    state.last = now;
    const { stiffness, damping } = cluster.spring;
    const acceleration =
      (state.target - state.pos) * stiffness - state.vel * damping;
    state.vel += acceleration * dt;
    state.pos += state.vel * dt;
    const squash = Math.min(
      Math.abs(state.vel) * (cluster.squashPerPxPerMs / 1000),
      cluster.squashMax,
    );
    pill.style.transition = 'none';
    pill.style.transform = `translateX(${state.pos}px) scale(${
      cluster.lensScale
    }) scaleX(${1 + squash}) scaleY(${1 / (1 + squash)})`;
    state.frame = requestAnimationFrame(stepLens);
  };

  const moveLens = (target: number) => {
    if (!lens.current) {
      const pill = pillRef.current;
      const start =
        pill && typeof DOMMatrixReadOnly !== 'undefined'
          ? new DOMMatrixReadOnly(getComputedStyle(pill).transform).e
          : target;
      lens.current = {
        target,
        pos: start,
        vel: 0,
        frame: 0,
        last: performance.now(),
      };
      lens.current.frame = requestAnimationFrame(stepLens);
    }
    lens.current.target = target;
  };

  // The lens lets go: it settles onto the chosen tab on the light spring.
  const settleLens = (index: number) => {
    stopLens();
    const pill = pillRef.current;
    const track = trackRef.current;
    if (!pill || !track) {
      return;
    }
    const width = track.offsetWidth / tabs.length;
    pill.style.transition = `transform ${settle.duration}ms ${settle.easing}`;
    pill.style.transform = `translateX(${index * width}px)`;
    const clear = () => {
      pill.style.transition = '';
      pill.style.transform = '';
      pill.removeEventListener('transitionend', clear);
    };
    pill.addEventListener('transitionend', clear);
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
      moveLens(next.left);
    }
    const rect = trackRef.current?.getBoundingClientRect();
    if (rect) {
      const over =
        event.clientX < rect.left
          ? event.clientX - rect.left
          : Math.max(0, event.clientX - rect.right);
      setPull(
        Math.max(
          -cluster.pullMax,
          Math.min(cluster.pullMax, over * cluster.pullRate),
        ),
      );
    }
  };

  const endDrag = (settleOn?: number) => {
    if (lens.current && settleOn !== undefined) {
      settleLens(settleOn);
    } else {
      stopLens();
    }
    pointer.current = null;
    setDrag(null);
    setPressed(false);
    setPull(0);
  };

  // A finger that lifts away from the bar (capture refused, or the release
  // lands outside) still ends the press, so the bar never stays lifted.
  useEffect(() => {
    if (!pressed) {
      return undefined;
    }
    const end = () => endDrag(activeIndex);
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
    return () => {
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
    };
    // endDrag only touches refs and setters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pressed]);

  // Without capture (a plain press that never moved) the finger can leave
  // the bar; the lift ends with it.
  const onPointerLeave = () => {
    if (pointer.current && !pointer.current.moved) {
      endDrag();
    }
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const { current } = pointer;
    if (!current || current.id !== event.pointerId) {
      return;
    }
    const { moved } = current;
    const target = tabAt(event.clientX);
    // A finger that lifts away from the bar, above or below it, cancels, as
    // the iOS tab bar does.
    const rect = trackRef.current?.getBoundingClientRect();
    const away =
      !!rect &&
      (event.clientY < rect.top - cluster.cancelDistance ||
        event.clientY > rect.bottom + cluster.cancelDistance);
    endDrag(away || !target ? activeIndex : target.index);
    if (!target || away || (!moved && event.pointerType !== 'touch')) {
      return;
    }
    // A click may still follow the release; the pointer already chose.
    suppressClick.current = true;
    window.setTimeout(() => {
      suppressClick.current = false;
    }, motion.snap);
    const tab = tabs[target.index];
    if (!activate(tab)) {
      router.push(tab.href);
    }
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
      showLogin({ trigger: AuthTriggers.CreatePost });
      return;
    }

    openModal({ type: LazyModal.SmartComposer, props: {} });
  };

  if (hidden) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-3 flex items-end motion-reduce:!transition-none tablet:hidden"
      ref={containerRef}
      style={{
        bottom: cluster.floor,
        paddingInline: inset,
        gap: cluster.gap,
        transform: yieldsToField
          ? `translateY(calc(100% + ${cluster.rest + cluster.lift}px))`
          : undefined,
        transition: `${transition}, transform ${motion.snap}ms ${motion.interaction}`,
      }}
    >
      <nav
        aria-label="Main"
        data-pressed={pressed || undefined}
        className="shell-material pointer-events-auto relative z-1 flex min-w-0 flex-1 items-stretch motion-reduce:!transform-none"
        style={{
          height,
          borderRadius: radius,
          padding: cluster.padding,
          transform: pressed
            ? `translateX(${pull}px) scale(${cluster.pressScale})`
            : 'scale(1)',
          transformOrigin: '50% 100%',
          transition: `${transition}, transform ${
            pressed ? motion.feedback : settle.duration
          }ms ${pressed ? 'ease-out' : settle.easing}`,
        }}
      >
        <div
          ref={trackRef}
          className="shell-drag relative flex min-w-0 flex-1 touch-none items-stretch"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={() => endDrag(activeIndex)}
          onPointerLeave={onPointerLeave}
          onClickCapture={onClickCapture}
          onContextMenu={(event) => event.preventDefault()}
        >
          {/* The selected tab's pill: behind the lit tab at rest, under the
              finger while it is held and moved along the bar. */}
          {activeIndex >= 0 && (
            <span
              ref={pillRef}
              aria-hidden
              data-testid="shell-cluster-indicator"
              className="pointer-events-none absolute inset-y-0 left-0 bg-surface-float motion-reduce:transition-none"
              style={{
                width: `${100 / tabs.length}%`,
                borderRadius: radius - cluster.padding,
                transform: `translateX(${activeIndex * 100}%)`,
                transition: `transform ${motion.snap}ms ${motion.interaction}, border-radius ${motion.snap}ms ${motion.interaction}`,
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
                  className="relative flex min-w-0 flex-1 items-center justify-center text-text-primary"
                  style={{ borderRadius: radius - cluster.padding }}
                >
                  <span className="relative flex">
                    {/* The rest take the secondary grey on the glyph only; the
                      count bubble keeps its colour whether or not the tab is
                      lit. */}
                    <span
                      className={classNames(
                        'flex',
                        !isLit && 'text-text-secondary',
                      )}
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
      {showsTopButton && <ShellTopButton />}
      <button
        type="button"
        aria-label="Create post"
        onClick={onCreate}
        className="shell-material shell-material-action shell-press pointer-events-auto flex shrink-0 items-center justify-center text-text-primary"
        style={{ width: height, height, borderRadius: radius, transition }}
      >
        <PlusIcon size={IconSize.Large} />
      </button>
    </div>
  );
}

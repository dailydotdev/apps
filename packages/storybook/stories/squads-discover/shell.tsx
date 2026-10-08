import type { ReactElement, ReactNode } from 'react';
import React, {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
// @ts-expect-error react-dom ships no types in this package
import { createRoot } from 'react-dom/client';
import classNames from 'classnames';
import {
  AiIcon,
  ArrowIcon,
  BellIcon,
  CompassIcon,
  HomeIcon,
  HotIcon,
  MegaphoneIcon,
  PlusIcon,
  SearchIcon,
  SourceIcon,
  SquadIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';
import {
  RAIL_ICON_SIZE,
  railGlyphBoxClass,
  railTabClass,
  railTabLabelClass,
} from '@dailydotdev/shared/src/components/sidebar/common';
import { SpotlightContext } from '@dailydotdev/shared/src/components/spotlight/SpotlightContext';
import ExtensionProviders from '../extension/_providers';
import type { PreviewState } from './kit';
import { DiscoverStyles, JoinProvider, JoinToastHost } from './kit';

/* ---------------------------------------------------------------- device */

/** Fired on a frame's window whenever the page in it changes its URL. */
export const NAVIGATE_EVENT = 'sd-navigate';
/** Sent to a frame's window by the address bar: -1 is back, 1 forward. */
export const STEP_EVENT = 'sd-step';

export interface NavigateDetail {
  canBack: boolean;
  canForward: boolean;
}

/**
 * A browser's address row above a desktop frame, showing the URL the page
 * in it sets, with back/forward through that page's own history.
 */
const AddressBar = ({
  frame,
}: {
  frame: React.RefObject<HTMLIFrameElement>;
}): ReactElement => {
  const [path, setPath] = useState('');
  const [nav, setNav] = useState<NavigateDetail>({
    canBack: false,
    canForward: false,
  });
  useEffect(() => {
    const win = frame.current?.contentWindow;
    if (!win) {
      return undefined;
    }
    const sync = (event: Event) => {
      setPath(win.location.pathname);
      setNav((event as CustomEvent<NavigateDetail>).detail);
    };
    win.addEventListener(NAVIGATE_EVENT, sync);
    return () => win.removeEventListener(NAVIGATE_EVENT, sync);
  }, [frame]);
  const step = (delta: number) =>
    frame.current?.contentWindow?.dispatchEvent(
      new CustomEvent(STEP_EVENT, { detail: delta }),
    );

  return (
    <div className="flex h-10 items-center gap-1 border-b border-border-subtlest-tertiary bg-background-subtle px-2">
      <Button
        type="button"
        aria-label="Back"
        variant={ButtonVariant.Tertiary}
        size={ButtonSize.XSmall}
        icon={<ArrowIcon className="-rotate-90" />}
        disabled={!nav.canBack}
        onClick={() => step(-1)}
      />
      <Button
        type="button"
        aria-label="Forward"
        variant={ButtonVariant.Tertiary}
        size={ButtonSize.XSmall}
        icon={<ArrowIcon className="rotate-90" />}
        disabled={!nav.canForward}
        onClick={() => step(1)}
      />
      <span className="ml-1 flex h-7 min-w-0 flex-1 items-center truncate rounded-8 bg-surface-float px-3 text-text-tertiary typo-footnote">
        daily.dev
        <span className="text-text-primary">{path}</span>
      </span>
    </div>
  );
};

/**
 * A device of its own width: a blank frame the page renders into, with
 * this document's styles and theme copied in. Its media queries see the
 * frame's width, so every layout below is one responsive component and the
 * phone and desktop frames show the same code at two real breakpoints.
 */
export const Device = ({
  width,
  height,
  label,
  note,
  children,
  fit = false,
  addressBar = false,
  joined,
  preview,
}: {
  width: number;
  height: number;
  label?: string;
  note?: ReactNode;
  children: ReactNode;
  /** Scale down to the available width, keeping the real viewport. */
  fit?: boolean;
  /** Show the frame's URL and back/forward above it. */
  addressBar?: boolean;
  /** Squads the reader starts in; the default is My Squads. */
  joined?: string[];
  /** A frozen state for the states catalog. */
  preview?: PreviewState;
}): ReactElement => {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<{
    render: (node: ReactNode) => void;
    unmount: () => void;
  } | null>(null);
  const [ready, setReady] = useState(false);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    if (!fit || !boxRef.current) {
      return undefined;
    }
    const element = boxRef.current;
    const observer = new ResizeObserver(() => {
      setScale(Math.min(1, element.clientWidth / width));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [fit, width]);

  useEffect(() => {
    const doc = frameRef.current?.contentDocument;
    if (!doc) {
      return undefined;
    }
    doc.open();
    doc.write('<!doctype html><html><head></head><body></body></html>');
    doc.close();
    doc.documentElement.className = document.documentElement.className;
    document.head
      .querySelectorAll('style, link[rel="stylesheet"]')
      .forEach((node) => doc.head.appendChild(node.cloneNode(true)));
    doc.body.style.margin = '0';
    const mount = doc.createElement('div');
    doc.body.appendChild(mount);
    rootRef.current = createRoot(mount);
    setReady(true);

    const theme = new MutationObserver(() => {
      doc.documentElement.className = document.documentElement.className;
    });
    theme.observe(document.documentElement, { attributes: true });

    return () => {
      theme.disconnect();
      const root = rootRef.current;
      rootRef.current = null;
      setTimeout(() => root?.unmount());
    };
  }, []);

  useEffect(() => {
    if (ready) {
      rootRef.current?.render(
        <ExtensionProviders>
          <DiscoverStyles />
          <JoinProvider initial={joined} preview={preview}>
            {children}
            <JoinToastHost />
          </JoinProvider>
        </ExtensionProviders>,
      );
    }
  }, [ready, children]);

  return (
    <div
      ref={boxRef}
      className={classNames('flex min-w-0 flex-col gap-2', !fit && 'shrink-0')}
    >
      {(label || note) && (
        <div className="flex items-baseline justify-between gap-4">
          {label && (
            <span className="font-bold text-text-tertiary typo-caption1">
              {label}
            </span>
          )}
          {note && (
            <span className="text-text-quaternary typo-caption1">{note}</span>
          )}
        </div>
      )}
      <div
        style={{ width: width * scale }}
        className="overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-default"
      >
        {addressBar && ready && <AddressBar frame={frameRef} />}
        <div style={{ height: height * scale }}>
          <iframe
            ref={frameRef}
            title={label ?? 'Device'}
            style={{
              width,
              height,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              border: 0,
              display: 'block',
            }}
          />
        </div>
      </div>
    </div>
  );
};

export const PHONE = { width: 375, height: 812 };
const DESKTOP = { width: 1440, height: 900 };

/** Desktop and phone, same component, the phone under the desktop. */
export const DevicePair = ({
  render,
  desktopNote,
  phoneNote,
  joined,
}: {
  render: () => ReactNode;
  desktopNote?: ReactNode;
  phoneNote?: ReactNode;
  joined?: string[];
}): ReactElement => (
  <div className="flex flex-col items-start gap-8">
    <div className="w-full min-w-0">
      <Device
        fit
        addressBar
        width={DESKTOP.width}
        height={DESKTOP.height}
        label="Desktop · 1440"
        note={desktopNote}
        joined={joined}
      >
        {render()}
      </Device>
    </div>
    <Device
      width={PHONE.width}
      height={PHONE.height}
      label="Phone · 375"
      note={phoneNote}
      joined={joined}
    >
      {render()}
    </Device>
  </div>
);

/* ----------------------------------------------------------------- rail */

const RailTab = ({
  label,
  icon,
  active = false,
}: {
  label: string;
  icon: (active: boolean) => ReactElement;
  active?: boolean;
}): ReactElement => (
  <button
    type="button"
    className={classNames(
      railTabClass,
      active && '!text-text-primary bg-background-default',
    )}
  >
    <span className={railGlyphBoxClass}>{icon(active)}</span>
    <span className={railTabLabelClass}>{label}</span>
  </button>
);

const railIconButton =
  'focus-outline flex size-10 items-center justify-center rounded-12 text-text-tertiary transition-[background-color,color,transform] duration-150 ease-out hover:bg-surface-hover hover:text-text-primary';

/**
 * The v2 rail, drawn from its own class recipes, with Squads selected. Its
 * search opens Spotlight unscoped, as production's rail does, wherever a
 * story provides one.
 */
const Rail = (): ReactElement => {
  const spotlight = useContext(SpotlightContext);
  return (
    <nav
      aria-label="Primary navigation"
      className="fixed inset-y-0 left-0 z-sidebar hidden w-20 flex-col items-center gap-0.5 px-1.5 pb-3 pt-[13px] laptop:flex"
    >
      <span className="mt-2.5 flex size-10 items-center justify-center rounded-12 text-text-primary">
        <span className={railGlyphBoxClass}>
          <LogoIcon className={{ container: 'h-[1.125rem] w-auto' }} />
        </span>
      </span>
      <span className={railIconButton}>
        <HomeIcon size={RAIL_ICON_SIZE} />
      </span>
      <button
        type="button"
        aria-label="Search"
        onClick={spotlight?.open}
        onMouseEnter={spotlight?.prefetch}
        className={railIconButton}
      >
        <SearchIcon size={RAIL_ICON_SIZE} aria-hidden />
      </button>
      <span className="my-3 h-px w-8 bg-border-subtlest-quaternary" />
      <RailTab
        label="Explore"
        icon={(active) => (
          <CompassIcon
            secondary={active}
            size={RAIL_ICON_SIZE}
            className="scale-105"
          />
        )}
      />
      <RailTab
        label="You"
        icon={() => (
          <img
            alt=""
            src="https://daily-now-res.cloudinary.com/image/upload/f_auto,q_auto/v1/placeholders/1"
            className="size-6 rounded-8 object-cover"
          />
        )}
      />
      <RailTab
        active
        label="Squads"
        icon={(active) => (
          <SquadIcon secondary={active} size={RAIL_ICON_SIZE} />
        )}
      />
      <RailTab
        label="Activity"
        icon={(active) => <BellIcon secondary={active} size={RAIL_ICON_SIZE} />}
      />
      <RailTab
        label="Streak"
        icon={(active) => <HotIcon secondary={active} size={RAIL_ICON_SIZE} />}
      />
      <Button
        type="button"
        aria-label="New post"
        variant={ButtonVariant.Primary}
        icon={<PlusIcon />}
        className="my-2 !size-9 !rounded-12 [&_svg]:!size-6"
      />
    </nav>
  );
};

/* ------------------------------------------------- phone: shell scroll */

/**
 * useShellScroll, read from the frame's own window: the block hides and
 * the bar compacts after 24px down, both return after 8px up, and the top
 * 96px always shows them.
 */
const useShellCompact = (ref: React.RefObject<HTMLElement>): boolean => {
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const view = ref.current?.ownerDocument.defaultView;
    if (!view) {
      return undefined;
    }
    let anchor = view.scrollY;
    let hidden = false;
    const onScroll = () => {
      const y = view.scrollY;
      if (y <= 96) {
        hidden = false;
        anchor = y;
      } else if (!hidden && y - anchor > 24) {
        hidden = true;
        anchor = y;
      } else if (hidden && anchor - y > 8) {
        hidden = false;
        anchor = y;
      } else if ((hidden && y > anchor) || (!hidden && y < anchor)) {
        anchor = y;
      }
      setCompact(hidden);
    };
    view.addEventListener('scroll', onScroll, { passive: true });
    return () => view.removeEventListener('scroll', onScroll);
  }, [ref]);
  return compact;
};

const shellEase = '220ms cubic-bezier(0.2, 0, 0, 1)';

/* -------------------------------------------------- phone: shell block */

/** ShellSquare: the block's 38px glass buttons. */
export const ShellSquare = ({
  label,
  children,
  onClick,
}: {
  label: string;
  children: ReactNode;
  onClick?: () => void;
}): ReactElement => (
  <button
    type="button"
    aria-label={label}
    onClick={onClick}
    className="shell-material shell-press shell-hit relative flex size-[2.375rem] shrink-0 items-center justify-center rounded-14 text-text-primary"
  >
    {children}
  </button>
);

export interface ShellChip {
  id: string;
  label: string;
}

/**
 * Production's phone block (ShellBlock) on a Squads root: the title row
 * (title, the page's actions, your avatar; Log in and Open app when
 * logged out) over a row of chips, hiding as you scroll down. A spacer of
 * its resting height (5.75rem) keeps the page clear of it.
 */
export const PhoneBlock = ({
  title,
  actions,
  chips,
  active,
  onChange,
  loggedOut = false,
}: {
  title: string;
  actions?: ReactNode;
  chips: ShellChip[];
  active: string;
  onChange: (id: string) => void;
  loggedOut?: boolean;
}): ReactElement => {
  const ref = useRef<HTMLElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const hidden = useShellCompact(ref);

  // ShellRow keeps the lit chip in view.
  useEffect(() => {
    const lit = rowRef.current?.querySelector<HTMLElement>('[aria-current]');
    lit?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [active]);

  return (
    <>
      <header
        ref={ref}
        className="fixed inset-x-0 top-0 z-header flex flex-col bg-background-default tablet:hidden"
        style={{
          transform: `translateY(${hidden ? '-100%' : '0'})`,
          transition: `transform ${shellEase}`,
        }}
      >
        <div className="flex h-12 items-center gap-3 px-4">
          <h1 className="min-w-0 flex-1 truncate font-bold typo-title3">
            {title}
          </h1>
          {loggedOut ? (
            <span className="flex flex-row items-center gap-2">
              <Button
                type="button"
                variant={ButtonVariant.Tertiary}
                size={ButtonSize.Small}
              >
                Log in
              </Button>
              <Button
                type="button"
                variant={ButtonVariant.Primary}
                size={ButtonSize.Small}
              >
                Open app
              </Button>
            </span>
          ) : (
            <>
              {actions}
              <span className="shell-material shell-press shell-hit relative flex size-[2.375rem] shrink-0 items-center justify-center overflow-hidden rounded-14">
                <img
                  alt="Your profile"
                  src="https://daily-now-res.cloudinary.com/image/upload/f_auto,q_auto/v1/placeholders/1"
                  className="size-full object-cover"
                />
              </span>
            </>
          )}
        </div>
        <div
          ref={rowRef}
          className="no-scrollbar flex h-11 w-full items-center gap-1 overflow-x-auto px-4"
        >
          {chips.map((chip) => {
            const isActive = chip.id === active;
            return (
              <button
                key={chip.id}
                type="button"
                aria-current={isActive ? 'page' : undefined}
                onClick={() => onChange(chip.id)}
                className={classNames(
                  'shell-press flex h-7 shrink-0 items-center gap-1 rounded-8 border px-2 font-bold typo-footnote',
                  isActive
                    ? 'border-text-primary bg-text-primary text-surface-invert'
                    : 'border-border-subtlest-tertiary text-text-secondary',
                )}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </header>
      <div aria-hidden className="h-[5.75rem] shrink-0 tablet:hidden" />
    </>
  );
};

/**
 * The phone block on a page that is not a root (ShellBlock's PageRow): a
 * back square and the page title, 52px tall, hiding as you scroll down.
 */
export const PhonePageBlock = ({
  title,
  onBack,
}: {
  title: string;
  onBack: () => void;
}): ReactElement => {
  const ref = useRef<HTMLElement>(null);
  const hidden = useShellCompact(ref);
  return (
    <>
      <header
        ref={ref}
        className="fixed inset-x-0 top-0 z-header flex flex-col bg-background-default tablet:hidden"
        style={{
          transform: `translateY(${hidden ? '-100%' : '0'})`,
          transition: `transform ${shellEase}`,
        }}
      >
        <div className="flex h-[3.25rem] items-center gap-2 px-4">
          <ShellSquare label="Go back" onClick={onBack}>
            <ArrowIcon size={IconSize.Small} className="-rotate-90" />
          </ShellSquare>
          <h1 className="min-w-0 flex-1 truncate px-1 font-bold typo-callout">
            {title}
          </h1>
        </div>
      </header>
      <div aria-hidden className="h-[3.25rem] shrink-0 tablet:hidden" />
    </>
  );
};

/* ------------------------------------------------ phone: shell cluster */

const clusterTabs = [
  { label: 'Home', Icon: HomeIcon },
  { label: 'Explore', Icon: SearchIcon },
  { label: 'Squads', Icon: SourceIcon },
  { label: 'Activity', Icon: BellIcon },
];

/**
 * Production's ShellCluster with Squads lit: four icon tabs in a glass bar
 * with the lit tab's pill, the Create square beside it, floating 8px over
 * the bottom edge. It compacts (56 to 44px, inset 20 to 40px) as you
 * scroll down.
 */
const PhoneCluster = (): ReactElement => {
  const ref = useRef<HTMLDivElement>(null);
  const compact = useShellCompact(ref);
  const height = compact ? 44 : 56;
  const radius = compact ? 18 : 22;
  const transition = `height ${shellEase}, border-radius ${shellEase}, padding ${shellEase}, width ${shellEase}`;
  const active = 2;

  return (
    <div
      ref={ref}
      className="pointer-events-none fixed inset-x-0 z-3 flex flex-col gap-2 tablet:hidden"
      style={{
        bottom: 8,
        paddingInline: compact ? 40 : 20,
        transition: `padding ${shellEase}`,
      }}
    >
      <div className="flex items-end gap-2">
        <nav
          aria-label="Main"
          className="shell-material pointer-events-auto relative z-1 flex min-w-0 flex-1 items-stretch"
          style={{ height, borderRadius: radius, padding: 4, transition }}
        >
          <div className="relative flex min-w-0 flex-1 items-stretch">
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 bg-surface-float"
              style={{
                width: `${100 / clusterTabs.length}%`,
                borderRadius: radius - 4,
                transform: `translateX(${active * 100}%)`,
              }}
            />
            {clusterTabs.map((tab, index) => {
              const lit = index === active;
              return (
                <span
                  key={tab.label}
                  aria-label={tab.label}
                  aria-current={lit ? 'page' : undefined}
                  className="relative flex min-w-0 flex-1 items-center justify-center text-text-primary"
                >
                  <span
                    className={classNames('flex', !lit && 'opacity-[0.72]')}
                  >
                    <tab.Icon size={IconSize.Large} secondary={lit} />
                  </span>
                </span>
              );
            })}
          </div>
        </nav>
        <button
          type="button"
          aria-label="Create post"
          className="shell-material shell-material-action shell-press pointer-events-auto flex shrink-0 items-center justify-center text-text-primary"
          style={{ width: height, height, borderRadius: radius, transition }}
        >
          <PlusIcon size={IconSize.Large} />
        </button>
      </div>
    </div>
  );
};

/* -------------------------------------------------------- tablet: rail */

const tabletTabs = [
  {
    label: 'Home',
    icon: (on: boolean) => <HomeIcon secondary={on} size={IconSize.Medium} />,
  },
  {
    label: 'Explore',
    icon: (on: boolean) => <AiIcon secondary={on} size={IconSize.Medium} />,
  },
  {
    label: 'Headlines',
    icon: (on: boolean) => (
      <MegaphoneIcon secondary={on} size={IconSize.Medium} />
    ),
  },
  {
    label: 'Activity',
    icon: (on: boolean) => <BellIcon secondary={on} size={IconSize.Medium} />,
  },
  {
    label: 'Squads',
    icon: (on: boolean) => <SourceIcon secondary={on} size={IconSize.Medium} />,
  },
];

/** SidebarTablet: the 64px icon rail between phone and laptop, Squads on. */
const TabletRail = (): ReactElement => (
  <aside className="fixed left-0 top-0 z-sidebar hidden h-full w-16 flex-col items-center gap-4 border-r border-border-subtlest-tertiary bg-background-default tablet:flex laptop:hidden">
    <span className="flex h-10 items-end pt-4">
      <LogoIcon className={{ container: 'h-6 w-auto' }} />
    </span>
    {tabletTabs.map((tab) => {
      const on = tab.label === 'Squads';
      return (
        <Button
          key={tab.label}
          type="button"
          variant={ButtonVariant.Option}
          size={ButtonSize.Large}
          icon={tab.icon(on)}
          iconPosition={ButtonIconPosition.Top}
          pressed={on}
          className="w-full !bg-transparent typo-caption1 active:bg-transparent aria-pressed:bg-transparent"
        >
          {tab.label}
        </Button>
      );
    })}
  </aside>
);

/* ----------------------------------------------------------------- shell */

/**
 * The logged-in app around the page: the v2 rail and floating card from
 * laptop, SidebarTablet's rail on tablets, and production's phone shell
 * (the page's PhoneBlock at the top, ShellCluster at the bottom) on
 * phones.
 */
export const AppShell = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => (
  <div className="min-h-screen bg-background-default text-text-primary antialiased laptop:bg-[color-mix(in_srgb,var(--theme-surface-secondary)_3%,var(--theme-background-default))]">
    <Rail />
    <TabletRail />
    <main className="flex flex-col pb-28 tablet:pb-0 tablet:pl-16 laptop:pl-20">
      <div className="flex min-h-0 flex-1 flex-col laptop:my-3 laptop:ml-1 laptop:mr-3">
        <div className="relative flex min-h-0 flex-1 flex-col laptop:min-h-[calc(100vh-1.5rem)] laptop:overflow-clip laptop:rounded-24 laptop:border laptop:border-border-subtlest-quaternary laptop:bg-background-default laptop:p-0.5">
          {children}
        </div>
      </div>
    </main>
    <PhoneCluster />
  </div>
);

/** The v2 page-header strip (pageHeaderClassName), sticky on laptop. */
export const PageHeaderStrip = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}): ReactElement => (
  <header
    className={classNames(
      'flex min-h-14 w-full items-center gap-2 border-b border-border-subtlest-quaternary px-4 py-3 laptop:px-6',
      className,
    )}
  >
    {children}
  </header>
);

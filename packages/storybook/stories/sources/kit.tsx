import type { ReactElement, ReactNode } from 'react';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  BellIcon,
  BlockIcon,
  BookmarkIcon,
  CompassIcon,
  EyeIcon,
  HomeIcon,
  HotIcon,
  LinkIcon,
  MenuIcon,
  MiniCloseIcon,
  PlusIcon,
  SearchIcon,
  SquadIcon,
  VIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { Image } from '@dailydotdev/shared/src/components/image/Image';
import {
  NotifContainer,
  NotifMessage,
} from '@dailydotdev/shared/src/components/notifications/utils';
import { pageHeaderClassName } from '@dailydotdev/shared/src/components/layout/PageHeader';
import {
  RAIL_ICON_SIZE,
  railGlyphBoxClass,
  railTabClass,
  railTabLabelClass,
} from '@dailydotdev/shared/src/components/sidebar/common';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';
import { largeNumberFormat } from '@dailydotdev/shared/src/lib/numberFormat';
import type { Source } from './data';
import { DATA_DATE, viewer } from './data';

// The vocabulary every layout is built from: production atoms (Button,
// Image, the toast container, the rail recipes)
// composed into source rows and cards. Every frame owns its own follow
// state, so following, blocking and Undo work per layout.

export const sourcesCss = `
.sx-nums { font-variant-numeric: tabular-nums; }
@keyframes sxIn {
  from { opacity: 0; transform: translateY(0.5rem); }
  to { opacity: 1; transform: none; }
}
.sx-in { animation: sxIn 240ms cubic-bezier(0.16, 1, 0.3, 1) both; }
.sx-scroll { scrollbar-width: thin; }
.sx-rail { scrollbar-width: none; scroll-snap-type: x mandatory; }
.sx-rail::-webkit-scrollbar { display: none; }
.sx-rail > * { scroll-snap-align: start; }
.sx-row .sx-hover { opacity: 0; transition: opacity 120ms ease-out; }
.sx-row:hover .sx-hover, .sx-row:focus-within .sx-hover { opacity: 1; }
.sx-force-hover .sx-hover { opacity: 1; }
`;

export const SourcesStyles = (): ReactElement => (
  <style dangerouslySetInnerHTML={{ __html: sourcesCss }} />
);

/* ---------------------------------------------------------------- state */

interface Toast {
  id: number;
  message: string;
  undo?: () => void;
}

interface SourcesState {
  loggedIn: boolean;
  following: Set<string>;
  blocked: Set<string>;
  isFollowing: (id: string) => boolean;
  follow: (source: Source) => void;
  /** Squads joined and developers followed, keyed `squad:<id>`/`user:<id>`. */
  members: Set<string>;
  addMember: (key: string, name: string, kind: 'squad' | 'user') => void;
  block: (source: Source) => void;
  unblock: (source: Source) => void;
  /**
   * A press that leaves the sources pages (a post, a tag, a Squad, the
   * rail): the mockup can't draw it, so a toast names where it goes.
   */
  goTo: (path: string) => void;
  copyLink: () => void;
  suggest: () => void;
  toast: Toast | null;
  dismissToast: () => void;
  /** Signed out, an action asks to sign up first: what it was ("join DevOps"). */
  authPrompt: string | null;
  dismissAuthPrompt: () => void;
}

const SourcesContext = createContext<SourcesState | null>(null);

export const useSources = (): SourcesState => {
  const state = useContext(SourcesContext);
  if (!state) {
    throw new Error('useSources needs a SourcesProvider');
  }
  return state;
};

/**
 * One frame's follow state. The props freeze a starting point for the
 * states catalog: signed out, already following, a toast or a sign-up
 * prompt on screen.
 */
export const SourcesProvider = ({
  children,
  loggedIn = true,
  following: initialFollowing,
  members: initialMembers,
  toast: initialToast,
  authPrompt: initialAuthPrompt = null,
}: {
  children: ReactNode;
  loggedIn?: boolean;
  following?: string[];
  members?: string[];
  toast?: { message: string; undo?: boolean };
  authPrompt?: string | null;
}): ReactElement => {
  const [following, setFollowing] = useState(
    () =>
      new Set<string>(initialFollowing ?? (loggedIn ? viewer.following : [])),
  );
  const [blocked, setBlocked] = useState(
    () => new Set<string>(loggedIn ? viewer.blocked : []),
  );
  const [members, setMembers] = useState(
    () => new Set<string>(initialMembers ?? []),
  );
  const [toast, setToast] = useState<Toast | null>(() =>
    initialToast
      ? {
          id: 0,
          message: initialToast.message,
          undo: initialToast.undo ? () => undefined : undefined,
        }
      : null,
  );
  const [authPrompt, setAuthPrompt] = useState<string | null>(
    initialAuthPrompt,
  );
  const timer = useRef<number>();

  const show = useCallback((message: string, undo?: () => void) => {
    window.clearTimeout(timer.current);
    setToast({ id: Date.now(), message, undo });
    timer.current = window.setTimeout(() => setToast(null), 6000);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const value = useMemo<SourcesState>(
    () => ({
      following,
      blocked,
      isFollowing: (id) => following.has(id),
      // Follow and Join are instant, with Undo in the toast. There is no
      // unfollow or leave here; the button just goes away.
      follow: (source) => {
        if (!loggedIn) {
          setAuthPrompt(`follow ${source.name}`);
          return;
        }
        const before = following;
        setFollowing(new Set([...before, source.id]));
        show(
          `Following ${source.name}. Its posts join your Following feed`,
          () => setFollowing(before),
        );
      },
      members,
      addMember: (key, name, kind) => {
        if (!loggedIn) {
          setAuthPrompt(`${kind === 'squad' ? 'join' : 'follow'} ${name}`);
          return;
        }
        const before = members;
        setMembers(new Set([...before, key]));
        show(kind === 'squad' ? `Joined ${name}` : `Following ${name}`, () =>
          setMembers(before),
        );
      },
      block: (source) => {
        if (!loggedIn) {
          setAuthPrompt(`block ${source.name}`);
          return;
        }
        const beforeBlocked = blocked;
        const beforeFollowing = following;
        setBlocked(new Set([...beforeBlocked, source.id]));
        const nextFollowing = new Set(beforeFollowing);
        nextFollowing.delete(source.id);
        setFollowing(nextFollowing);
        show(`Blocked ${source.name}. You won’t see its posts`, () => {
          setBlocked(beforeBlocked);
          setFollowing(beforeFollowing);
        });
      },
      unblock: (source) => {
        const beforeBlocked = blocked;
        const nextBlocked = new Set(beforeBlocked);
        nextBlocked.delete(source.id);
        setBlocked(nextBlocked);
        show(`Unblocked ${source.name}`, () => setBlocked(beforeBlocked));
      },
      goTo: (path) => show(`Opens daily.dev${path}`),
      copyLink: () => show('Link copied'),
      suggest: () =>
        loggedIn
          ? show('Thanks! We’ll review your suggestion and let you know')
          : setAuthPrompt('suggest a source'),
      toast,
      dismissToast: () => setToast(null),
      authPrompt,
      dismissAuthPrompt: () => setAuthPrompt(null),
      loggedIn,
    }),
    [following, blocked, members, show, toast, authPrompt, loggedIn],
  );

  return (
    <SourcesContext.Provider value={value}>{children}</SourcesContext.Provider>
  );
};

/**
 * The toast. On laptops it rises from the bottom of the page card; on
 * phones it drops in at the top, 16px under the status bar (#6855).
 */
export const ToastHost = ({
  placement = 'bottom',
}: {
  /** `device`: at the top on phones, at the bottom from tablet up. */
  placement?: 'bottom' | 'top' | 'device';
}): ReactElement | null => {
  const { toast, dismissToast } = useSources();
  if (!toast) {
    return null;
  }
  return (
    <div
      className={classNames(
        'pointer-events-none inset-x-0 z-max flex justify-center px-4',
        placement === 'top' && 'fixed top-4',
        placement === 'bottom' && 'absolute bottom-8',
        placement === 'device' && 'fixed top-4 tablet:bottom-8 tablet:top-auto',
      )}
    >
      <NotifContainer
        key={toast.id}
        role="status"
        className="sx-in pointer-events-auto !static !w-auto min-w-0 max-w-full shrink !translate-x-0 gap-2"
      >
        <VIcon
          size={IconSize.Small}
          className="shrink-0 text-accent-avocado-default"
        />
        <NotifMessage>{toast.message}</NotifMessage>
        {toast.undo && (
          <Button
            type="button"
            variant={ButtonVariant.Subtle}
            size={ButtonSize.XSmall}
            onClick={() => {
              toast.undo?.();
              dismissToast();
            }}
          >
            Undo
          </Button>
        )}
        <Button
          type="button"
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.XSmall}
          aria-label="Dismiss"
          icon={<MiniCloseIcon />}
          onClick={dismissToast}
        />
      </NotifContainer>
    </div>
  );
};

/**
 * Signed out, Follow and Join ask to sign up first, like production's
 * auth wall. A sheet on phones, a centered card from tablet up.
 */
export const AuthPromptHost = (): ReactElement | null => {
  const { authPrompt, dismissAuthPrompt, goTo } = useSources();
  if (!authPrompt) {
    return null;
  }
  return (
    <div
      role="presentation"
      onClick={dismissAuthPrompt}
      className="fixed inset-0 z-modal flex items-end justify-center bg-overlay-quaternary-onion tablet:items-center"
    >
      <div
        role="dialog"
        aria-label="Sign up to continue"
        onClick={(event) => event.stopPropagation()}
        className="sx-in flex w-full flex-col gap-4 rounded-t-24 border border-border-subtlest-tertiary bg-background-default p-6 tablet:max-w-[26rem] tablet:rounded-24"
      >
        <div className="flex flex-col gap-1">
          <h2 className="font-bold typo-title3">Sign up to {authPrompt}</h2>
          <p className="text-text-tertiary typo-callout">
            Follow sources and join Squads to shape your feed. It takes a few
            seconds.
          </p>
        </div>
        <Button
          type="button"
          variant={ButtonVariant.Primary}
          onClick={() => {
            dismissAuthPrompt();
            goTo('/onboarding');
          }}
        >
          Continue with Google
        </Button>
        <Button
          type="button"
          variant={ButtonVariant.Float}
          onClick={() => {
            dismissAuthPrompt();
            goTo('/onboarding');
          }}
        >
          Continue with GitHub
        </Button>
        <button
          type="button"
          onClick={dismissAuthPrompt}
          className="self-center text-text-tertiary typo-callout hover:text-text-primary"
        >
          Not now
        </button>
      </div>
    </div>
  );
};

/**
 * Opens a source's page: rows, tiles and search results all lead there.
 * The hub provides it; outside one, a row just does nothing.
 */
export const OpenSourceContext = createContext<
  ((source: Source) => void) | null
>(null);

/* ---------------------------------------------------------------- frame */

const RailTab = ({
  label,
  icon,
  active = false,
  path,
}: {
  label: string;
  icon: ReactElement;
  active?: boolean;
  path: string;
}): ReactElement => {
  const { goTo } = useSources();
  return (
    <button
      type="button"
      aria-current={active ? 'page' : undefined}
      onClick={() => !active && goTo(path)}
      className={classNames(
        railTabClass,
        active && '!text-text-primary bg-background-default',
      )}
    >
      <span className={railGlyphBoxClass}>{icon}</span>
      <span className={railTabLabelClass}>{label}</span>
    </button>
  );
};

const RailIcon = ({
  label,
  path,
  children,
  className = railIcon,
}: {
  label: string;
  path: string;
  children: ReactNode;
  className?: string;
}): ReactElement => {
  const { goTo } = useSources();
  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => goTo(path)}
      className={className}
    >
      {children}
    </button>
  );
};

const railIcon =
  'flex size-10 items-center justify-center rounded-12 text-text-tertiary';

/**
 * The v2 rail, with Explore lit: /sources is one of its tabs. Signed out it
 * drops You, Activity and Create, as production does.
 */
export const Rail = ({
  loggedIn = true,
  className,
}: {
  loggedIn?: boolean;
  className?: string;
}): ReactElement => (
  <nav
    aria-label="Primary navigation"
    className={classNames(
      'flex w-20 shrink-0 flex-col items-center gap-0.5 px-1.5 pb-3 pt-[0.8125rem]',
      className,
    )}
  >
    <span className="mt-2.5 flex size-10 items-center justify-center text-text-primary">
      <span className={railGlyphBoxClass}>
        <LogoIcon className={{ container: 'h-[1.125rem] w-auto' }} />
      </span>
    </span>
    <RailIcon label="Home" path="/">
      <HomeIcon size={RAIL_ICON_SIZE} />
    </RailIcon>
    <RailIcon label="Search" path="/search">
      <SearchIcon size={RAIL_ICON_SIZE} />
    </RailIcon>
    <span className="my-3 h-px w-8 bg-border-subtlest-quaternary" />
    <RailTab
      active
      label="Explore"
      path="/posts"
      icon={<CompassIcon secondary size={RAIL_ICON_SIZE} />}
    />
    {loggedIn && (
      <RailTab
        label="You"
        path="/profile"
        icon={
          <img
            alt=""
            src="https://daily-now-res.cloudinary.com/image/upload/f_auto,q_auto/v1/placeholders/1"
            className="size-6 rounded-8 object-cover"
          />
        }
      />
    )}
    <RailTab
      label="Squads"
      path="/squads"
      icon={<SquadIcon size={RAIL_ICON_SIZE} />}
    />
    {loggedIn && (
      <RailTab
        label="Activity"
        path="/notifications"
        icon={<BellIcon size={RAIL_ICON_SIZE} />}
      />
    )}
    <RailTab
      label="Streak"
      path="/streak"
      icon={<HotIcon size={RAIL_ICON_SIZE} />}
    />
    {loggedIn && (
      <RailIcon
        label="Create post"
        path="/squads/create"
        className="my-2 flex size-9 items-center justify-center rounded-12 bg-accent-cabbage-default text-white"
      >
        <PlusIcon />
      </RailIcon>
    )}
    <span className="my-3 h-px w-8 bg-border-subtlest-quaternary" />
    <RailIcon label="Bookmarks" path="/bookmarks">
      <BookmarkIcon size={RAIL_ICON_SIZE} />
    </RailIcon>
    <RailIcon label="History" path="/history">
      <EyeIcon size={RAIL_ICON_SIZE} />
    </RailIcon>
  </nav>
);

export const FRAME = { width: 1440, height: 900 };

/** Where a layout's sticky headers stick: the frame's own scroller. */
export const ScrollRootContext = createContext<HTMLDivElement | null>(null);

/**
 * A 1440×900 laptop, scaled to the column: the rail and the floating page
 * card around the layout, which scrolls inside the card like the real page.
 */
export const Frame = ({
  children,
  height = FRAME.height,
}: {
  children: ReactNode;
  height?: number;
}): ReactElement => {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [scroller, setScroller] = useState<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const element = box.current;
    if (!element) {
      return undefined;
    }
    const observer = new ResizeObserver(() =>
      setScale(Math.min(1, element.clientWidth / FRAME.width)),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={box} className="w-full min-w-0">
      <div
        style={{ height: height * scale, width: FRAME.width * scale }}
        className="overflow-hidden rounded-16 border border-border-subtlest-tertiary"
      >
        <SourcesProvider>
          <div
            style={{
              width: FRAME.width,
              height,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
            }}
            className="relative flex bg-[color-mix(in_srgb,var(--theme-surface-secondary)_3%,var(--theme-background-default))] text-text-primary antialiased"
          >
            <Rail />
            <div className="my-3 ml-1 mr-3 flex min-w-0 flex-1 flex-col overflow-hidden rounded-24 border border-border-subtlest-quaternary bg-background-default p-0.5">
              <div
                ref={setScroller}
                className="sx-scroll relative min-h-0 flex-1 overflow-y-auto"
              >
                <ScrollRootContext.Provider value={scroller}>
                  {children}
                </ScrollRootContext.Provider>
              </div>
            </div>
            <ToastHost />
          </div>
        </SourcesProvider>
      </div>
    </div>
  );
};

/** The v2 page-header strip with "Suggest a source" on the right. */
export const PageHeader = ({
  title = 'Sources',
  children,
  className,
  suggest = true,
}: {
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
  suggest?: boolean;
}): ReactElement => (
  <header className={classNames(pageHeaderClassName, className)}>
    <strong className="min-w-0 flex-1 truncate typo-callout">{title}</strong>
    <div className="-mr-1 ml-auto flex shrink-0 items-center gap-1">
      {children}
      {suggest && <SuggestButton />}
    </div>
  </header>
);

export const SuggestButton = ({
  variant = ButtonVariant.Tertiary,
  label = 'Suggest a source',
}: {
  variant?: ButtonVariant;
  label?: string;
}): ReactElement => {
  const { suggest } = useSources();
  return (
    <Button
      type="button"
      icon={<PlusIcon />}
      variant={variant}
      size={ButtonSize.Small}
      onClick={suggest}
    >
      {label}
    </Button>
  );
};

/* ---------------------------------------------------------------- atoms */

export const formatCount = (value: number): string =>
  value < 1000 ? `${value}` : largeNumberFormat(value) ?? `${value}`;

// "0 followers" reads as a warning, so a source added in the last four
// weeks that is still finding its first followers says when it joined,
// like the squads directory's "New Squad".
const NEW_SOURCE_FOLLOWER_THRESHOLD = 50;
const NEW_SOURCE_DAYS = 28;

export const audienceLabel = (source: Source): string =>
  source.followers < NEW_SOURCE_FOLLOWER_THRESHOLD &&
  DATA_DATE.getTime() - source.createdAt.getTime() < NEW_SOURCE_DAYS * 86400000
    ? `Added ${source.createdAt.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })}`
    : `${formatCount(source.followers)} followers`;

export const SourceLogo = ({
  source,
  className,
}: {
  source: Source;
  className?: string;
}): ReactElement => (
  <span
    className={classNames(
      'relative block shrink-0 overflow-hidden bg-surface-float',
      className ?? 'size-10 rounded-12',
    )}
  >
    <Image src={source.image} alt="" className="size-full object-cover" />
  </span>
);

/**
 * The leaderboard mockup's Follow: a small primary button, the same width
 * as Join. What you already follow gets no button, and following removes
 * it; the toast's Undo brings it back.
 */
export const followButtonClassName = 'min-w-16';

export const FollowAction = ({
  isFollowing,
  onFollow,
  className,
}: {
  isFollowing: boolean;
  onFollow: () => void;
  className?: string;
}): ReactElement | null =>
  isFollowing ? null : (
    <Button
      type="button"
      aria-label="Follow"
      size={ButtonSize.XSmall}
      variant={ButtonVariant.Primary}
      className={classNames(followButtonClassName, 'shrink-0', className)}
      onClick={(event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        onFollow();
      }}
    >
      Follow
    </Button>
  );

export const FollowButton = ({
  source,
  className,
}: {
  source: Source;
  className?: string;
}): ReactElement | null => {
  const { isFollowing, follow } = useSources();
  return (
    <FollowAction
      className={className}
      isFollowing={isFollowing(source.id)}
      onFollow={() => follow(source)}
    />
  );
};

export const SearchBox = ({
  value,
  onChange,
  placeholder = 'Search sources by name, handle or topic',
  size = 'medium',
  className,
  autoFocus,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  size?: 'medium' | 'large';
  className?: string;
  autoFocus?: boolean;
}): ReactElement => (
  <label
    className={classNames(
      'flex items-center gap-2 border border-transparent bg-surface-float text-text-tertiary focus-within:border-border-subtlest-primary hover:bg-surface-hover',
      size === 'large' ? 'h-14 rounded-16 px-5' : 'h-10 rounded-12 px-3',
      className,
    )}
  >
    <SearchIcon size={size === 'large' ? IconSize.Medium : IconSize.Small} />
    <input
      // eslint-disable-next-line jsx-a11y/no-autofocus
      autoFocus={autoFocus}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className={classNames(
        'min-w-0 flex-1 bg-transparent text-text-primary outline-none placeholder:text-text-quaternary',
        size === 'large' ? 'typo-title3' : 'typo-callout',
      )}
    />
    {value && (
      <button
        type="button"
        aria-label="Clear search"
        onClick={() => onChange('')}
        className="text-text-tertiary hover:text-text-primary"
      >
        <MiniCloseIcon />
      </button>
    )}
  </label>
);

/* -------------------------------------------------------------- menus */

const MenuItem = ({
  icon,
  children,
  onClick,
  danger,
}: {
  icon: ReactNode;
  children: ReactNode;
  onClick: () => void;
  danger?: boolean;
}): ReactElement => (
  <button
    type="button"
    onClick={onClick}
    className={classNames(
      'flex h-9 w-full items-center gap-2 rounded-10 px-2 text-left typo-callout hover:bg-surface-hover',
      danger ? 'text-accent-ketchup-default' : 'text-text-secondary',
    )}
  >
    {icon}
    {children}
  </button>
);

/** The ⋯ menu: copy link and block, the actions that don't earn a spot. */
export const SourceMenu = ({
  source,
  defaultOpen = false,
}: {
  source: Source;
  defaultOpen?: boolean;
}): ReactElement => {
  const { copyLink, block } = useSources();
  const [open, setOpen] = useState(defaultOpen);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) {
      return undefined;
    }
    const close = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    // The menu's own document: a phone frame's clicks never reach the story's.
    const doc = ref.current?.ownerDocument ?? document;
    doc.addEventListener('mousedown', close);
    return () => doc.removeEventListener('mousedown', close);
  }, [open]);

  const run = (action: () => void) => () => {
    action();
    setOpen(false);
  };

  return (
    <div
      ref={ref}
      className="relative"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
      role="presentation"
    >
      <Button
        type="button"
        aria-label="Options"
        variant={ButtonVariant.Tertiary}
        size={ButtonSize.Small}
        pressed={open}
        icon={<MenuIcon />}
        onClick={() => setOpen(!open)}
      />
      {open && (
        <div className="sx-in absolute right-0 top-9 z-3 flex w-52 flex-col rounded-16 border border-border-subtlest-tertiary bg-background-popover p-1 shadow-2">
          <MenuItem icon={<LinkIcon />} onClick={run(copyLink)}>
            Copy link
          </MenuItem>
          <span className="my-1 h-px bg-border-subtlest-tertiary" />
          <MenuItem
            danger
            icon={<BlockIcon />}
            onClick={run(() => block(source))}
          >
            Block {source.name}
          </MenuItem>
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ row */

/** A small tile for rails: logo, name, @handle, followers, Follow, ⋯. */
export const SourceTile = ({
  source,
  className,
}: {
  source: Source;
  className?: string;
}): ReactElement => {
  const openSource = useContext(OpenSourceContext);
  return (
    <a
      href={source.permalink}
      onClick={(event) => {
        event.preventDefault();
        openSource?.(source);
      }}
      className={classNames(
        'sx-row relative flex w-44 shrink-0 flex-col items-center gap-2 rounded-20 border border-border-subtlest-tertiary p-4 text-center hover:bg-surface-hover',
        className,
      )}
    >
      <span className="sx-hover absolute right-1 top-1">
        <SourceMenu source={source} />
      </span>
      <SourceLogo source={source} className="size-16 rounded-20" />
      <span className="flex w-full min-w-0 flex-col">
        <span className="truncate font-bold typo-callout">{source.name}</span>
        <span className="truncate text-text-quaternary typo-caption1">
          @{source.handle}
        </span>
        <span className="sx-nums text-text-tertiary typo-caption1">
          {audienceLabel(source)}
        </span>
      </span>
      <FollowButton source={source} />
    </a>
  );
};

export const EmptyResults = ({
  query,
  onReset,
}: {
  query?: string;
  onReset?: () => void;
}): ReactElement => (
  <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
    <SearchIcon size={IconSize.XXLarge} className="text-text-quaternary" />
    <p className="font-bold typo-title3">
      {query ? `No sources match “${query}”` : 'No sources here yet'}
    </p>
    <p className="max-w-[40ch] text-text-tertiary typo-callout">
      Know a good blog, newsletter or channel we’re missing? Suggest it and
      we’ll add it for everyone.
    </p>
    <div className="flex gap-2">
      <SuggestButton variant={ButtonVariant.Primary} />
      {onReset && (
        <Button
          type="button"
          variant={ButtonVariant.Float}
          size={ButtonSize.Small}
          onClick={onReset}
        >
          Clear filters
        </Button>
      )}
    </div>
  </div>
);

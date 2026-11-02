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
  BookmarkIcon,
  CompassIcon,
  EyeIcon,
  HomeIcon,
  HotIcon,
  LinkIcon,
  MiniCloseIcon,
  PlusIcon,
  SearchIcon,
  SquadIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { CopyStateIcon } from '@dailydotdev/shared/src/components/share/CopyStateIcon';
import { Image } from '@dailydotdev/shared/src/components/image/Image';
import {
  NotifContainer,
  NotifMessage,
} from '@dailydotdev/shared/src/components/notifications/utils';
import toastStyles from '@dailydotdev/shared/src/components/notifications/Toast.module.css';
import classed from '@dailydotdev/shared/src/lib/classed';
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
import type { SuggestOpen } from './suggest';
import type { AuthPrompt } from './authLines';
import { authLines } from './authLines';
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
  /** The source page's own toggles: production's toasts, no Undo. */
  setFollowing: (source: Source, on: boolean) => void;
  setBlocked: (source: Source, on: boolean) => void;
  /** Signed out: production's AuthModal on its sign-up view. */
  requireSignUp: (line?: string) => void;
  /**
   * A press that leaves the sources pages (a post, a tag, a Squad, the
   * rail): the mockup can't draw it, so a toast names where it goes.
   */
  goTo: (path: string) => void;
  notify: (message: string) => void;
  copyLink: () => void;
  /** Opens NewSourceModal (signed out, with its field locked). */
  suggest: () => void;
  suggestOpen: SuggestOpen | null;
  closeSuggest: () => void;
  /** The modal's "Submit for review" went through. */
  suggestSubmitted: () => void;
  toast: Toast | null;
  dismissToast: () => void;
  /** Signed out, production's AuthModal: which view, and the phone line. */
  authPrompt: AuthPrompt | null;
  openAuth: (prompt: AuthPrompt) => void;
  dismissAuthPrompt: () => void;
}

/**
 * A frozen toast for the states catalog. `undo` is the state its Undo
 * returns to; `true` just shows the button.
 */
export interface InitialToast {
  message: string;
  undo?: boolean | { following?: string[]; members?: string[] };
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
  suggestOpen: initialSuggestOpen = null,
}: {
  children: ReactNode;
  loggedIn?: boolean;
  following?: string[];
  members?: string[];
  toast?: InitialToast;
  authPrompt?: AuthPrompt | null;
  suggestOpen?: SuggestOpen | null;
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
  const [toast, setToast] = useState<Toast | null>(() => {
    if (!initialToast) {
      return null;
    }
    const { message, undo } = initialToast;
    if (!undo) {
      return { id: 0, message };
    }
    return {
      id: 0,
      message,
      undo: () => {
        if (typeof undo === 'boolean') {
          return;
        }
        if (undo.following) {
          setFollowing(new Set(undo.following));
        }
        if (undo.members) {
          setMembers(new Set(undo.members));
        }
      },
    };
  });
  const [authPrompt, setAuthPrompt] = useState<AuthPrompt | null>(
    initialAuthPrompt,
  );
  const [suggestOpen, setSuggestOpen] = useState<SuggestOpen | null>(
    initialSuggestOpen,
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
          setAuthPrompt({ view: 'signup' });
          return;
        }
        const before = following;
        const beforeBlocked = blocked;
        setFollowing(new Set([...before, source.id]));
        if (blocked.has(source.id)) {
          const nextBlocked = new Set(blocked);
          nextBlocked.delete(source.id);
          setBlocked(nextBlocked);
        }
        show(`✅ You are now following ${source.name}`, () => {
          setFollowing(before);
          setBlocked(beforeBlocked);
        });
      },
      members,
      addMember: (key, name, kind) => {
        if (!loggedIn) {
          setAuthPrompt({
            view: 'signup',
            line: kind === 'squad' ? authLines.joinSquad : authLines.follow,
          });
          return;
        }
        const before = members;
        setMembers(new Set([...before, key]));
        show(
          kind === 'squad'
            ? `Joined ${name}`
            : `✅ You are now following ${name}`,
          () => setMembers(before),
        );
      },
      goTo: (path) => show(`Opens daily.dev${path}`),
      notify: (message) => show(message),
      setFollowing: (source, on) => {
        const next = new Set(following);
        if (on) {
          next.add(source.id);
        } else {
          next.delete(source.id);
        }
        setFollowing(next);
      },
      setBlocked: (source, on) => {
        const next = new Set(blocked);
        if (on) {
          next.add(source.id);
          const nextFollowing = new Set(following);
          nextFollowing.delete(source.id);
          setFollowing(nextFollowing);
        } else {
          next.delete(source.id);
        }
        setBlocked(next);
      },
      requireSignUp: (line) => setAuthPrompt({ view: 'signup', line }),
      openAuth: setAuthPrompt,
      copyLink: () => show('✅ Copied link to clipboard'),
      suggest: () => setSuggestOpen({}),
      suggestOpen,
      closeSuggest: () => setSuggestOpen(null),
      // Production closes the modal on submit, with no toast.
      suggestSubmitted: () => setSuggestOpen(null),
      toast,
      dismissToast: () => setToast(null),
      authPrompt,
      dismissAuthPrompt: () => setAuthPrompt(null),
      loggedIn,
    }),
    [
      following,
      blocked,
      members,
      show,
      toast,
      authPrompt,
      loggedIn,
      suggestOpen,
    ],
  );

  return (
    <SourcesContext.Provider value={value}>{children}</SourcesContext.Provider>
  );
};

/**
 * Production's Toast: the same container and its CSS module, so it rests at
 * the top on every device, 16px down on phones and 32px from tablet up. The
 * message carries its own emoji, so there is no leading icon; an action
 * (Undo) is the Subtle XSmall button, then the round dismiss.
 */
const ToastContainer = classed(NotifContainer, toastStyles.toastContainer);

export const ToastHost = (): ReactElement | null => {
  const { toast, dismissToast } = useSources();
  if (!toast) {
    return null;
  }
  return (
    <ToastContainer key={toast.id} className="slide-in" role="alert">
      <NotifMessage>{toast.message}</NotifMessage>
      {toast.undo && (
        <Button
          type="button"
          variant={ButtonVariant.Subtle}
          size={ButtonSize.XSmall}
          aria-label="Undo"
          className="shrink-0"
          onClick={() => {
            toast.undo?.();
            dismissToast();
          }}
        >
          Undo
        </Button>
      )}
      <button
        type="button"
        aria-label="Dismiss toast notification"
        onClick={dismissToast}
        className="relative grid size-8 shrink-0 place-items-center rounded-full text-text-primary hover:bg-surface-float"
      >
        <MiniCloseIcon size={IconSize.Small} />
      </button>
    </ToastContainer>
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
        active && 'bg-background-default !text-text-primary',
      )}
    >
      <span className={railGlyphBoxClass}>{icon}</span>
      <span className={railTabLabelClass}>{label}</span>
    </button>
  );
};

const railIcon =
  'flex size-10 items-center justify-center rounded-12 text-text-tertiary';

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
            src="https://media.daily.dev/image/upload/f_auto,q_auto/v1/placeholders/1"
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
              <div className="sx-scroll relative min-h-0 flex-1 overflow-y-auto">
                {children}
              </div>
            </div>
            <ToastHost />
          </div>
        </SourcesProvider>
      </div>
    </div>
  );
};

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

/* ---------------------------------------------------------- copy link */

/**
 * SourceTopList's CopyLinkButton: a quiet link button that waits for hover
 * where there is a mouse and stays on touch, and swaps to a check on copy.
 */
export const CopyLinkAction = ({
  forceVisible = false,
  className,
}: {
  /** Freezes the hover state for the states catalog. */
  forceVisible?: boolean;
  className?: string;
}): ReactElement => {
  const { copyLink } = useSources();
  const [copied, setCopied] = useState(false);
  const timer = useRef<number>();
  useEffect(() => () => window.clearTimeout(timer.current), []);
  return (
    <Button
      type="button"
      aria-label="Copy link"
      title={copied ? 'Copied!' : 'Copy link'}
      icon={<CopyStateIcon copied={copied} icon={LinkIcon} />}
      size={ButtonSize.Small}
      variant={ButtonVariant.Tertiary}
      className={classNames(
        'shrink-0',
        !forceVisible &&
          'laptop:mouse:opacity-0 laptop:mouse:group-focus-within/source:opacity-100 laptop:mouse:group-hover/source:opacity-100',
        className,
      )}
      onClick={(event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        copyLink();
        setCopied(true);
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setCopied(false), 2000);
      }}
    />
  );
};

/* ------------------------------------------------------------------ row */

/** A small tile for rails: logo, name, @handle, followers, Follow, copy link. */
export const SourceTile = ({
  source,
  className,
}: {
  source: Source;
  className?: string;
}): ReactElement => {
  const openSource = useContext(OpenSourceContext);
  return (
    <article
      className={classNames(
        'group/source relative flex shrink-0 flex-col items-center gap-2 rounded-20 border border-border-subtlest-tertiary p-4 text-center hover:bg-surface-hover',
        className ?? 'w-44',
      )}
    >
      <a
        href={source.permalink}
        aria-label={`Open ${source.name}`}
        onClick={(event) => {
          event.preventDefault();
          openSource?.(source);
        }}
        className="absolute inset-0 rounded-20"
      />
      <span className="absolute right-1 top-1">
        <CopyLinkAction />
      </span>
      <SourceLogo
        source={source}
        className="pointer-events-none size-16 rounded-20"
      />
      <span className="flex w-full min-w-0 flex-col">
        <span className="truncate font-bold typo-callout">{source.name}</span>
        <span className="truncate text-text-quaternary typo-caption1">
          @{source.handle}
        </span>
        <span className="sx-nums text-text-tertiary typo-caption1">
          {audienceLabel(source)}
        </span>
      </span>
      <span className="relative">
        <FollowButton source={source} />
      </span>
    </article>
  );
};

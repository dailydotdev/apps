import type { ReactElement, ReactNode } from 'react';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  BellIcon,
  FolderIcon,
  ArrowIcon,
  BookmarkIcon,
  CompassIcon,
  DownvoteIcon,
  EyeIcon,
  HomeIcon,
  HotIcon,
  LinkIcon,
  MailIcon,
  MenuIcon,
  MiniCloseIcon,
  PlayIcon,
  PlusIcon,
  SearchIcon,
  ShareIcon,
  SquadIcon,
  UpvoteIcon,
  VIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { Image } from '@dailydotdev/shared/src/components/image/Image';
import {
  ProfileImageSize,
  ProfilePicture,
} from '@dailydotdev/shared/src/components/ProfilePicture';
import { Separator } from '@dailydotdev/shared/src/components/cards/common/common';
import {
  NotifContainer,
  NotifMessage,
} from '@dailydotdev/shared/src/components/notifications/utils';
import {
  RAIL_ICON_SIZE,
  railGlyphBoxClass,
  railTabClass,
  railTabLabelClass,
} from '@dailydotdev/shared/src/components/sidebar/common';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';
import { Tooltip } from '@dailydotdev/shared/src/components/tooltip/Tooltip';
import { CopyStateIcon } from '@dailydotdev/shared/src/components/share/CopyStateIcon';
import { largeNumberFormat } from '@dailydotdev/shared/src/lib/numberFormat';
import { cloudinaryPostImageCoverPlaceholder } from '@dailydotdev/shared/src/lib/image';
import { socials } from '@dailydotdev/shared/src/lib/socialMedia';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import SocialIconButton from '@dailydotdev/shared/src/components/cards/socials/SocialIconButton';
import { SlackCtaButton } from '@dailydotdev/shared/src/components/widgets/SlackCtaButton';
import CloseButton from '@dailydotdev/shared/src/components/CloseButton';
import { PlusUser } from '@dailydotdev/shared/src/components/PlusUser';
import ReadingHistoryEmptyScreen from '@dailydotdev/shared/src/components/history/ReadingHistoryEmptyScreen';
import SearchEmptyScreen from '@dailydotdev/shared/src/components/SearchEmptyScreen';
import type { HistoryItem, MatchField, Vote } from './data';
import { fullPost } from './posts';
import { history as initialHistory, matchField } from './data';

// The vocabulary every layout is built from: production atoms (Button,
// Image, ProfilePicture, the toast container, the rail recipes) composed
// into history rows. Every frame owns its own copy of the history, so
// removing, bookmarking and undo work per layout.

const historyCss = `
.hx-nums { font-variant-numeric: tabular-nums; }
@keyframes hxIn {
  from { opacity: 0; transform: translateY(0.5rem); }
  to { opacity: 1; transform: none; }
}
.hx-in { animation: hxIn 240ms cubic-bezier(0.16, 1, 0.3, 1) both; }
.hx-scroll { scrollbar-width: thin; }
.hx-mark { background: color-mix(in srgb, var(--theme-accent-cheese-default) 30%, transparent); color: inherit; border-radius: 0.25rem; padding: 0 0.125rem; }
`;

export const HistoryStyles = (): ReactElement => (
  <style dangerouslySetInnerHTML={{ __html: historyCss }} />
);

/* ---------------------------------------------------------------- state */

interface ToastAction {
  copy: string;
  onClick: () => void;
}

interface Toast {
  id: number;
  message: string;
  action?: ToastAction;
}

type SharePromptKind = 'copy' | 'upvote';

interface HistoryState {
  items: HistoryItem[];
  remove: (keys: string[]) => void;
  toggleBookmark: (key: string) => void;
  vote: (key: string, vote: Vote) => void;
  copyLink: (key: string) => void;
  saveToFolder: (key: string, folder: string) => void;
  /** The row whose bookmark is being moved, from the toast's Change folder. */
  moving: string | null;
  closeMove: () => void;
  /** The folder each bookmarked post is in, by post id; Quick saves if none. */
  folderOf: Record<string, string>;
  moveToFolder: (key: string, folder: string) => void;
  /** The one share prompt a row shows, after a copy or an upvote; null
   * once dismissed, so it doesn't come back. */
  prompts: Record<string, SharePromptKind | null>;
  dismissPrompt: (key: string) => void;
  share: () => void;
  sendMessage: () => void;
  toast: Toast | null;
  dismissToast: () => void;
}

const HistoryContext = createContext<HistoryState | null>(null);

export const useHistory = (): HistoryState => {
  const state = useContext(HistoryContext);
  if (!state) {
    throw new Error('useHistory needs a HistoryProvider');
  }
  return state;
};

export const HistoryProvider = ({
  children,
  empty = false,
  transform,
  holdToasts = false,
}: {
  children: ReactNode;
  empty?: boolean;
  /** Reshapes the starting history, for edge-case states. */
  transform?: (items: HistoryItem[]) => HistoryItem[];
  /** Keeps toasts up, so a frozen state still shows its toast. */
  holdToasts?: boolean;
}): ReactElement => {
  const [items, setItems] = useState<HistoryItem[]>(() => {
    if (empty) {
      return [];
    }
    return transform ? transform(initialHistory) : initialHistory;
  });
  const [toast, setToast] = useState<Toast | null>(null);
  const [moving, setMoving] = useState<string | null>(null);
  const [folderOf, setFolderOf] = useState<Record<string, string>>({});
  const [prompts, setPrompts] = useState<
    Record<string, SharePromptKind | null>
  >({});
  const timer = useRef<number>();
  // One prompt per post (#6860): whichever came first stays.
  const prompt = useCallback(
    (key: string, kind: SharePromptKind) =>
      setPrompts((current) =>
        key in current ? current : { ...current, [key]: kind },
      ),
    [],
  );

  const show = useCallback(
    (message: string, action?: ToastAction) => {
      window.clearTimeout(timer.current);
      setToast({ id: Date.now(), message, action });
      if (!holdToasts) {
        timer.current = window.setTimeout(() => setToast(null), 6000);
      }
    },
    [holdToasts],
  );

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const value = useMemo<HistoryState>(
    () => ({
      items,
      // Undo puts every row back where it was, not at the end of the page.
      remove: (keys) => {
        const before = items;
        setItems(before.filter((item) => !keys.includes(item.key)));
        show(
          keys.length === 1
            ? 'Removed from history'
            : `${keys.length} posts removed from history`,
          { copy: 'Undo', onClick: () => setItems(before) },
        );
      },
      toggleBookmark: (key) => {
        const item = items.find((entry) => entry.key === key);
        // A bookmark belongs to the post, so every read of it flips.
        setItems((current) =>
          current.map((entry) =>
            entry.id === item?.id
              ? { ...entry, bookmarked: !entry.bookmarked }
              : entry,
          ),
        );
        // Production's useBookmarkPost toasts, word for word.
        if (item?.bookmarked) {
          show('Post was removed from your bookmarks');
          return;
        }
        show('Bookmarked! Saved to Quick saves', {
          copy: 'Change folder',
          onClick: () => setMoving(key),
        });
      },
      vote: (key, next) => {
        const entry = items.find((item) => item.key === key);
        if (next === 'up' && entry?.vote !== 'up') {
          prompt(key, 'upvote');
        }
        setItems((current) =>
          current.map((item) =>
            item.key === key
              ? { ...item, vote: item.vote === next ? null : next }
              : item,
          ),
        );
      },
      copyLink: (key) => prompt(key, 'copy'),
      saveToFolder: (key, folder) => {
        const id = items.find((entry) => entry.key === key)?.id;
        setItems((current) =>
          current.map((entry) =>
            entry.id === id ? { ...entry, bookmarked: true } : entry,
          ),
        );
        if (id) {
          setFolderOf((current) => ({ ...current, [id]: folder }));
        }
        show(`Bookmarked! Saved to ${folder}`, {
          copy: 'Change folder',
          onClick: () => setMoving(key),
        });
      },
      moving,
      closeMove: () => setMoving(null),
      folderOf,
      // Production's MoveBookmarkModal toast, with its Undo.
      moveToFolder: (key, folder) => {
        const id = items.find((entry) => entry.key === key)?.id;
        if (!id) {
          return;
        }
        const before = folderOf;
        setFolderOf((current) => ({ ...current, [id]: folder }));
        setMoving(null);
        show(`✅ Moved to ${folder}`, {
          copy: 'Undo',
          onClick: () => setFolderOf(before),
        });
      },
      prompts,
      dismissPrompt: (key) =>
        setPrompts((current) => ({ ...current, [key]: null })),
      share: () => show('Share sheet opens here'),
      sendMessage: () => show('New message with the post opens here'),
      toast,
      dismissToast: () => setToast(null),
    }),
    [folderOf, items, moving, prompt, prompts, show, toast],
  );

  return (
    <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>
  );
};

export const ToastHost = ({
  className = 'absolute inset-x-0 bottom-8',
}: {
  /** Where the toast stands: the frame's bottom, or the phone's top. */
  className?: string;
}): ReactElement | null => {
  const { toast, dismissToast } = useHistory();
  if (!toast) {
    return null;
  }
  return (
    <div
      className={classNames(
        'pointer-events-none z-max flex justify-center px-4',
        className,
      )}
    >
      <NotifContainer
        key={toast.id}
        role="status"
        className="hx-in pointer-events-auto !static !w-auto !translate-x-0 gap-2"
      >
        <VIcon
          size={IconSize.Small}
          className="shrink-0 text-accent-avocado-default"
        />
        <NotifMessage>{toast.message}</NotifMessage>
        {toast.action && (
          <Button
            type="button"
            variant={ButtonVariant.Subtle}
            size={ButtonSize.XSmall}
            onClick={() => {
              toast.action?.onClick();
              dismissToast();
            }}
          >
            {toast.action.copy}
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

/** Production's MoveBookmarkModal ("Choose a folder"), inside the frame. */
export const MoveBookmarkHost = ({
  className = 'absolute inset-0',
}: {
  className?: string;
}): ReactElement | null => {
  const { items, moving, closeMove, folderOf, moveToFolder } = useHistory();
  const item = items.find((entry) => entry.key === moving);
  if (!item) {
    return null;
  }
  const current = folderOf[item.id] ?? 'Quick saves';
  const option = (name: string, icon: ReactElement) => (
    <Button
      key={name}
      type="button"
      variant={ButtonVariant.Option}
      icon={icon}
      role="radio"
      aria-checked={current === name}
      onClick={() => moveToFolder(item.key, name)}
    >
      {name}
      {current === name && (
        <span className="ml-auto">
          <VIcon secondary aria-hidden />
        </span>
      )}
    </Button>
  );
  return (
    <div
      role="presentation"
      onClick={closeMove}
      className={classNames(
        'z-max flex items-center justify-center bg-overlay-quaternary-onion',
        className,
      )}
    >
      <div
        role="dialog"
        aria-label="Choose a folder"
        onClick={(event) => event.stopPropagation()}
        className="hx-in flex w-[26rem] flex-col rounded-24 border border-border-subtlest-tertiary bg-background-default"
      >
        <div className="flex items-center justify-between border-b border-border-subtlest-tertiary px-6 py-4">
          <h2 className="font-bold typo-title3">Choose a folder</h2>
          <CloseButton size={ButtonSize.Small} onClick={closeMove} />
        </div>
        <div className="flex flex-col p-4">
          <Button
            type="button"
            variant={ButtonVariant.Option}
            icon={
              <span className="flex rounded-6 bg-background-subtle">
                <PlusIcon className="m-auto" />
              </span>
            }
            onClick={() => moveToFolder(item.key, 'New folder')}
          >
            New folder
          </Button>
          {option('Quick saves', <BookmarkIcon />)}
          {bookmarkFolders.map((folder) => option(folder, <FolderIcon />))}
        </div>
      </div>
    </div>
  );
};

/* ---------------------------------------------------------------- frame */

const RailTab = ({
  label,
  icon,
  active = false,
}: {
  label: string;
  icon: (active: boolean) => ReactElement;
  active?: boolean;
}): ReactElement => (
  <span
    className={classNames(
      railTabClass,
      active && '!text-text-primary bg-background-default',
    )}
  >
    <span className={railGlyphBoxClass}>{icon(active)}</span>
    <span className={railTabLabelClass}>{label}</span>
  </span>
);

const railIcon =
  'flex size-10 items-center justify-center rounded-12 text-text-tertiary';

/** The v2 rail, with the History shortcut lit in its dock. */
export const Rail = ({ className }: { className?: string }): ReactElement => (
  <nav
    aria-label="Primary navigation"
    className={classNames(
      'flex w-20 shrink-0 flex-col items-center gap-0.5 px-1.5 pb-3 pt-[13px]',
      className,
    )}
  >
    <span className="mt-2.5 flex size-10 items-center justify-center text-text-primary">
      <span className={railGlyphBoxClass}>
        <LogoIcon className={{ container: 'h-[1.125rem] w-auto' }} />
      </span>
    </span>
    <span className={railIcon}>
      <HomeIcon size={RAIL_ICON_SIZE} />
    </span>
    <span className={railIcon}>
      <SearchIcon size={RAIL_ICON_SIZE} />
    </span>
    <span className="my-3 h-px w-8 bg-border-subtlest-quaternary" />
    <RailTab
      label="Explore"
      icon={() => <CompassIcon size={RAIL_ICON_SIZE} />}
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
    <RailTab label="Squads" icon={() => <SquadIcon size={RAIL_ICON_SIZE} />} />
    <RailTab label="Activity" icon={() => <BellIcon size={RAIL_ICON_SIZE} />} />
    <RailTab label="Streak" icon={() => <HotIcon size={RAIL_ICON_SIZE} />} />
    <span className="my-2 flex size-9 items-center justify-center rounded-12 bg-accent-cabbage-default text-white">
      <PlusIcon />
    </span>
    <span className="my-3 h-px w-8 bg-border-subtlest-quaternary" />
    <span className={railIcon}>
      <BookmarkIcon size={RAIL_ICON_SIZE} />
    </span>
    <span
      className={classNames(
        railIcon,
        'bg-background-default !text-text-primary',
      )}
      title="History"
    >
      <EyeIcon secondary size={RAIL_ICON_SIZE} />
    </span>
  </nav>
);

/* ---------------------------------------------------------------- atoms */

export const Thumb = ({
  item,
  className,
}: {
  item: HistoryItem;
  className?: string;
}): ReactElement => (
  <span
    className={classNames(
      'relative block shrink-0 overflow-hidden bg-surface-float',
      className ?? 'h-16 w-24 rounded-12',
    )}
  >
    <Image
      src={item.image}
      alt=""
      loading="lazy"
      fallbackSrc={cloudinaryPostImageCoverPlaceholder}
      className="size-full object-cover"
    />
    {item.type === 'video' && (
      <span className="absolute bottom-1 right-1 z-1 flex items-center gap-0.5 rounded-6 bg-overlay-primary-pepper px-1 font-bold text-white typo-caption2">
        <PlayIcon size={IconSize.XXSmall} />
        {item.readTime}m
      </span>
    )}
  </span>
);

const SourceAvatar = ({
  item,
  size = ProfileImageSize.XSmall,
}: {
  item: HistoryItem;
  size?: ProfileImageSize;
}): ReactElement => (
  <ProfilePicture
    size={size}
    rounded="full"
    user={{ image: item.source.image, username: item.source.name }}
  />
);

/** Source · read time · upvotes, the row's second line, as production has it. */
export const Meta = ({
  item,
  showSource = true,
  extra,
  className,
}: {
  item: HistoryItem;
  showSource?: boolean;
  extra?: ReactNode;
  className?: string;
}): ReactElement => (
  <span
    className={classNames(
      'flex min-w-0 items-center text-text-tertiary typo-footnote',
      className,
    )}
  >
    {showSource && (
      <>
        <SourceAvatar item={item} />
        <span className="ml-1.5 truncate">{item.source.name}</span>
        <Separator />
      </>
    )}
    <span className="shrink-0">
      {item.readTime}m {item.type === 'video' ? 'watch' : 'read'}
    </span>
    {item.numUpvotes > 0 && (
      <>
        <Separator />
        <span className="hx-nums shrink-0">
          {largeNumberFormat(item.numUpvotes)} upvotes
        </span>
      </>
    )}
    {extra}
  </span>
);

export const Chip = ({
  children,
  active,
  onClick,
  icon,
}: {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
  icon?: ReactNode;
}): ReactElement => (
  <button
    type="button"
    aria-pressed={active}
    onClick={onClick}
    className={classNames(
      'flex h-8 shrink-0 items-center gap-1.5 rounded-10 px-3 font-bold typo-callout transition-colors',
      active
        ? 'bg-surface-primary text-surface-invert'
        : 'bg-surface-float text-text-secondary hover:bg-surface-hover hover:text-text-primary',
    )}
  >
    {icon}
    {children}
  </button>
);

/**
 * The history search, with production's title suggestions
 * (searchReadingHistorySuggestions) under it while you type.
 */
export const SearchBox = ({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}): ReactElement => {
  const { items } = useHistory();
  const [focused, setFocused] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const q = value.trim().toLowerCase();
  const suggestions =
    q.length < 2
      ? []
      : [
          ...new Set(
            items
              .map((item) => item.title)
              .filter(
                (title) =>
                  title.toLowerCase().includes(q) && title.toLowerCase() !== q,
              ),
          ),
        ].slice(0, 5);

  return (
    <div className={classNames('relative', className)}>
      <label className="flex h-10 items-center gap-2 rounded-12 border border-transparent bg-surface-float px-3 text-text-tertiary focus-within:border-border-subtlest-primary hover:bg-surface-hover">
        <SearchIcon size={IconSize.Small} />
        <input
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            setFocused(true);
            setHighlight(-1);
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            setHighlight(-1);
          }}
          // Production's useAutoComplete: arrows move, Enter picks,
          // Escape closes.
          onKeyDown={(event) => {
            if (!suggestions.length) {
              return;
            }
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
              event.preventDefault();
              setFocused(true);
              const step = event.key === 'ArrowDown' ? 1 : -1;
              setHighlight(
                (current) =>
                  (current + step + suggestions.length) % suggestions.length,
              );
            }
            if (event.key === 'Enter' && highlight >= 0) {
              onChange(suggestions[highlight]);
              setHighlight(-1);
            }
            if (event.key === 'Escape') {
              setFocused(false);
              setHighlight(-1);
            }
          }}
          placeholder="Search history"
          className="min-w-0 flex-1 bg-transparent text-text-primary outline-none typo-callout placeholder:text-text-quaternary"
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
      {focused && suggestions.length > 0 && (
        <div className="hx-in absolute inset-x-0 top-11 z-3 flex flex-col rounded-16 border border-border-subtlest-tertiary bg-background-popover p-1 shadow-2">
          {suggestions.map((title, index) => (
            <button
              key={title}
              type="button"
              // Before blur, so the click lands.
              onMouseDown={(event) => {
                event.preventDefault();
                onChange(title);
              }}
              className={classNames(
                'flex h-9 items-center gap-2 truncate rounded-10 px-2 text-left text-text-secondary typo-callout hover:bg-surface-hover',
                index === highlight && 'bg-surface-hover',
              )}
            >
              <SearchIcon size={IconSize.Small} className="shrink-0" />
              <span className="truncate">
                <Highlight text={title} query={value} />
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/** Wraps the matched words in a mark, for titles and TLDRs in results. */
export const Highlight = ({
  text,
  query,
}: {
  text: string;
  query?: string;
}): ReactElement => {
  const q = query?.trim().replace(/^#/, '');
  if (!q) {
    return <>{text}</>;
  }
  const parts = text.split(
    new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig'),
  );
  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === q.toLowerCase() ? (
          // eslint-disable-next-line react/no-array-index-key
          <mark key={index} className="hx-mark">
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
};

const matchLabels: Record<MatchField, string> = {
  title: 'Title',
  summary: 'TLDR',
  tag: 'Tag',
  source: 'Source',
};

/** "Matched in TLDR": why a row is in the results when the title isn't it. */
export const MatchNote = ({
  item,
  query,
}: {
  item: HistoryItem;
  query: string;
}): ReactElement | null => {
  const field = matchField(item, query);
  if (!field || field === 'title') {
    return null;
  }
  return (
    <>
      <Separator />
      <span className="text-text-quaternary typo-caption1">
        Matched in {matchLabels[field]}
      </span>
    </>
  );
};

/* -------------------------------------------------------------- actions */

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

/** The reader's bookmark folders. Mock: the ones #6788's strip names. */
const bookmarkFolders = ['PostgreSQL', 'React', 'Security'];

/**
 * Production's ReadingHistoryOptionsMenu, item for item (share, bookmark,
 * remove), led by sending the post in a direct message, with Plus's
 * bookmark folders one step in.
 */
export const OptionsMenu = ({
  item,
  open,
  onOpenChange,
  withBookmark = true,
  full = false,
}: {
  item: HistoryItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Off when the bookmark already has its own button beside the menu. */
  withBookmark?: boolean;
  /**
   * Touch widths have no hover row, so the menu holds every action:
   * votes and copy link lead it.
   */
  full?: boolean;
}): ReactElement => {
  const {
    copyLink,
    remove,
    saveToFolder,
    sendMessage,
    share,
    toggleBookmark,
    vote,
  } = useHistory();
  const [folders, setFolders] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) {
      setFolders(false);
      return undefined;
    }
    const close = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) {
        onOpenChange(false);
      }
    };
    // The menu's own document: inside a device frame it is not this one.
    const doc = ref.current?.ownerDocument ?? document;
    doc.addEventListener('mousedown', close);
    return () => doc.removeEventListener('mousedown', close);
  }, [open, onOpenChange]);

  const run = (action: () => void) => () => {
    action();
    onOpenChange(false);
  };

  return (
    <div ref={ref} className="relative">
      <Button
        type="button"
        aria-label="Options"
        variant={ButtonVariant.Tertiary}
        size={ButtonSize.Small}
        pressed={open}
        icon={<MenuIcon />}
        onClick={(event: React.MouseEvent) => {
          event.stopPropagation();
          event.preventDefault();
          onOpenChange(!open);
        }}
      />
      {open && (
        <div className="hx-in absolute right-0 top-9 z-3 flex w-60 flex-col rounded-16 border border-border-subtlest-tertiary bg-background-popover p-1 shadow-2">
          {folders ? (
            <>
              <MenuItem
                icon={<ArrowIcon className="-rotate-90" />}
                onClick={() => setFolders(false)}
              >
                <span className="font-bold text-text-primary">
                  Save to folder
                </span>
              </MenuItem>
              <span className="my-1 h-px bg-border-subtlest-tertiary" />
              {bookmarkFolders.map((folder) => (
                <MenuItem
                  key={folder}
                  icon={<FolderIcon />}
                  onClick={run(() => saveToFolder(item.key, folder))}
                >
                  {folder}
                </MenuItem>
              ))}
              <MenuItem
                icon={<PlusIcon />}
                onClick={run(() => saveToFolder(item.key, 'a new folder'))}
              >
                New folder
              </MenuItem>
            </>
          ) : (
            <>
              {full && (
                <>
                  <MenuItem
                    icon={<UpvoteIcon secondary={item.vote === 'up'} />}
                    onClick={run(() => vote(item.key, 'up'))}
                  >
                    {item.vote === 'up' ? 'Remove upvote' : 'Upvote'}
                  </MenuItem>
                  <MenuItem
                    icon={<DownvoteIcon secondary={item.vote === 'down'} />}
                    onClick={run(() => vote(item.key, 'down'))}
                  >
                    {item.vote === 'down' ? 'Remove downvote' : 'Downvote'}
                  </MenuItem>
                  <MenuItem
                    icon={<LinkIcon />}
                    onClick={run(() => copyLink(item.key))}
                  >
                    Copy link
                  </MenuItem>
                  <span className="my-1 h-px bg-border-subtlest-tertiary" />
                </>
              )}
              <MenuItem icon={<MailIcon />} onClick={run(sendMessage)}>
                Send in a message
              </MenuItem>
              <MenuItem icon={<ShareIcon />} onClick={run(share)}>
                Share post via...
              </MenuItem>
              {withBookmark && (
                <MenuItem
                  icon={<BookmarkIcon secondary={item.bookmarked} />}
                  onClick={run(() => toggleBookmark(item.key))}
                >
                  {item.bookmarked
                    ? 'Remove from bookmarks'
                    : 'Save to bookmarks'}
                </MenuItem>
              )}
              <MenuItem icon={<FolderIcon />} onClick={() => setFolders(true)}>
                <span className="flex-1">Save to folder</span>
                <PlusUser />
              </MenuItem>
              <MenuItem
                icon={<MiniCloseIcon />}
                onClick={run(() => remove([item.key]))}
              >
                Remove post
              </MenuItem>
            </>
          )}
        </div>
      )}
    </div>
  );
};

/** Copy link with production's copied state and tooltip. */
const CopyLinkButton = ({
  item,
  className,
}: {
  item: HistoryItem;
  className?: string;
}): ReactElement => {
  const { copyLink } = useHistory();
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) {
      return undefined;
    }
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);
  return (
    <Tooltip content="Copy link">
      <Button
        type="button"
        aria-label="Copy link"
        variant={ButtonVariant.Tertiary}
        size={ButtonSize.Small}
        className={className}
        icon={<CopyStateIcon copied={copied} icon={LinkIcon} />}
        onClick={() => {
          copyLink(item.key);
          setCopied(true);
        }}
      />
    </Tooltip>
  );
};

/**
 * Every action the live row has (upvote, downvote, copy link, ⋯), shown on
 * hover instead of on every row at once.
 */
export const RowActions = ({
  item,
  className,
  bookmark = false,
}: {
  item: HistoryItem;
  className?: string;
  /** Bookmark as its own button after downvote, out of the ⋯ menu. */
  bookmark?: boolean;
}): ReactElement => {
  const { toggleBookmark, vote } = useHistory();
  const [open, setOpen] = useState(false);
  return (
    <div
      className={classNames('flex shrink-0 items-center gap-1', className)}
      onClick={(event) => event.preventDefault()}
      role="presentation"
    >
      <div className="hx-actions flex items-center gap-1" data-open={open}>
        <Button
          type="button"
          aria-label="Upvote"
          variant={ButtonVariant.Tertiary}
          color={ButtonColor.Avocado}
          size={ButtonSize.Small}
          pressed={item.vote === 'up'}
          icon={<UpvoteIcon secondary={item.vote === 'up'} />}
          onClick={() => vote(item.key, 'up')}
        />
        <Button
          type="button"
          aria-label="Downvote"
          variant={ButtonVariant.Tertiary}
          color={ButtonColor.Ketchup}
          size={ButtonSize.Small}
          pressed={item.vote === 'down'}
          icon={<DownvoteIcon secondary={item.vote === 'down'} />}
          onClick={() => vote(item.key, 'down')}
        />
        {bookmark && (
          <Button
            type="button"
            aria-label={
              item.bookmarked ? 'Remove from bookmarks' : 'Save to bookmarks'
            }
            variant={ButtonVariant.Tertiary}
            color={ButtonColor.Bun}
            size={ButtonSize.Small}
            pressed={item.bookmarked}
            icon={<BookmarkIcon secondary={item.bookmarked} />}
            onClick={() => toggleBookmark(item.key)}
          />
        )}
        <CopyLinkButton item={item} />
        <OptionsMenu
          item={item}
          open={open}
          onOpenChange={setOpen}
          withBookmark={!bookmark}
        />
      </div>
    </div>
  );
};

/** Persistent state markers: gray outline icons, quiet like the rest of the meta. */
export const StateMarks = ({
  item,
}: {
  item: HistoryItem;
}): ReactElement | null => {
  if (item.vote !== 'up' && !item.bookmarked) {
    return null;
  }
  return (
    <>
      <Separator />
      <span className="flex items-center gap-1 text-text-tertiary">
        {item.vote === 'up' && (
          <UpvoteIcon size={IconSize.XSmall} aria-label="Upvoted" />
        )}
        {item.bookmarked && (
          <BookmarkIcon size={IconSize.XSmall} aria-label="Saved" />
        )}
      </span>
    </>
  );
};

/* ------------------------------------------------------------------ row */

/**
 * The one share prompt after copying or upvoting (#6860), built from the
 * feed's own parts: SocialIconButton and SlackCtaButton.
 */
export const SharePrompt = ({
  item,
  className,
}: {
  item: HistoryItem;
  className?: string;
}): ReactElement | null => {
  const { prompts, dismissPrompt } = useHistory();
  const kind = prompts[item.key];
  if (!kind) {
    return null;
  }
  const post = fullPost(item.id);
  return (
    <aside
      className={classNames(
        'hx-in mb-2 mr-3 flex items-center gap-3 rounded-16 border border-border-subtlest-tertiary py-2 pl-4 pr-2',
        className,
      )}
    >
      <span className="flex min-w-0 flex-1 items-center gap-1.5 font-bold text-text-tertiary typo-callout">
        {kind === 'copy' && (
          <VIcon
            size={IconSize.Size16}
            className="shrink-0 text-accent-avocado-default"
          />
        )}
        {kind === 'copy'
          ? 'Why not share it on social, too?'
          : 'Should anyone else see this post?'}
      </span>
      <span className="flex gap-1">
        {socials.map((social) => (
          <SocialIconButton
            key={social}
            post={post}
            platform={social}
            size={ButtonSize.Small}
          />
        ))}
      </span>
      <SlackCtaButton
        post={post}
        origin={Origin.History}
        size={ButtonSize.Small}
        variant={ButtonVariant.Float}
      />
      <CloseButton
        size={ButtonSize.Small}
        onClick={() => dismissPrompt(item.key)}
      />
    </aside>
  );
};

/**
 * Production's two empty states as they ship (ReadingHistoryEmptyScreen and
 * SearchEmptyScreen), plus a way out of filters.
 */
export const NoResults = ({
  onReset,
}: {
  onReset?: () => void;
}): ReactElement => {
  const { items } = useHistory();
  if (!items.length) {
    return <ReadingHistoryEmptyScreen />;
  }
  return (
    <div className="flex flex-col items-center gap-4 px-6 py-10 text-center">
      <SearchEmptyScreen />
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
  );
};

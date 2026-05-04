import type { ReactElement } from 'react';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { Command } from 'cmdk';
import ReactModal from 'react-modal';
import { ClearIcon, ClickIcon, SearchIcon } from '../icons';
import { IconSize } from '../Icon';
import { Loader } from '../Loader';
import { ElementPlaceholder } from '../ElementPlaceholder';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { Drawer, DrawerPosition } from '../drawers/Drawer';
import { ViewSize, useViewSize } from '../../hooks';
import { useAuthContext } from '../../contexts/AuthContext';
import { AuthTriggers } from '../../lib/auth';
import {
  isAppleDevice,
  isExtension,
  initReactModal,
  isSpecialKeyPressed,
} from '../../lib/func';
import { fallbackImages } from '../../lib/config';
import {
  groupLabels,
  groupOrder,
  scopeMeta,
  scopeOrder,
  type SpotlightCommand,
  SpotlightGroup,
  SpotlightScope,
} from './types';
import { useSpotlight } from './useSpotlight';
import { useRecentCommands } from './useRecentCommands';
import { useSpotlightCommands } from './useSpotlightCommands';
import { useSpotlightSearchCommands } from './commands/search';
import { ScopeBreadcrumbs } from './ScopeBreadcrumbs';
import { useQuickKeyDispatch } from './useQuickKeyDispatch';

const groupHeadingClass =
  '[&_[cmdk-group-heading]]:sticky [&_[cmdk-group-heading]]:top-0 [&_[cmdk-group-heading]]:z-1 [&_[cmdk-group-heading]]:bg-background-default [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:pl-4 [&_[cmdk-group-heading]]:pr-3 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:tracking-normal [&_[cmdk-group-heading]]:text-text-quaternary';

const firstHeadingNoTopPaddingClass =
  '[&_[cmdk-group]:first-child_[cmdk-group-heading]]:pt-1';

const SUGGESTED_COMMAND_IDS = [
  'create.compose-text',
  'settings.theme',
  'nav.bookmarks',
  'create.feedback',
  'help.shortcuts',
  'nav.plus',
];

const isMac = isAppleDevice();
const cmdLabel = isMac ? '⌘' : 'Ctrl';

interface RowProps {
  command: SpotlightCommand;
  isLoggedIn: boolean;
  isPlus: boolean;
  isMobile?: boolean;
  pendingConfirmId: string | null;
  onSelect: (command: SpotlightCommand) => void;
}

const rowBaseClass =
  'group/spotlight-row mx-2 flex cursor-pointer items-center gap-3 rounded-10 px-3 text-left motion-safe:animate-spotlight-row-in aria-disabled:cursor-not-allowed aria-disabled:opacity-40 data-[selected=true]:bg-surface-hover';

const TypedAvatar = ({
  src,
  alt,
  rounded,
  className,
}: {
  src?: string;
  alt: string;
  rounded: 'full' | '8';
  className?: string;
}): ReactElement => (
  <span
    className={classNames(
      'flex size-6 shrink-0 items-center justify-center overflow-hidden bg-surface-float',
      rounded === 'full' ? 'rounded-full' : 'rounded-6',
      className,
    )}
  >
    <img
      // eslint-disable-next-line jsx-a11y/alt-text
      alt={alt}
      src={src || fallbackImages.avatar}
      className="size-full object-cover"
      loading="lazy"
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        if (target.src !== fallbackImages.avatar) {
          target.src = fallbackImages.avatar;
        }
      }}
    />
  </span>
);

const TagGlyph = (): ReactElement => (
  <span
    aria-hidden
    className="flex size-6 shrink-0 items-center justify-center rounded-6 bg-overlay-active-cabbage text-accent-cabbage-default typo-callout"
  >
    #
  </span>
);

const SeeAllGlyph = (): ReactElement => (
  <span
    aria-hidden
    className="flex size-6 shrink-0 items-center justify-center rounded-6 text-text-tertiary group-data-[selected=true]/spotlight-row:text-text-primary"
  >
    <SearchIcon size={IconSize.XSmall} />
  </span>
);

const TitleSubtitle = ({
  title,
  subtitle,
  showSubtitleAlways = false,
}: {
  title: string;
  subtitle?: string;
  showSubtitleAlways?: boolean;
}): ReactElement => (
  <span className="flex min-w-0 flex-1 items-center gap-2">
    <span className="min-w-0 truncate text-text-primary typo-callout">
      {title}
    </span>
    {subtitle && (
      <span
        className={classNames(
          'min-w-0 shrink truncate text-text-tertiary typo-footnote',
          showSubtitleAlways ? '' : 'hidden tablet:inline',
        )}
      >
        {subtitle}
      </span>
    )}
  </span>
);

const SpotlightRow = ({
  command,
  isLoggedIn,
  isPlus,
  isMobile,
  pendingConfirmId,
  onSelect,
}: RowProps): ReactElement => {
  const Icon = command.icon;
  const isPending = pendingConfirmId === command.id;
  const isPlusGated = command.plusBadge && !isPlus;
  const isAuthGated = command.requiresAuth && !isLoggedIn;
  const { meta } = command;
  const value = `${command.title} ${command.subtitle ?? ''} ${(
    command.keywords ?? []
  ).join(' ')}`.toLowerCase();

  let leading: ReactElement;
  let body: ReactElement;

  if (meta?.kind === 'post') {
    leading = (
      <TypedAvatar
        src={meta.sourceImage}
        alt={meta.sourceName ?? 'Source'}
        rounded="8"
      />
    );
    body = (
      <TitleSubtitle
        title={command.title}
        subtitle={meta.sourceName}
        showSubtitleAlways
      />
    );
  } else if (meta?.kind === 'source') {
    leading = (
      <TypedAvatar src={meta.image} alt={command.title} rounded="full" />
    );
    body = (
      <TitleSubtitle
        title={command.title}
        subtitle={meta.handle}
        showSubtitleAlways
      />
    );
  } else if (meta?.kind === 'user') {
    leading = (
      <TypedAvatar src={meta.image} alt={command.title} rounded="full" />
    );
    body = (
      <TitleSubtitle
        title={command.title}
        subtitle={meta.handle}
        showSubtitleAlways
      />
    );
  } else if (meta?.kind === 'tag') {
    leading = <TagGlyph />;
    body = (
      <span className="min-w-0 flex-1 truncate text-text-primary typo-callout">
        #{meta.tagName}
      </span>
    );
  } else if (meta?.kind === 'see-all') {
    leading = <SeeAllGlyph />;
    body = (
      <span className="min-w-0 flex-1 truncate text-text-tertiary typo-callout group-data-[selected=true]/spotlight-row:text-text-primary">
        {command.title}
      </span>
    );
  } else {
    leading = (
      <span
        className={classNames(
          'flex size-6 shrink-0 items-center justify-center rounded-6 text-text-tertiary',
          'group-data-[selected=true]/spotlight-row:text-text-primary',
          command.destructive &&
            'group-data-[selected=true]/spotlight-row:text-status-error',
        )}
      >
        <Icon size={IconSize.XSmall} aria-hidden />
      </span>
    );
    body = <TitleSubtitle title={command.title} subtitle={command.subtitle} />;
  }

  return (
    <Command.Item
      value={value}
      data-command-id={command.id}
      onSelect={() => onSelect(command)}
      aria-keyshortcuts={command.shortcut}
      className={classNames(
        rowBaseClass,
        isMobile ? 'h-12' : 'h-10',
        command.destructive && 'data-[selected=true]:text-status-error',
      )}
    >
      {leading}
      {body}
      {isAuthGated && (
        <span className="rounded-6 border border-border-subtlest-tertiary px-1.5 py-0.5 text-text-tertiary typo-caption2">
          Sign in
        </span>
      )}
      {isPlusGated && (
        <span className="rounded-6 bg-accent-bacon-subtler px-1.5 py-0.5 text-text-primary typo-caption2">
          Plus
        </span>
      )}
      {isPending && <Loader className="text-text-tertiary" />}
      {!isPending && command.shortcut && (
        <kbd
          aria-hidden
          className="hidden text-text-quaternary typo-caption1 group-data-[selected=true]/spotlight-row:inline tablet:inline"
        >
          {command.shortcut}
        </kbd>
      )}
    </Command.Item>
  );
};

interface RowsProps {
  commands: SpotlightCommand[];
  isLoggedIn: boolean;
  isPlus: boolean;
  isMobile?: boolean;
  pendingConfirmId: string | null;
  onSelect: (command: SpotlightCommand) => void;
}

const renderRows = ({
  commands,
  isLoggedIn,
  isPlus,
  isMobile,
  pendingConfirmId,
  onSelect,
}: RowsProps) =>
  commands.map((command) => (
    <SpotlightRow
      key={command.id}
      command={command}
      isLoggedIn={isLoggedIn}
      isPlus={isPlus}
      isMobile={isMobile}
      pendingConfirmId={pendingConfirmId}
      onSelect={onSelect}
    />
  ));

const SkeletonRows = ({ count = 3 }: { count?: number }) => (
  <div className="flex flex-col gap-0.5 px-2 py-1">
    {Array.from({ length: count }).map((_, i) => (
      <div
        // eslint-disable-next-line react/no-array-index-key
        key={i}
        className="flex h-10 items-center gap-3 px-3"
      >
        <ElementPlaceholder className="size-6 rounded-6" />
        <ElementPlaceholder className="h-3 w-1/2 rounded-6" />
      </div>
    ))}
  </div>
);

interface ConfirmRowProps {
  command: SpotlightCommand;
  onCancel: () => void;
  onConfirm: () => void;
}

const DestructiveConfirm = ({
  command,
  onCancel,
  onConfirm,
}: ConfirmRowProps): ReactElement => (
  <div
    role="alertdialog"
    aria-labelledby="spotlight-confirm-title"
    className="flex flex-col items-stretch gap-3 px-5 py-6"
  >
    <p
      id="spotlight-confirm-title"
      className="font-bold text-text-primary typo-callout"
    >
      {command.id === 'actions.logout'
        ? 'Log out of daily.dev?'
        : `Confirm: ${command.title}`}
    </p>
    <p className="text-text-tertiary typo-footnote">
      Press Enter again to confirm, or Esc to cancel.
    </p>
    <div className="flex gap-3">
      <Button
        type="button"
        variant={ButtonVariant.Secondary}
        size={ButtonSize.Small}
        onClick={onCancel}
        autoFocus
      >
        Cancel
      </Button>
      <Button
        type="button"
        variant={ButtonVariant.Primary}
        size={ButtonSize.Small}
        className="!bg-status-error"
        onClick={onConfirm}
      >
        {command.id === 'actions.logout' ? 'Log out' : 'Continue'}
      </Button>
    </div>
  </div>
);

interface SpotlightDialogProps {
  isOpen: boolean;
  onClose: () => void;
  showShortcutsHelp: () => void;
  /** Optional analytics callback. Injected by Phase 1's wiring. */
  onCommandRun?: (command: SpotlightCommand) => void;
  /** Optional analytics callback for query updates. */
  onQueryChange?: (query: string) => void;
  /** Fires when the user opens via Cmd+K. */
  onOpenViaShortcut?: () => void;
}

interface ShortcutsHelpScreenProps {
  cmdShortcutLabel: string;
  visibleGroupLabels: string[];
  quickKeys: Array<{ key: string; label: string }>;
  onClose: () => void;
}

const ShortcutsHelpScreen = ({
  cmdShortcutLabel,
  visibleGroupLabels,
  quickKeys,
  onClose,
}: ShortcutsHelpScreenProps): ReactElement => {
  const groupShortcuts = visibleGroupLabels.slice(0, 9).map((label, idx) => ({
    combo: `${cmdShortcutLabel}+${idx + 1}`,
    label: `Jump to ${label}`,
  }));
  const rows: Array<{ combo: string; label: string }> = [
    { combo: `${cmdShortcutLabel}+K`, label: 'Open or close Spotlight' },
    { combo: 'Enter', label: 'Run the highlighted command' },
    { combo: '↑ ↓', label: 'Move selection between commands' },
    { combo: 'Tab', label: 'Cycle to the next group' },
    { combo: 'Shift+Tab', label: 'Cycle to the previous group' },
    { combo: 'Alt+1..4', label: 'Jump to a search scope' },
    { combo: 'Backspace', label: 'Clear the active scope (when input empty)' },
    { combo: 'Esc', label: 'Close Spotlight or cancel a confirm' },
    ...groupShortcuts,
  ];
  return (
    <div
      role="dialog"
      aria-label="Spotlight keyboard shortcuts"
      className="flex flex-col gap-4 px-5 py-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-text-primary typo-callout">
          Keyboard shortcuts
        </h3>
        <Button
          type="button"
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          onClick={onClose}
          autoFocus
        >
          Back
        </Button>
      </div>
      <ul className="flex flex-col gap-1.5">
        {rows.map((row) => (
          <li
            key={row.combo}
            className="flex items-center justify-between gap-3 rounded-10 px-3 py-1.5 text-text-secondary typo-footnote hover:bg-surface-hover"
          >
            <span className="text-text-primary">{row.label}</span>
            <kbd className="bg-surface-invert/[0.08] rounded-6 border border-border-subtlest-secondary px-2 py-0.5 text-text-primary typo-caption1">
              {row.combo}
            </kbd>
          </li>
        ))}
      </ul>
      {quickKeys.length > 0 && (
        <div>
          <h4 className="mb-2 font-bold text-text-primary typo-callout">
            Quick Keys
          </h4>
          <p className="mb-3 text-text-tertiary typo-footnote">
            Type two letters then space to run instantly.
          </p>
          <ul className="flex flex-col gap-1.5">
            {quickKeys.map((qk) => (
              <li
                key={qk.key}
                className="flex items-center justify-between gap-3 rounded-10 px-3 py-1.5 text-text-secondary typo-footnote hover:bg-surface-hover"
              >
                <span className="text-text-primary">{qk.label}</span>
                <kbd className="border-accent-cabbage-default/40 flex items-center gap-1 rounded-6 border bg-overlay-active-cabbage px-2 py-0.5 text-accent-cabbage-default typo-caption1">
                  <span className="font-mono font-bold">{qk.key}</span>
                  <span className="opacity-70">+ space</span>
                </kbd>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const Hint = ({ label, combo }: { label: string; combo: string }) => (
  <span className="flex items-center gap-1.5">
    <kbd aria-hidden className="font-mono text-text-quaternary typo-caption1">
      {combo}
    </kbd>
    <span>{label}</span>
  </span>
);

const isInExtensionIframe = (target: EventTarget | null): boolean => {
  if (!isExtension || typeof window === 'undefined') {
    return false;
  }
  const node = target instanceof HTMLElement ? target : null;
  if (!node) {
    return false;
  }
  // If focus is in any iframe owned by the host page rather than the
  // extension's own surface, bail out so we don't steal native browser
  // bindings (Linear-style scoping).
  return node.tagName === 'IFRAME';
};

export const Spotlight = ({
  isOpen,
  onClose,
  showShortcutsHelp,
  onCommandRun,
  onQueryChange,
  onOpenViaShortcut,
}: SpotlightDialogProps): ReactElement | null => {
  const router = useRouter();
  const { isLoggedIn, showLogin } = useAuthContext();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const isMobile = !isLaptop;
  const inputRef = useRef<HTMLInputElement>(null);
  const [resultCount, setResultCount] = useState<number | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [groupCursor, setGroupCursor] = useState(0);
  const handleShowShortcutsHelp = useCallback(() => {
    setShowHelp(true);
    showShortcutsHelp();
  }, [showShortcutsHelp]);
  const { commands, env } = useSpotlightCommands({
    showShortcutsHelp: handleShowShortcutsHelp,
  });
  const {
    recent,
    refresh: refreshRecent,
    push: pushRecent,
  } = useRecentCommands();
  const spotlight = useSpotlight();
  const {
    query,
    setQuery,
    pendingConfirmId,
    requestConfirm,
    clearConfirm,
    scope,
    pushScope,
    popScope,
    clearScope,
  } = spotlight;
  const search = useSpotlightSearchCommands({ router, query });
  useQuickKeyDispatch({
    query,
    setQuery,
    commands,
    scope,
    onDispatch: (command) => {
      onCommandRun?.(command);
      pushRecent(command.id);
      Promise.resolve(command.perform()).finally(() => {
        clearConfirm();
        onClose();
      });
    },
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }
    const handleKeydown = (event: KeyboardEvent) => {
      if (!isSpecialKeyPressed({ event }) || event.key.toLowerCase() !== 'k') {
        return;
      }
      if (isInExtensionIframe(document.activeElement)) {
        return;
      }
      event.preventDefault();
      if (isOpen) {
        onClose();
        return;
      }
      spotlight.open();
      onOpenViaShortcut?.();
    };
    window.addEventListener('keydown', handleKeydown);
    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
  }, [isOpen, onClose, spotlight, onOpenViaShortcut]);

  useEffect(() => {
    if (!isExtension) {
      initReactModal({ modalObject: ReactModal, appElement: '#__next' });
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      refreshRecent();
    } else {
      setShowHelp(false);
    }
  }, [isOpen, refreshRecent]);

  useEffect(() => {
    onQueryChange?.(query);
  }, [query, onQueryChange]);

  const commandById = useMemo(() => {
    const map = new Map<string, SpotlightCommand>();
    commands.forEach((cmd) => map.set(cmd.id, cmd));
    return map;
  }, [commands]);

  const grouped = useMemo(() => {
    const out: Record<SpotlightGroup, SpotlightCommand[]> = {
      [SpotlightGroup.Suggested]: [],
      [SpotlightGroup.Recent]: [],
      [SpotlightGroup.Navigate]: [],
      [SpotlightGroup.Create]: [],
      [SpotlightGroup.Settings]: [],
      [SpotlightGroup.Actions]: [],
      [SpotlightGroup.Search]: [],
      [SpotlightGroup.Help]: [],
    };
    commands.forEach((cmd) => {
      out[cmd.group].push(cmd);
    });
    return out;
  }, [commands]);

  const trimmedQuery = query.trim();
  const isFiltering = trimmedQuery.length > 0;

  const suggested = useMemo(
    () =>
      SUGGESTED_COMMAND_IDS.map((id) => commandById.get(id)).filter(
        (cmd): cmd is SpotlightCommand => !!cmd,
      ),
    [commandById],
  );

  const recentCommands = useMemo(() => {
    if (isFiltering) {
      return [];
    }
    return recent
      .map((entry) => commandById.get(entry.commandId))
      .filter((cmd): cmd is SpotlightCommand => !!cmd);
  }, [recent, commandById, isFiltering]);

  const handleSelect = useCallback(
    (command: SpotlightCommand) => {
      if (command.requiresAuth && !isLoggedIn) {
        showLogin({ trigger: AuthTriggers.SearchInput });
        onClose();
        return;
      }
      if (command.plusBadge && !env.isPlus) {
        // Same friendly behavior — bounce to upgrade flow on the Plus page.
        router.push('/plus');
        onClose();
        return;
      }
      if (command.destructive && pendingConfirmId !== command.id) {
        requestConfirm(command.id);
        return;
      }
      pushRecent(command.id);
      onCommandRun?.(command);
      Promise.resolve(command.perform()).finally(() => {
        clearConfirm();
        onClose();
      });
    },
    [
      isLoggedIn,
      showLogin,
      onClose,
      env.isPlus,
      router,
      pendingConfirmId,
      requestConfirm,
      pushRecent,
      onCommandRun,
      clearConfirm,
    ],
  );

  const handleFallthroughEnter = useCallback(() => {
    if (!trimmedQuery) {
      return;
    }
    const fallthrough = search.fallthrough[0];
    if (fallthrough) {
      handleSelect(fallthrough);
    }
  }, [trimmedQuery, search.fallthrough, handleSelect]);

  /**
   * Groups visible right now (skip Suggested when filtering, etc.). Cmd+1..9
   * and Tab navigate between these in display order.
   */
  const visibleGroups = useMemo<SpotlightGroup[]>(() => {
    if (isFiltering) {
      const filterGroups: SpotlightGroup[] = [];
      groupOrder.forEach((group) => {
        if (
          group === SpotlightGroup.Suggested ||
          group === SpotlightGroup.Recent
        ) {
          return;
        }
        if (grouped[group].length > 0) {
          filterGroups.push(group);
        }
      });
      return filterGroups;
    }
    const out: SpotlightGroup[] = [];
    if (suggested.length > 0) {
      out.push(SpotlightGroup.Suggested);
    }
    if (recentCommands.length > 0) {
      out.push(SpotlightGroup.Recent);
    }
    groupOrder.forEach((group) => {
      if (
        group === SpotlightGroup.Suggested ||
        group === SpotlightGroup.Recent ||
        group === SpotlightGroup.Search
      ) {
        return;
      }
      if (grouped[group].length > 0) {
        out.push(group);
      }
    });
    return out;
  }, [isFiltering, grouped, suggested.length, recentCommands.length]);

  const jumpToGroup = useCallback((group: SpotlightGroup) => {
    const heading = document.querySelector(
      `[cmdk-group][data-spotlight-group="${group}"]`,
    );
    if (heading instanceof HTMLElement) {
      heading.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
  }, []);

  const pendingCommand = pendingConfirmId
    ? commandById.get(pendingConfirmId)
    : null;

  if (!isOpen) {
    return null;
  }

  const commonRowProps = {
    isLoggedIn,
    isPlus: env.isPlus,
    isMobile,
    pendingConfirmId,
    onSelect: handleSelect,
  };

  const paletteBody = (
    <>
      <h2 id="spotlight-title" className="sr-only">
        Spotlight
      </h2>
      <div role="status" aria-live="polite" className="sr-only">
        {resultCount !== null
          ? `${resultCount} ${resultCount === 1 ? 'result' : 'results'}`
          : ''}
      </div>
      <Command
        label="Spotlight command palette"
        loop
        shouldFilter={!pendingCommand}
        className={classNames(
          'flex flex-col overflow-hidden',
          isMobile
            ? 'h-full w-full bg-background-default'
            : 'w-[640px] min-w-[320px] max-w-[calc(100vw-32px)] rounded-16 border border-border-subtlest-tertiary bg-background-default shadow-3 motion-safe:animate-spotlight-panel-in',
        )}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            if (showHelp) {
              event.preventDefault();
              event.stopPropagation();
              setShowHelp(false);
              return;
            }
            if (pendingConfirmId) {
              event.preventDefault();
              event.stopPropagation();
              clearConfirm();
              return;
            }
          }
          if (
            event.altKey &&
            event.key >= '1' &&
            event.key <= '4' &&
            !pendingConfirmId
          ) {
            const idx = Number(event.key) - 1;
            const targetScope = scopeOrder[idx];
            if (targetScope) {
              event.preventDefault();
              event.stopPropagation();
              pushScope(targetScope);
            }
            return;
          }
          if (
            (event.metaKey || event.ctrlKey) &&
            event.key >= '1' &&
            event.key <= '9'
          ) {
            const idx = Number(event.key) - 1;
            const target = visibleGroups[idx];
            if (target) {
              event.preventDefault();
              setGroupCursor(idx);
              jumpToGroup(target);
            }
            return;
          }
          if (event.key === 'Tab' && visibleGroups.length > 0) {
            event.preventDefault();
            const direction = event.shiftKey ? -1 : 1;
            const nextIdx =
              (groupCursor + direction + visibleGroups.length) %
              visibleGroups.length;
            setGroupCursor(nextIdx);
            jumpToGroup(visibleGroups[nextIdx]);
          }
        }}
      >
        {!pendingCommand && (
          <>
            <div
              data-cmdk-input-wrapper=""
              className="flex h-14 items-center gap-3 px-4"
            >
              <SearchIcon
                size={IconSize.Small}
                className="text-text-tertiary transition-colors group-focus-within/spotlight:text-text-primary"
                aria-hidden
              />
              <Command.Input
                ref={inputRef}
                value={query}
                onValueChange={setQuery}
                placeholder={
                  scope === SpotlightScope.All
                    ? 'Search posts, squads, people, tags…'
                    : scopeMeta[scope].placeholder
                }
                autoFocus
                className="h-full flex-1 bg-transparent text-text-primary outline-none typo-body placeholder:text-text-tertiary"
                aria-labelledby="spotlight-title"
                onKeyDown={(event) => {
                  if (
                    event.key === 'Backspace' &&
                    query.length === 0 &&
                    scope !== SpotlightScope.All
                  ) {
                    event.preventDefault();
                    popScope();
                    return;
                  }
                  if (
                    event.key === 'Enter' &&
                    isFiltering &&
                    resultCount === 0
                  ) {
                    event.preventDefault();
                    handleFallthroughEnter();
                  }
                }}
              />
              {search.isLoading && <Loader className="text-text-tertiary" />}
              {query && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => {
                    setQuery('');
                    inputRef.current?.focus();
                  }}
                  className="text-text-tertiary transition-colors hover:text-text-primary"
                >
                  <ClearIcon size={IconSize.XSmall} />
                </button>
              )}
            </div>
            <div className="border-b border-border-subtlest-tertiary">
              <ScopeBreadcrumbs
                scope={scope}
                onSelect={pushScope}
                onClear={clearScope}
              />
            </div>
          </>
        )}

        {pendingCommand && (
          <DestructiveConfirm
            command={pendingCommand}
            onCancel={clearConfirm}
            onConfirm={() => handleSelect(pendingCommand)}
          />
        )}

        {!pendingCommand && showHelp && (
          <ShortcutsHelpScreen
            cmdShortcutLabel={cmdLabel}
            visibleGroupLabels={visibleGroups.map(
              (group) => groupLabels[group],
            )}
            quickKeys={commands
              .filter((cmd): cmd is SpotlightCommand & { quickKey: string } =>
                Boolean(cmd.quickKey),
              )
              .map((cmd) => ({ key: cmd.quickKey, label: cmd.title }))}
            onClose={() => setShowHelp(false)}
          />
        )}

        {!pendingCommand && !showHelp && (
          <Command.List
            key={`spotlight-list-${scope}`}
            className={classNames(
              'overflow-y-auto py-1 motion-safe:animate-spotlight-list-fade',
              firstHeadingNoTopPaddingClass,
              isMobile ? 'flex-1' : 'max-h-[min(640px,60vh)]',
            )}
            onScroll={() => {
              // No-op: cmdk handles selection sync automatically.
            }}
            ref={(node) => {
              if (!node) {
                setResultCount(null);
                return;
              }
              const items = node.querySelectorAll('[data-command-id]');
              setResultCount(items.length);
            }}
          >
            {scope !== SpotlightScope.All && search.isLoading && (
              <Command.Group heading={scopeMeta[scope].label}>
                <SkeletonRows count={4} />
              </Command.Group>
            )}

            {scope !== SpotlightScope.All && !search.isLoading && (
              <Command.Group
                heading={scopeMeta[scope].label}
                data-spotlight-group={SpotlightGroup.Search}
                className={groupHeadingClass}
              >
                {renderRows({
                  ...commonRowProps,
                  commands: (() => {
                    if (scope === SpotlightScope.Posts) {
                      return search.posts;
                    }
                    if (scope === SpotlightScope.Squads) {
                      return search.sources;
                    }
                    if (scope === SpotlightScope.People) {
                      return search.users;
                    }
                    return search.tags;
                  })(),
                })}
              </Command.Group>
            )}

            {scope === SpotlightScope.All &&
              !isFiltering &&
              suggested.length > 0 && (
                <Command.Group
                  heading={groupLabels[SpotlightGroup.Suggested]}
                  data-spotlight-group={SpotlightGroup.Suggested}
                  className={groupHeadingClass}
                >
                  {renderRows({ ...commonRowProps, commands: suggested })}
                </Command.Group>
              )}

            {scope === SpotlightScope.All &&
              !isFiltering &&
              recentCommands.length > 0 && (
                <Command.Group
                  heading={groupLabels[SpotlightGroup.Recent]}
                  data-spotlight-group={SpotlightGroup.Recent}
                  className={groupHeadingClass}
                >
                  {renderRows({ ...commonRowProps, commands: recentCommands })}
                </Command.Group>
              )}

            {scope === SpotlightScope.All &&
              !isFiltering &&
              suggested.length === 0 &&
              recentCommands.length === 0 && (
                <div
                  className="px-4 py-8 text-center text-text-tertiary typo-footnote"
                  aria-hidden
                >
                  <p>Type to search posts, squads, people, tags</p>
                  <p className="mt-1">or pick a scope above with Alt+1..4</p>
                </div>
              )}

            {scope === SpotlightScope.All &&
              isFiltering &&
              groupOrder
                .filter(
                  (group) =>
                    group !== SpotlightGroup.Suggested &&
                    group !== SpotlightGroup.Recent &&
                    group !== SpotlightGroup.Search,
                )
                .map((group) => {
                  const items = grouped[group];
                  if (!items.length) {
                    return null;
                  }
                  return (
                    <Command.Group
                      key={group}
                      heading={groupLabels[group]}
                      data-spotlight-group={group}
                      className={groupHeadingClass}
                    >
                      {renderRows({ ...commonRowProps, commands: items })}
                    </Command.Group>
                  );
                })}

            {scope === SpotlightScope.All &&
              isFiltering &&
              search.isLoading && (
                <Command.Group heading="Posts">
                  <SkeletonRows count={3} />
                </Command.Group>
              )}

            {scope === SpotlightScope.All &&
              isFiltering &&
              !search.isLoading &&
              (search.posts.length > 0 ||
                search.tags.length > 0 ||
                search.sources.length > 0 ||
                search.users.length > 0) && (
                <Command.Group
                  heading={groupLabels[SpotlightGroup.Search]}
                  data-spotlight-group={SpotlightGroup.Search}
                  className={groupHeadingClass}
                >
                  {renderRows({
                    ...commonRowProps,
                    commands: [
                      ...search.posts,
                      ...search.tags,
                      ...search.sources,
                      ...search.users,
                    ],
                  })}
                </Command.Group>
              )}

            {scope === SpotlightScope.All &&
              isFiltering &&
              search.fallthrough.length > 0 && (
                <Command.Group>
                  {renderRows({
                    ...commonRowProps,
                    commands: search.fallthrough,
                  })}
                </Command.Group>
              )}

            <Command.Empty className="flex flex-col items-center gap-2 py-12 text-center">
              <SearchIcon
                size={IconSize.Medium}
                className="text-text-tertiary"
                aria-hidden
              />
              <p className="text-text-primary typo-callout">
                {trimmedQuery
                  ? `Nothing matches "${trimmedQuery}".`
                  : 'No commands available.'}
              </p>
              <p className="text-text-tertiary typo-footnote">
                Try a different word, or search posts on the web.
              </p>
              {trimmedQuery && (
                <Button
                  type="button"
                  variant={ButtonVariant.Primary}
                  size={ButtonSize.Small}
                  onClick={handleFallthroughEnter}
                  icon={<ClickIcon />}
                >
                  Search posts for &ldquo;{trimmedQuery}&rdquo;
                </Button>
              )}
            </Command.Empty>
          </Command.List>
        )}

        <div className="flex h-8 items-center justify-between border-t border-border-subtlest-tertiary bg-background-subtle px-4 text-text-quaternary typo-caption2">
          <span className="flex items-center gap-4">
            <Hint label="Open" combo="↵" />
            <Hint label="Close" combo="esc" />
          </span>
          <button
            type="button"
            onClick={handleShowShortcutsHelp}
            className="text-text-quaternary transition-colors hover:text-text-primary"
          >
            Shortcuts
          </button>
        </div>
      </Command>
    </>
  );

  if (isMobile) {
    return (
      <Drawer
        isOpen
        position={DrawerPosition.Bottom}
        onClose={onClose}
        appendOnRoot
        className={{
          drawer: 'p-0',
          wrapper:
            'flex !h-[90vh] !max-h-[90vh] flex-col overflow-hidden bg-background-default p-0',
        }}
      >
        {paletteBody}
      </Drawer>
    );
  }

  return (
    <ReactModal
      isOpen
      onRequestClose={onClose}
      shouldCloseOnOverlayClick
      shouldCloseOnEsc
      shouldReturnFocusAfterClose
      className="outline-none"
      overlayClassName="fixed inset-0 z-modal flex justify-center items-start pt-[15vh] bg-overlay-quaternary-onion motion-safe:animate-spotlight-scrim-in"
      contentLabel="Spotlight command palette"
      ariaHideApp={!isExtension}
    >
      {paletteBody}
    </ReactModal>
  );
};

export default Spotlight;

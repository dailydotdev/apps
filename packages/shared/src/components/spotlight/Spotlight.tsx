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
import {
  groupLabels,
  groupOrder,
  type SpotlightCommand,
  SpotlightGroup,
} from './types';
import { useSpotlight } from './useSpotlight';
import { useRecentCommands } from './useRecentCommands';
import { useSpotlightCommands } from './useSpotlightCommands';
import { useSpotlightSearchCommands } from './commands/search';

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
  const value = `${command.title} ${command.subtitle ?? ''} ${(
    command.keywords ?? []
  ).join(' ')}`.toLowerCase();

  return (
    <Command.Item
      value={value}
      data-command-id={command.id}
      onSelect={() => onSelect(command)}
      aria-keyshortcuts={command.shortcut}
      className={classNames(
        'group/spotlight-row flex cursor-pointer items-center gap-3 rounded-12 border-l-2 border-transparent px-3 text-left',
        isMobile ? 'h-[52px]' : 'h-11',
        'data-[selected=true]:border-l-accent-cabbage-default data-[selected=true]:bg-surface-hover',
        'aria-disabled:cursor-not-allowed aria-disabled:opacity-40',
        command.destructive && 'data-[selected=true]:text-status-error',
      )}
    >
      <span
        className={classNames(
          'flex size-8 shrink-0 items-center justify-center rounded-10 bg-surface-float text-text-tertiary',
          command.destructive &&
            'group-data-[selected=true]/spotlight-row:bg-status-error/10 group-data-[selected=true]/spotlight-row:text-status-error',
        )}
      >
        <Icon size={IconSize.Small} aria-hidden />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-text-primary typo-callout">
          {command.title}
        </span>
        {command.subtitle && (
          <span className="truncate text-text-tertiary typo-footnote">
            {command.subtitle}
          </span>
        )}
      </span>
      {isAuthGated && (
        <span className="rounded-6 border border-border-subtlest-tertiary px-2 py-0.5 text-text-tertiary typo-caption2">
          Sign in
        </span>
      )}
      {isPlusGated && (
        <span className="rounded-6 bg-accent-bacon-subtler px-2 py-0.5 text-text-primary typo-caption2">
          Plus
        </span>
      )}
      {isPending && <Loader className="text-text-tertiary" />}
      {!isPending && command.shortcut && (
        <kbd
          aria-hidden
          className="rounded-6 border border-border-subtlest-tertiary bg-surface-float px-1.5 py-0.5 text-text-tertiary typo-caption2"
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
  <div className="flex flex-col gap-1 px-3 py-1">
    {Array.from({ length: count }).map((_, i) => (
      <div
        // eslint-disable-next-line react/no-array-index-key
        key={i}
        className="flex h-11 items-center gap-3 px-3"
      >
        <ElementPlaceholder className="size-8 rounded-10" />
        <div className="flex flex-1 flex-col gap-1">
          <ElementPlaceholder className="h-3 w-1/2 rounded-6" />
          <ElementPlaceholder className="h-2 w-1/3 rounded-6" />
        </div>
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
  onClose: () => void;
}

const ShortcutsHelpScreen = ({
  cmdShortcutLabel,
  visibleGroupLabels,
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
    { combo: 'Esc', label: 'Close Spotlight or cancel a confirm' },
    ...groupShortcuts,
  ];
  return (
    <div
      role="dialog"
      aria-label="Spotlight keyboard shortcuts"
      className="flex flex-col gap-3 px-5 py-6"
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
      <ul className="flex flex-col gap-2">
        {rows.map((row) => (
          <li
            key={row.combo}
            className="flex items-center justify-between gap-3 rounded-12 px-3 py-2 text-text-secondary typo-footnote hover:bg-surface-hover"
          >
            <span className="text-text-primary">{row.label}</span>
            <kbd className="rounded-6 border border-border-subtlest-tertiary bg-surface-secondary px-2 py-0.5 text-text-tertiary typo-caption2">
              {row.combo}
            </kbd>
          </li>
        ))}
      </ul>
    </div>
  );
};

const Hint = ({ label, combo }: { label: string; combo: string }) => (
  <span className="flex items-center gap-1.5">
    <kbd
      aria-hidden
      className="rounded-6 border border-border-subtlest-tertiary bg-surface-secondary px-1.5 py-0.5"
    >
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
  const { query, setQuery, pendingConfirmId, requestConfirm, clearConfirm } =
    spotlight;
  const search = useSpotlightSearchCommands({ router, query });

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
            ? 'h-full w-full'
            : 'w-[640px] min-w-[320px] max-w-[calc(100vw-32px)] rounded-16 border border-border-subtlest-tertiary bg-surface-float shadow-2 motion-safe:animate-spotlight-panel-in',
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
          <div
            data-cmdk-input-wrapper=""
            className="flex h-16 items-center gap-3 border-b border-border-subtlest-tertiary px-5"
          >
            <SearchIcon
              size={IconSize.Small}
              className="text-text-tertiary"
              aria-hidden
            />
            <Command.Input
              ref={inputRef}
              value={query}
              onValueChange={setQuery}
              placeholder="Search or jump to..."
              autoFocus
              className="h-full flex-1 bg-transparent text-text-primary outline-none typo-callout placeholder:text-text-tertiary"
              aria-labelledby="spotlight-title"
              onKeyDown={(event) => {
                if (event.key === 'Enter' && isFiltering && resultCount === 0) {
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
            onClose={() => setShowHelp(false)}
          />
        )}

        {!pendingCommand && !showHelp && (
          <Command.List
            className={classNames(
              'overflow-y-auto px-2 py-2',
              isMobile ? 'flex-1' : 'max-h-[min(560px,55vh)]',
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
            {!isFiltering && suggested.length > 0 && (
              <Command.Group
                heading={groupLabels[SpotlightGroup.Suggested]}
                data-spotlight-group={SpotlightGroup.Suggested}
                className="[&_[cmdk-group-heading]]:sticky [&_[cmdk-group-heading]]:top-0 [&_[cmdk-group-heading]]:z-1 [&_[cmdk-group-heading]]:bg-surface-float [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:text-text-tertiary [&_[cmdk-group-heading]]:typo-caption2"
              >
                {renderRows({ ...commonRowProps, commands: suggested })}
              </Command.Group>
            )}

            {!isFiltering && recentCommands.length > 0 && (
              <Command.Group
                heading={groupLabels[SpotlightGroup.Recent]}
                data-spotlight-group={SpotlightGroup.Recent}
                className="[&_[cmdk-group-heading]]:sticky [&_[cmdk-group-heading]]:top-0 [&_[cmdk-group-heading]]:z-1 [&_[cmdk-group-heading]]:bg-surface-float [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:text-text-tertiary [&_[cmdk-group-heading]]:typo-caption2"
              >
                {renderRows({ ...commonRowProps, commands: recentCommands })}
              </Command.Group>
            )}

            {groupOrder
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
                    className="[&_[cmdk-group-heading]]:sticky [&_[cmdk-group-heading]]:top-0 [&_[cmdk-group-heading]]:z-1 [&_[cmdk-group-heading]]:bg-surface-float [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:text-text-tertiary [&_[cmdk-group-heading]]:typo-caption2"
                  >
                    {renderRows({ ...commonRowProps, commands: items })}
                  </Command.Group>
                );
              })}

            {isFiltering && search.isLoading && (
              <Command.Group heading="Posts">
                <SkeletonRows count={3} />
              </Command.Group>
            )}

            {isFiltering &&
              !search.isLoading &&
              (search.posts.length > 0 ||
                search.tags.length > 0 ||
                search.sources.length > 0 ||
                search.users.length > 0) && (
                <Command.Group
                  heading={groupLabels[SpotlightGroup.Search]}
                  data-spotlight-group={SpotlightGroup.Search}
                  className="[&_[cmdk-group-heading]]:sticky [&_[cmdk-group-heading]]:top-0 [&_[cmdk-group-heading]]:z-1 [&_[cmdk-group-heading]]:bg-surface-float [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:text-text-tertiary [&_[cmdk-group-heading]]:typo-caption2"
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

            {isFiltering && search.fallthrough.length > 0 && (
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

        <div className="flex h-9 items-center justify-between border-t border-border-subtlest-tertiary bg-surface-float px-5 text-text-tertiary typo-caption2">
          <span className="flex items-center gap-3">
            <Hint label="Open" combo="↵" />
            <Hint label="Navigate" combo="↑↓" />
            <Hint label="Close" combo="esc" />
          </span>
          <span className="hidden items-center gap-2 laptop:flex">
            <kbd
              aria-hidden
              className="rounded-6 border border-border-subtlest-tertiary bg-surface-secondary px-1.5 py-0.5"
            >
              {cmdLabel}
            </kbd>
            <kbd
              aria-hidden
              className="rounded-6 border border-border-subtlest-tertiary bg-surface-secondary px-1.5 py-0.5"
            >
              K
            </kbd>
            <span>Toggle</span>
          </span>
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
            'flex !h-[90vh] !max-h-[90vh] flex-col overflow-hidden bg-surface-float p-0',
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
      overlayClassName="fixed inset-0 z-modal flex justify-center items-start pt-[15vh] bg-overlay-quaternary-onion backdrop-blur-sm motion-safe:animate-spotlight-scrim-in"
      contentLabel="Spotlight command palette"
      ariaHideApp={!isExtension}
    >
      {paletteBody}
    </ReactModal>
  );
};

export default Spotlight;

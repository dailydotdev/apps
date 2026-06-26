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
import { isExtension } from '../../lib/func';
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
import { useSpotlight } from './SpotlightContext';
import { useRecentCommands } from './useRecentCommands';
import { useSpotlightCommands } from './useSpotlightCommands';
import { useSpotlightSearchCommands } from './commands/search';
import { ScopeBreadcrumbs } from './ScopeBreadcrumbs';
import { ScopeFilterPill } from './ScopeFilterPill';
import { useQuickKeyDispatch } from './useQuickKeyDispatch';
import {
  spotlightCommandFilter,
  SPOTLIGHT_PASSTHROUGH_KEYWORD,
} from './spotlightFilter';
import {
  isSpotlightShortcutDisabled,
  shouldHandleSpotlightShortcut,
} from './shortcuts';

const groupHeadingClass =
  '[&_[cmdk-group-heading]]:sticky [&_[cmdk-group-heading]]:top-0 [&_[cmdk-group-heading]]:z-1 [&_[cmdk-group-heading]]:bg-background-default [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:pl-4 [&_[cmdk-group-heading]]:pr-3 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:text-[0.6875rem] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:tracking-normal [&_[cmdk-group-heading]]:text-text-quaternary';

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

interface RowProps {
  command: SpotlightCommand;
  isLoggedIn: boolean;
  isPlus: boolean;
  isMobile?: boolean;
  pendingConfirmId: string | null;
  onSelect: (command: SpotlightCommand) => void;
}

const rowBaseClass =
  'group/spotlight-row mx-2 flex min-w-0 cursor-pointer items-center gap-3 overflow-hidden rounded-10 px-3 text-left aria-disabled:cursor-not-allowed aria-disabled:opacity-40 data-[selected=true]:bg-surface-hover';

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

type RowParts = { leading: ReactElement; body: ReactElement };

const buildRowParts = (
  command: SpotlightCommand,
  Icon: SpotlightCommand['icon'],
): RowParts => {
  const { meta } = command;
  switch (meta?.kind) {
    case 'post':
      return {
        leading: (
          <TypedAvatar
            src={meta.sourceImage}
            alt={meta.sourceName ?? 'Source'}
            rounded="8"
          />
        ),
        body: (
          <TitleSubtitle
            title={command.title}
            subtitle={meta.sourceName}
            showSubtitleAlways
          />
        ),
      };
    case 'source':
    case 'user':
      return {
        leading: (
          <TypedAvatar src={meta.image} alt={command.title} rounded="full" />
        ),
        body: (
          <TitleSubtitle
            title={command.title}
            subtitle={meta.handle}
            showSubtitleAlways
          />
        ),
      };
    case 'tag':
      return {
        leading: <TagGlyph />,
        body: (
          <span className="min-w-0 flex-1 truncate text-text-primary typo-callout">
            #{meta.tagName}
          </span>
        ),
      };
    case 'see-all':
      return {
        leading: <SeeAllGlyph />,
        body: (
          <span className="min-w-0 flex-1 truncate text-text-tertiary typo-callout group-data-[selected=true]/spotlight-row:text-text-primary">
            {command.title}
          </span>
        ),
      };
    default:
      return {
        leading: (
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
        ),
        body: (
          <TitleSubtitle title={command.title} subtitle={command.subtitle} />
        ),
      };
  }
};

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
  // Backend-driven entity rows (posts/sources/users/tags) and the
  // "see all in <scope>" CTA opt out of cmdk's local filter via this
  // marker keyword. The API already ranked them — re-filtering locally
  // would drop perfectly relevant results when the title doesn't share
  // characters with the query (e.g. tag aliases, handle vs display name).
  const cmdKeywords = meta ? [SPOTLIGHT_PASSTHROUGH_KEYWORD] : undefined;

  const { leading, body } = buildRowParts(command, Icon);

  return (
    <Command.Item
      value={value}
      keywords={cmdKeywords}
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
  /** Optional analytics callback. Injected by Phase 1's wiring. */
  onCommandRun?: (command: SpotlightCommand) => void;
  /** Fires when the user opens via Cmd+K. */
  onOpenViaShortcut?: () => void;
}

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
  onCommandRun,
  onOpenViaShortcut,
}: SpotlightDialogProps): ReactElement | null => {
  const router = useRouter();
  const { isLoggedIn, showLogin } = useAuthContext();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const isMobile = !isLaptop;
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const [resultCount, setResultCount] = useState<number | null>(null);
  const [groupCursor, setGroupCursor] = useState(0);
  const [cmdValue, setCmdValue] = useState('');
  const { commands, env } = useSpotlightCommands();
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
  const runCommand = useCallback(
    (command: SpotlightCommand) => {
      onCommandRun?.(command);
      pushRecent(command.id);
      Promise.resolve(command.perform()).then(
        (result) => {
          clearConfirm();
          const keepOpen =
            !!result && typeof result === 'object' && result.keepOpen === true;
          if (!keepOpen) {
            onClose();
          }
        },
        (error) => {
          clearConfirm();
          onClose();
          throw error;
        },
      );
    },
    [onCommandRun, pushRecent, clearConfirm, onClose],
  );
  const search = useSpotlightSearchCommands({ router, query });
  useQuickKeyDispatch({
    query,
    setQuery,
    commands,
    scope,
    onDispatch: runCommand,
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }
    const handleKeydown = (event: KeyboardEvent) => {
      if (
        !shouldHandleSpotlightShortcut({
          event,
          isShortcutDisabled: isSpotlightShortcutDisabled(),
        })
      ) {
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
    if (isOpen) {
      refreshRecent();
    }
  }, [isOpen, refreshRecent]);

  // When the query changes or async search results land, anchor the list
  // back to the top AND move cmdk's selection onto the new first item.
  // Without this:
  //  - the browser's default `overflow-anchor: auto` keeps the previously-
  //    selected (synchronous) Action row in view, scrolling People / Squads
  //    / Tags / Posts results below the fold the instant they arrive;
  //  - cmdk preserves selection on the old Action row, so arrow keys feel
  //    "stuck at the bottom" while the visible top is the entity hits.
  useEffect(() => {
    if (!listRef.current) {
      return;
    }
    listRef.current.scrollTop = 0;
    const firstItem = listRef.current.querySelector('[cmdk-item]');
    const nextValue = firstItem?.getAttribute('data-value') ?? '';
    setCmdValue(nextValue);
  }, [
    query,
    scope,
    search.isLoading,
    search.users.length,
    search.sources.length,
    search.tags.length,
    search.posts.length,
  ]);

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

  /**
   * Single merged "Suggested actions" bucket when filtering. We keep the
   * generic command rows (nav/create/settings/actions/help) under one
   * heading at the end so entity results lead and actions trail — the
   * order users requested. cmdk still does fuzzy filtering.
   */
  const filterableActionCommands = useMemo(() => {
    if (!isFiltering) {
      return [];
    }
    return [
      ...grouped[SpotlightGroup.Navigate],
      ...grouped[SpotlightGroup.Create],
      ...grouped[SpotlightGroup.Settings],
      ...grouped[SpotlightGroup.Actions],
      ...grouped[SpotlightGroup.Help],
    ];
  }, [grouped, isFiltering]);

  /**
   * Categories rendered by the Actions browse-mode (Apple-Finder
   * equivalent). Order mirrors `groupOrder` so the list matches the
   * mental model used elsewhere in the palette.
   */
  const actionScopeGroups: SpotlightGroup[] = [
    SpotlightGroup.Navigate,
    SpotlightGroup.Create,
    SpotlightGroup.Settings,
    SpotlightGroup.Actions,
    SpotlightGroup.Help,
  ];

  const hasActionCommands = actionScopeGroups.some(
    (group) => grouped[group].length > 0,
  );

  /**
   * Which scope chips to surface below the input. Apple Spotlight pattern:
   * tabs only appear when there's something to filter through (i.e. a
   * query with multi-type results). Idle modal renders nothing here.
   */
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
      runCommand(command);
    },
    [
      isLoggedIn,
      showLogin,
      onClose,
      env.isPlus,
      router,
      pendingConfirmId,
      requestConfirm,
      runCommand,
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
    if (recentCommands.length > 0) {
      out.push(SpotlightGroup.Recent);
    }
    if (suggested.length > 0) {
      out.push(SpotlightGroup.Suggested);
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
        filter={spotlightCommandFilter}
        value={cmdValue}
        onValueChange={setCmdValue}
        className={classNames(
          'flex flex-col overflow-hidden',
          isMobile
            ? 'h-full w-full bg-background-default'
            : 'motion-safe:animate-spotlight-panel-in w-[40rem] min-w-[20rem] max-w-[calc(100vw-2rem)] rounded-16 border border-border-subtlest-tertiary bg-background-default shadow-3',
        )}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
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
            event.key <= '5' &&
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
              className="flex h-14 items-center gap-3 border-b border-border-subtlest-tertiary px-4"
            >
              <SearchIcon
                size={IconSize.Small}
                className="text-text-tertiary transition-colors group-focus-within/spotlight:text-text-primary"
                aria-hidden
              />
              {scope !== SpotlightScope.All && (
                <ScopeFilterPill scope={scope} onRemove={clearScope} />
              )}
              <Command.Input
                ref={inputRef}
                value={query}
                onValueChange={setQuery}
                placeholder={
                  scope === SpotlightScope.All
                    ? 'Search posts, squads, people, tags, or actions…'
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
            {scope === SpotlightScope.All && (
              <ScopeBreadcrumbs scope={scope} onSelect={pushScope} />
            )}
          </>
        )}

        {pendingCommand && (
          <DestructiveConfirm
            command={pendingCommand}
            onCancel={clearConfirm}
            onConfirm={() => handleSelect(pendingCommand)}
          />
        )}

        {!pendingCommand && (
          <Command.List
            key={`spotlight-list-${scope}`}
            className={classNames(
              'motion-safe:animate-spotlight-list-fade overflow-y-auto overflow-x-hidden pb-1 [overflow-anchor:none] [&_*]:[overflow-anchor:none]',
              firstHeadingNoTopPaddingClass,
              isMobile ? 'flex-1' : 'max-h-[min(40rem,60vh)]',
            )}
            ref={(node) => {
              listRef.current = node;
              if (!node) {
                setResultCount(null);
                return;
              }
              const items = node.querySelectorAll('[data-command-id]');
              setResultCount(items.length);
            }}
          >
            {scope !== SpotlightScope.All &&
              scope !== SpotlightScope.Actions &&
              search.isLoading && (
                <Command.Group heading={scopeMeta[scope].label}>
                  <SkeletonRows count={4} />
                </Command.Group>
              )}

            {scope !== SpotlightScope.All &&
              scope !== SpotlightScope.Actions &&
              !search.isLoading && (
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

            {/*
              Actions browse-mode (Apple-Finder "All Apps" equivalent).
              Renders every visible action command grouped by category;
              cmdk's strict filter narrows the list as the user types.
              Empty query = full catalog of actions, exactly what the
              user asked for ("see all the options in the product").
            */}
            {scope === SpotlightScope.Actions &&
              actionScopeGroups.map((group) => (
                <Command.Group
                  key={group}
                  heading={groupLabels[group]}
                  data-spotlight-group={group}
                  className={groupHeadingClass}
                >
                  {renderRows({ ...commonRowProps, commands: grouped[group] })}
                </Command.Group>
              ))}

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
              suggested.length > 0 && (
                <Command.Group
                  heading={groupLabels[SpotlightGroup.Suggested]}
                  data-spotlight-group={SpotlightGroup.Suggested}
                  className={groupHeadingClass}
                >
                  {renderRows({ ...commonRowProps, commands: suggested })}
                </Command.Group>
              )}

            {/*
              No recent or suggested commands to lead with — fall back to the
              full actions catalog so the idle palette shows something to do
              instead of an empty surface. Only render groups that actually
              have commands to avoid bare headings.
            */}
            {scope === SpotlightScope.All &&
              !isFiltering &&
              suggested.length === 0 &&
              recentCommands.length === 0 &&
              hasActionCommands &&
              actionScopeGroups.map((group) =>
                grouped[group].length > 0 ? (
                  <Command.Group
                    key={group}
                    heading={groupLabels[group]}
                    data-spotlight-group={group}
                    className={groupHeadingClass}
                  >
                    {renderRows({
                      ...commonRowProps,
                      commands: grouped[group],
                    })}
                  </Command.Group>
                ) : null,
              )}

            {scope === SpotlightScope.All &&
              !isFiltering &&
              suggested.length === 0 &&
              recentCommands.length === 0 &&
              !hasActionCommands && (
                <div
                  className="px-4 py-8 text-center text-text-tertiary typo-footnote"
                  aria-hidden
                >
                  <p>
                    Type to search posts, squads, people, tags, or browse all
                    actions.
                  </p>
                </div>
              )}

            {scope === SpotlightScope.All &&
              isFiltering &&
              search.isLoading && (
                <Command.Group
                  heading="Searching"
                  className={groupHeadingClass}
                >
                  <SkeletonRows count={3} />
                </Command.Group>
              )}

            {scope === SpotlightScope.All &&
              isFiltering &&
              !search.isLoading &&
              search.users.length > 0 && (
                <Command.Group
                  heading="People"
                  data-spotlight-group={SpotlightGroup.Search}
                  className={groupHeadingClass}
                >
                  {renderRows({ ...commonRowProps, commands: search.users })}
                </Command.Group>
              )}

            {scope === SpotlightScope.All &&
              isFiltering &&
              !search.isLoading &&
              search.sources.length > 0 && (
                <Command.Group
                  heading="Squads & sources"
                  data-spotlight-group={SpotlightGroup.Search}
                  className={groupHeadingClass}
                >
                  {renderRows({ ...commonRowProps, commands: search.sources })}
                </Command.Group>
              )}

            {scope === SpotlightScope.All &&
              isFiltering &&
              !search.isLoading &&
              search.tags.length > 0 && (
                <Command.Group
                  heading="Tags"
                  data-spotlight-group={SpotlightGroup.Search}
                  className={groupHeadingClass}
                >
                  {renderRows({ ...commonRowProps, commands: search.tags })}
                </Command.Group>
              )}

            {scope === SpotlightScope.All &&
              isFiltering &&
              !search.isLoading &&
              search.posts.length > 0 && (
                <Command.Group
                  heading="Posts"
                  data-spotlight-group={SpotlightGroup.Search}
                  className={groupHeadingClass}
                >
                  {renderRows({ ...commonRowProps, commands: search.posts })}
                </Command.Group>
              )}

            {scope === SpotlightScope.All &&
              isFiltering &&
              filterableActionCommands.length > 0 && (
                <Command.Group
                  heading="Actions"
                  data-spotlight-group={SpotlightGroup.Actions}
                  className={groupHeadingClass}
                >
                  {renderRows({
                    ...commonRowProps,
                    commands: filterableActionCommands,
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

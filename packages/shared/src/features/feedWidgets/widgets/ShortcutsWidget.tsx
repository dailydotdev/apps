import type {
  CSSProperties,
  KeyboardEvent,
  ReactElement,
  ReactNode,
} from 'react';
import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import { useSettingsContext } from '../../../contexts/SettingsContext';
import { useLogContext } from '../../../contexts/LogContext';
import { useLazyModal } from '../../../hooks/useLazyModal';
import { useToastNotification } from '../../../hooks/useToastNotification';
import { useThemedAsset } from '../../../hooks/utils/useThemedAsset';
import useLogEventOnce from '../../../hooks/log/useLogEventOnce';
import { LazyModal } from '../../../components/modals/common/types';
import {
  LogEvent,
  Origin,
  ShortcutsSourceType,
  TargetType,
} from '../../../lib/log';
import { checkIsExtension } from '../../../lib/func';
import { apiUrl } from '../../../lib/config';
import { getDomainFromUrl } from '../../../lib/links';
import { combinedClicks } from '../../../lib/click';
import {
  cloudinaryShortcutsIconsGmail,
  cloudinaryShortcutsIconsOpenai,
  cloudinaryShortcutsIconsReddit,
  cloudinaryShortcutsIconsStackoverflow,
} from '../../../lib/image';
import { Button } from '../../../components/buttons/Button';
import { ButtonSize, ButtonVariant } from '../../../components/buttons/common';
import { Switch } from '../../../components/fields/Switch';
import { IconSize } from '../../../components/Icon';
import { ShortcutsIcon } from '../../../components/icons/Shortcuts';
import { TrendingIcon } from '../../../components/icons/Trending';
import { SettingsIcon } from '../../../components/icons/Settings';
import { DownloadIcon } from '../../../components/icons/Download';
import { EditIcon } from '../../../components/icons/Edit';
import { PlusIcon } from '../../../components/icons/Plus';
import { ShortcutTile } from '../../shortcuts/components/ShortcutTile';
import { AddShortcutTile } from '../../shortcuts/components/AddShortcutTile';
import { useShortcuts } from '../../shortcuts/contexts/ShortcutsProvider';
import { useManualShortcutsRow } from '../../shortcuts/hooks/useManualShortcutsRow';
import { useHiddenTopSites } from '../../shortcuts/hooks/useHiddenTopSites';
import type { Shortcut, ShortcutsAppearance } from '../../shortcuts/types';
import {
  DEFAULT_SHORTCUTS_APPEARANCE,
  MAX_SHORTCUTS,
} from '../../shortcuts/types';
import type { FeedWidgetComponentProps } from '../registry';
import type { FeedWidgetConfig } from '../types';
import { FeedWidgetKind, FeedWidgetSize } from '../types';
import { FeedWidgetEmpty } from '../FeedWidgetFrame';
import { useWidgetScroll } from '../useWidgetScroll';

type Source = 'mine' | 'visited';
type ShortcutsConfig = FeedWidgetConfig<FeedWidgetKind.Shortcuts>;
type Layout = NonNullable<ShortcutsConfig['layout']>;

// A launcher, a soft blue from the glyph, kept low under the favicons' own
// colors.
const launcherStyle: CSSProperties = {
  backgroundImage:
    'radial-gradient(90% 60% at 0% 0%, color-mix(in srgb, var(--theme-accent-water-default) 16%, transparent) 0%, transparent 70%)',
};

const FAVICON_SIZE = 48;

const gridCapacity: Record<FeedWidgetSize, number> = {
  [FeedWidgetSize.Small]: 8,
  [FeedWidgetSize.Tall]: MAX_SHORTCUTS,
  [FeedWidgetSize.Large]: MAX_SHORTCUTS,
};

// Chips stack two to a row with the widget's usual gap, so a Small cell
// holds three rows of them.
const SMALL_CHIP_CAPACITY = 6;

const gridColumns: Record<FeedWidgetSize, string> = {
  [FeedWidgetSize.Small]: 'grid-cols-4',
  [FeedWidgetSize.Tall]: 'grid-cols-3',
  [FeedWidgetSize.Large]: 'grid-cols-4',
};

// The rail's cells are shorter than a tile's own padding allows for two
// rows, so Small and Large trim it.
const gridSpacing: Record<FeedWidgetSize, string> = {
  [FeedWidgetSize.Small]: 'mt-1 gap-y-0',
  [FeedWidgetSize.Tall]: 'mt-2 gap-y-1.5',
  [FeedWidgetSize.Large]: 'mt-2 gap-y-3',
};

const ShortcutFavicon = ({
  shortcut,
  className,
}: {
  shortcut: Shortcut;
  className: string;
}): ReactElement => {
  const iconService = `${apiUrl}/icon?url=${encodeURIComponent(
    shortcut.url,
  )}&size=${FAVICON_SIZE}`;
  const [failed, setFailed] = useState<string[]>([]);
  const src = [shortcut.iconUrl, iconService].find(
    (candidate) => !!candidate && !failed.includes(candidate),
  );

  if (!src) {
    return (
      <span
        aria-hidden
        className="font-bold uppercase text-text-tertiary typo-footnote"
      >
        {(shortcut.name || getDomainFromUrl(shortcut.url)).charAt(0)}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt=""
      draggable={false}
      onError={() => setFailed((current) => [...current, src])}
      className={classNames('rounded-4', className)}
    />
  );
};

const WidgetHeader = ({
  icon = (
    <ShortcutsIcon
      secondary
      size={IconSize.Size16}
      className="shrink-0 text-accent-water-default"
    />
  ),
  children = 'Shortcuts',
  trailing,
}: {
  icon?: ReactElement;
  children?: ReactNode;
  trailing?: ReactNode;
}): ReactElement => (
  <header className="flex h-6 min-w-0 shrink-0 items-center gap-1.5">
    {icon}
    <span className="flex min-w-0 flex-1 items-center truncate font-bold text-text-primary typo-caption1">
      {children}
    </span>
    {trailing}
  </header>
);

const sourceLabels: [Source, string][] = [
  ['mine', 'Shortcuts'],
  ['visited', 'Most visited'],
];

/** The two sources as the header's title: the one you are on reads bold. */
const SourceTabs = ({
  id,
  source,
  onChange,
}: {
  id: string;
  source: Source;
  onChange: (source: Source) => void;
}): ReactElement => {
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
      return;
    }
    event.preventDefault();
    const sibling = (event.currentTarget.nextElementSibling ??
      event.currentTarget.previousElementSibling) as HTMLElement | null;
    sibling?.focus();
    onChange(source === 'mine' ? 'visited' : 'mine');
  };

  return (
    <span role="tablist" aria-label="Shortcut lists" className="flex gap-3">
      {sourceLabels.map(([value, label]) => (
        <button
          key={value}
          id={`${id}-tab-${value}`}
          type="button"
          role="tab"
          aria-selected={value === source}
          aria-controls={`${id}-panel`}
          tabIndex={value === source ? 0 : -1}
          onClick={() => onChange(value)}
          onKeyDown={onKeyDown}
          className={classNames(
            'truncate transition-colors typo-caption1',
            value === source
              ? 'font-bold text-text-primary'
              : 'font-normal text-text-tertiary hover:text-text-secondary',
          )}
        >
          {label}
        </button>
      ))}
    </span>
  );
};

const GearButton = ({
  buttonRef,
  onClick,
}: {
  buttonRef: React.Ref<HTMLButtonElement>;
  onClick: () => void;
}): ReactElement => (
  <Button
    ref={buttonRef}
    type="button"
    aria-label="Shortcut settings"
    title="Shortcut settings"
    variant={ButtonVariant.Tertiary}
    size={ButtonSize.XSmall}
    icon={<SettingsIcon />}
    onClick={onClick}
    className="-mr-1 shrink-0"
  />
);

type SitesProps = {
  shortcuts: Shortcut[];
  size: FeedWidgetSize;
  appearance: ShortcutsAppearance;
  /** The reader's own list: edited from its tiles, ending in the add tile. */
  isMine: boolean;
  onAdd: () => void;
  onEdit: (shortcut: Shortcut) => void;
  onRemove: (shortcut: Shortcut) => void;
  onClick: () => void;
};

const SitesGrid = ({
  shortcuts,
  size,
  appearance,
  isMine,
  onAdd,
  onEdit,
  onRemove,
  onClick,
}: SitesProps): ReactElement => {
  const isChip = appearance === 'chip';
  const canAdd = isMine && shortcuts.length < MAX_SHORTCUTS;
  const capacity =
    isChip && size === FeedWidgetSize.Small
      ? SMALL_CHIP_CAPACITY
      : gridCapacity[size];
  const shown = shortcuts.slice(0, capacity - (canAdd ? 1 : 0));
  const isLarge = size === FeedWidgetSize.Large && appearance === 'tile';
  // Each tile fills its cell and centers there, so both sides of the grid
  // get the same space at every size.
  const tileClassName = classNames(
    '!w-full',
    isChip && '!max-w-none',
    appearance === 'tile' && size !== FeedWidgetSize.Tall && '!py-1',
  );

  return (
    <div
      className={classNames(
        'grid shrink-0 content-start justify-items-center',
        isChip ? 'mt-2 grid-cols-2 gap-2' : gridColumns[size],
        !isChip && classNames('gap-x-1', gridSpacing[size]),
      )}
    >
      {shown.map((shortcut) => (
        <ShortcutTile
          key={shortcut.url}
          shortcut={shortcut}
          appearance={appearance}
          draggable={false}
          isLarge={isLarge}
          onClick={onClick}
          onEdit={isMine ? onEdit : undefined}
          onRemove={onRemove}
          removeLabel={isMine ? 'Remove' : 'Hide'}
          className={tileClassName}
        />
      ))}
      {canAdd && (
        <AddShortcutTile
          appearance={appearance}
          isLarge={isLarge}
          onClick={onAdd}
          className={tileClassName}
        />
      )}
    </div>
  );
};

/** A row per site, name first and the domain under it. */
const SitesList = ({
  shortcuts,
  size,
  isMine,
  onAdd,
  onClick,
}: Pick<
  SitesProps,
  'shortcuts' | 'size' | 'isMine' | 'onAdd' | 'onClick'
>): ReactElement => {
  const scroll = useWidgetScroll();
  // Large holds all of them as two columns of six that share the height,
  // reading down then across; the others scroll.
  const isLarge = size === FeedWidgetSize.Large;
  const canAdd = isMine && shortcuts.length < MAX_SHORTCUTS;
  const iconBox = isLarge ? 'size-10 rounded-12' : 'size-8 rounded-10';
  const rowClassName = classNames(
    'flex w-full items-center gap-3 rounded-12 px-2 text-left transition-colors hover:bg-surface-hover focus-visible:bg-surface-hover motion-reduce:transition-none',
    isLarge ? 'h-full' : 'py-1.5',
  );
  const items = (
    <>
      {shortcuts.map((shortcut) => (
        <li key={shortcut.url} className="min-h-0 snap-start">
          <a
            href={shortcut.url}
            rel="noopener noreferrer"
            {...combinedClicks(onClick)}
            className={rowClassName}
          >
            <span
              className={classNames(
                'flex shrink-0 items-center justify-center bg-surface-float',
                iconBox,
              )}
            >
              <ShortcutFavicon
                shortcut={shortcut}
                className={isLarge ? 'size-5' : 'size-4'}
              />
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span
                className={classNames(
                  'truncate font-bold text-text-primary',
                  isLarge ? 'typo-callout' : 'typo-footnote',
                )}
              >
                {shortcut.name || getDomainFromUrl(shortcut.url)}
              </span>
              <span className="truncate text-text-tertiary typo-caption1">
                {getDomainFromUrl(shortcut.url)}
              </span>
            </span>
          </a>
        </li>
      ))}
      {canAdd && (
        <li className="min-h-0 snap-start">
          <button
            type="button"
            onClick={onAdd}
            className={classNames(
              rowClassName,
              'text-text-tertiary hover:text-text-primary',
            )}
          >
            <span
              className={classNames(
                'flex shrink-0 items-center justify-center border border-dashed border-border-subtlest-secondary',
                iconBox,
              )}
            >
              <PlusIcon size={IconSize.Size16} />
            </span>
            <span className="font-bold typo-footnote">Add shortcut</span>
          </button>
        </li>
      )}
    </>
  );

  if (isLarge) {
    return (
      <ul className="-mx-2 mt-2 grid min-h-0 flex-1 grid-flow-col grid-rows-6 gap-x-6">
        {items}
      </ul>
    );
  }

  return (
    <div
      ref={scroll.ref}
      onScroll={scroll.onScroll}
      style={scroll.style}
      className={classNames('-mx-2 mt-2 px-2', scroll.className)}
    >
      <ul className="-mx-2 flex flex-col gap-0.5">{items}</ul>
    </div>
  );
};

const Sites = ({
  layout,
  ...props
}: SitesProps & { layout: Layout }): ReactElement =>
  layout === 'list' ? <SitesList {...props} /> : <SitesGrid {...props} />;

/** Favicons waiting to be filled, behind an empty state's ask. */
const PlaceholderIcons = ({
  count,
  isMuted,
  isInColumn,
  className,
}: {
  count: number;
  /** Most visited before the browser has said yes. */
  isMuted?: boolean;
  /** One side of Large, where the ask sits in its own dashed box. */
  isInColumn?: boolean;
  className?: string;
}): ReactElement => {
  const { githubShortcut } = useThemedAsset();
  const icons = [
    githubShortcut,
    cloudinaryShortcutsIconsGmail,
    cloudinaryShortcutsIconsStackoverflow,
    cloudinaryShortcutsIconsOpenai,
    cloudinaryShortcutsIconsReddit,
  ].slice(0, count);
  const isCompact = isMuted || isInColumn;

  return (
    <span
      aria-hidden
      className={classNames('flex', isCompact ? 'gap-1.5' : 'gap-2', className)}
    >
      {icons.map((icon) => (
        <span
          key={icon}
          className={classNames(
            'flex aspect-square min-w-0 shrink items-center justify-center rounded-12',
            isCompact ? 'w-9' : 'w-10',
            isInColumn
              ? 'bg-surface-float'
              : 'border border-dashed border-border-subtlest-secondary',
          )}
        >
          <img
            src={icon}
            alt=""
            loading="lazy"
            className={classNames(
              'object-contain',
              isCompact ? 'size-4' : 'size-5',
              isMuted && 'opacity-40 grayscale',
              !isMuted && (isInColumn ? 'opacity-64' : 'opacity-50'),
            )}
          />
        </span>
      ))}
    </span>
  );
};

const mostVisitedAsk = {
  title: 'Your most visited sites, one click away.',
  note: 'Your browser asks once. The list never leaves this device.',
  action: 'Show most visited',
};

const noHistoryMessage =
  'Nothing visited yet. Check back after browsing a few sites.';

/** The rail's empty state, which brings its own side padding. */
const VisitedEmpty = ({ isPending }: { isPending?: boolean }): ReactElement => (
  <div className="-mx-4 mt-2 flex min-h-0 flex-1 flex-col">
    <FeedWidgetEmpty
      kind={FeedWidgetKind.Shortcuts}
      isPending={isPending}
      message={noHistoryMessage}
    />
  </div>
);

/** A whole widget with nothing to show yet: the reason and its actions. */
const WidgetAsk = ({
  size,
  isMuted,
  title,
  note,
  children,
}: {
  size: FeedWidgetSize;
  isMuted?: boolean;
  title: string;
  note: string;
  children: ReactNode;
}): ReactElement => {
  const isSmall = size === FeedWidgetSize.Small;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PlaceholderIcons
        count={isSmall && !isMuted ? 4 : 5}
        isMuted={isMuted}
        className="mt-3"
      />
      <span className="mt-3 font-bold text-text-primary typo-callout">
        {title}
      </span>
      {!isSmall && (
        <span className="mt-1 text-text-tertiary typo-footnote">{note}</span>
      )}
      <div
        className={classNames(
          'mt-auto flex gap-2 pt-2',
          size === FeedWidgetSize.Tall ? 'flex-col' : 'items-center',
        )}
      >
        {children}
      </div>
    </div>
  );
};

/** One side of Large with nothing to show yet: the ask, in its column. */
const ColumnAsk = ({
  isMuted,
  title,
  note,
  children,
}: {
  isMuted?: boolean;
  title: string;
  note?: string;
  children?: ReactNode;
}): ReactElement => (
  <div className="mt-3 flex min-h-0 flex-1 flex-col items-center justify-center gap-3 rounded-16 border border-dashed border-border-subtlest-secondary p-4 text-center">
    <PlaceholderIcons count={4} isMuted={isMuted} isInColumn />
    <span className="flex flex-col gap-1">
      <span className="font-bold text-text-primary typo-footnote">{title}</span>
      {!!note && (
        <span className="text-text-tertiary typo-caption1">{note}</span>
      )}
    </span>
    {children}
  </div>
);

// Rows share the widget's height between a list row and a tight one, so the
// webapp's two rows get the room and the extension's four still fit Small.
const settingRowClassName =
  'flex max-h-10 min-h-8 flex-1 items-center border-b border-border-subtlest-tertiary last:border-0';

const SettingRow = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}): ReactElement => (
  <div className={classNames(settingRowClassName, 'justify-between gap-3')}>
    <span className="truncate text-text-primary typo-footnote">{label}</span>
    {children}
  </div>
);

const SettingAction = ({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: ReactElement;
  onClick: () => void;
}): ReactElement => (
  <button
    type="button"
    onClick={onClick}
    className={classNames(
      settingRowClassName,
      'w-full gap-2 text-left text-text-primary transition-colors hover:text-accent-water-default',
    )}
  >
    <span className="flex-1 truncate typo-footnote">{label}</span>
    <span className="shrink-0 text-text-tertiary">{icon}</span>
  </button>
);

const layoutLabels: [Layout, string][] = [
  ['grid', 'Grid'],
  ['list', 'List'],
];

/**
 * The widget turned over, the way iOS edits a widget, sized to fit even a
 * Small widget so nothing is clipped by a menu. Most visited and bookmarks
 * need the browser's APIs, so the webapp keeps layout and managing only.
 */
const ShortcutsSettings = ({
  widgetId,
  size,
  isExtension,
  canConfigure,
  layout,
  onLayout,
  showMostVisited,
  onToggleMostVisited,
  onImportBookmarks,
  onManage,
  onDone,
  doneRef,
}: {
  widgetId: string;
  size: FeedWidgetSize;
  isExtension: boolean;
  canConfigure: boolean;
  layout: Layout;
  onLayout: (layout: Layout) => void;
  showMostVisited: boolean;
  onToggleMostVisited: () => void;
  onImportBookmarks: () => void;
  onManage: () => void;
  onDone: () => void;
  doneRef: React.Ref<HTMLButtonElement>;
}): ReactElement => (
  <>
    <WidgetHeader
      trailing={
        <Button
          ref={doneRef}
          type="button"
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.XSmall}
          onClick={onDone}
          className="-mr-2"
        >
          Done
        </Button>
      }
    />
    <div
      className={classNames(
        'mt-2 flex min-h-0 flex-1 flex-col',
        size === FeedWidgetSize.Large && 'max-w-80',
      )}
    >
      <SettingRow label="Layout">
        <span className="flex rounded-8 bg-surface-float p-0.5">
          {layoutLabels.map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={layout === value}
              disabled={!canConfigure}
              onClick={() => onLayout(value)}
              className={classNames(
                'h-6 rounded-6 px-2 typo-caption1 disabled:cursor-not-allowed',
                layout === value
                  ? 'bg-background-default font-bold text-text-primary shadow-2'
                  : 'text-text-tertiary hover:text-text-primary',
              )}
            >
              {label}
            </button>
          ))}
        </span>
      </SettingRow>
      {isExtension && (
        <SettingRow label="Most visited sites">
          <Switch
            inputId={`shortcuts-most-visited-${widgetId}`}
            name="shortcuts-most-visited"
            checked={showMostVisited}
            disabled={!canConfigure}
            onToggle={onToggleMostVisited}
            aria-label="Most visited sites"
            compact
          />
        </SettingRow>
      )}
      {isExtension && (
        <SettingAction
          label="Import bookmarks"
          icon={<DownloadIcon size={IconSize.Size16} />}
          onClick={onImportBookmarks}
        />
      )}
      <SettingAction
        label="Manage shortcuts"
        icon={<EditIcon size={IconSize.Size16} />}
        onClick={onManage}
      />
    </div>
  </>
);

/**
 * The shortcuts row as a widget. The reader's own list is for everyone; the
 * browser's most visited sites and the bookmarks import need the extension,
 * so on the webapp it shows only the reader's shortcuts.
 */
export const ShortcutsWidget = ({
  widget,
  size,
  onConfigChange,
  canConfigure,
}: FeedWidgetComponentProps<FeedWidgetKind.Shortcuts>): ReactElement => {
  const isExtension = checkIsExtension();
  const { flags } = useSettingsContext();
  const { logEvent } = useLogContext();
  const { openModal } = useLazyModal();
  const { displayToast } = useToastNotification();
  const manualRow = useManualShortcutsRow();
  const {
    topSites,
    hasCheckedPermission,
    askTopSitesPermission,
    setShowImportSource,
  } = useShortcuts();
  const {
    hidden: hiddenTopSites,
    hide: hideTopSite,
    unhide: unhideTopSite,
  } = useHiddenTopSites();
  const tabsId = useId();
  const [source, setSource] = useState<Source>('mine');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const gearRef = useRef<HTMLButtonElement>(null);
  const doneRef = useRef<HTMLButtonElement>(null);
  const hasToggledSettingsRef = useRef(false);
  const unhideTopSiteRef = useRef(unhideTopSite);
  unhideTopSiteRef.current = unhideTopSite;

  useEffect(() => {
    if (!hasToggledSettingsRef.current) {
      return;
    }
    (isSettingsOpen ? doneRef : gearRef).current?.focus();
  }, [isSettingsOpen]);

  const toggleSettings = (isOpen: boolean) => {
    hasToggledSettingsRef.current = true;
    setIsSettingsOpen(isOpen);
  };

  const config = widget.config ?? {};
  const layout = config.layout ?? 'grid';
  const showMostVisited = config.showMostVisited ?? true;
  const hasMostVisited = isExtension && showMostVisited;
  const shownSource = hasMostVisited ? source : 'mine';
  const appearance: ShortcutsAppearance =
    flags?.shortcutsAppearance ?? DEFAULT_SHORTCUTS_APPEARANCE;

  const visited = useMemo<Shortcut[]>(() => {
    const hidden = new Set(hiddenTopSites);
    return (topSites ?? [])
      .filter((site) => !hidden.has(site.url))
      .slice(0, MAX_SHORTCUTS)
      .map((site) => ({ url: site.url, name: site.title || undefined }));
  }, [topSites, hiddenTopSites]);
  const isVisitedPending = !hasCheckedPermission;
  const isVisitedAllowed = hasCheckedPermission && topSites !== undefined;

  useLogEventOnce(() => ({
    event_name: LogEvent.Impression,
    target_type: TargetType.Shortcuts,
    extra: JSON.stringify({
      source: ShortcutsSourceType.Custom,
      origin: Origin.FeedWidgets,
    }),
  }));

  const logClick = useCallback(
    (from: Source) =>
      logEvent({
        event_name: LogEvent.Click,
        target_type: TargetType.Shortcuts,
        extra: JSON.stringify({
          source:
            from === 'mine'
              ? ShortcutsSourceType.Custom
              : ShortcutsSourceType.Browser,
          origin: Origin.FeedWidgets,
        }),
      }),
    [logEvent],
  );

  // A site can't be deleted from the browser's history, so a hidden one is
  // remembered on this device, as the shortcuts row does.
  const onHideTopSite = (shortcut: Shortcut) => {
    hideTopSite(shortcut.url);
    displayToast(`Hidden ${shortcut.name || getDomainFromUrl(shortcut.url)}`, {
      action: {
        copy: 'Undo',
        onClick: () => unhideTopSiteRef.current(shortcut.url),
      },
    });
  };

  const onImportBookmarks = () => setShowImportSource?.('bookmarks');
  const onManage = () =>
    openModal({
      type: LazyModal.ShortcutsManage,
      props: { showRowSettings: false },
    });
  const updateConfig = (patch: ShortcutsConfig) =>
    onConfigChange({ ...config, ...patch });

  const mineProps: SitesProps = {
    shortcuts: manualRow.shortcuts,
    size,
    appearance,
    isMine: true,
    onAdd: manualRow.onAdd,
    onEdit: manualRow.onEdit,
    onRemove: manualRow.onRemove,
    onClick: () => logClick('mine'),
  };
  const visitedProps: SitesProps = {
    shortcuts: visited,
    size,
    appearance,
    isMine: false,
    onAdd: manualRow.onAdd,
    onEdit: manualRow.onEdit,
    onRemove: onHideTopSite,
    onClick: () => logClick('visited'),
  };
  const addButton = (isFullWidth: boolean) => (
    <Button
      type="button"
      variant={ButtonVariant.Primary}
      size={ButtonSize.Small}
      onClick={manualRow.onAdd}
      className={isFullWidth ? 'w-full' : undefined}
    >
      Add shortcuts
    </Button>
  );
  const askButton = (
    <Button
      type="button"
      variant={ButtonVariant.Primary}
      size={ButtonSize.Small}
      onClick={askTopSitesPermission}
    >
      {mostVisitedAsk.action}
    </Button>
  );
  const gear = (
    <GearButton buttonRef={gearRef} onClick={() => toggleSettings(true)} />
  );

  const renderMine = (): ReactElement => {
    if (manualRow.shortcuts.length) {
      return <Sites layout={layout} {...mineProps} />;
    }
    const isTall = size === FeedWidgetSize.Tall;
    return (
      <WidgetAsk
        size={size}
        title="Pin the sites you open every day."
        note={
          isExtension
            ? 'Add them one by one, or bring over your bookmarks bar.'
            : 'Add the sites you open most, one by one.'
        }
      >
        {addButton(isTall)}
        {isExtension && size !== FeedWidgetSize.Small && (
          <Button
            type="button"
            variant={ButtonVariant.Float}
            size={ButtonSize.Small}
            icon={<DownloadIcon />}
            onClick={onImportBookmarks}
            className={isTall ? 'w-full' : undefined}
          >
            Import bookmarks
          </Button>
        )}
      </WidgetAsk>
    );
  };

  const renderVisited = (): ReactElement => {
    if (isVisitedPending) {
      return <VisitedEmpty isPending />;
    }
    if (!isVisitedAllowed) {
      return (
        <WidgetAsk
          size={size}
          isMuted
          title={mostVisitedAsk.title}
          note={mostVisitedAsk.note}
        >
          {askButton}
        </WidgetAsk>
      );
    }
    if (!visited.length) {
      return <VisitedEmpty />;
    }
    return <Sites layout={layout} {...visitedProps} />;
  };

  let content: ReactNode;
  if (isSettingsOpen) {
    content = (
      <ShortcutsSettings
        widgetId={widget.id}
        size={size}
        isExtension={isExtension}
        canConfigure={canConfigure}
        layout={layout}
        onLayout={(next) => updateConfig({ layout: next })}
        showMostVisited={showMostVisited}
        onToggleMostVisited={() =>
          updateConfig({ showMostVisited: !showMostVisited })
        }
        onImportBookmarks={onImportBookmarks}
        onManage={onManage}
        onDone={() => toggleSettings(false)}
        doneRef={doneRef}
      />
    );
  } else if (size === FeedWidgetSize.Large && hasMostVisited) {
    // Large has room for both lists, side by side under their own names, so
    // it needs no tabs. Each column lays out as a Tall widget would.
    const columnMine = { ...mineProps, size: FeedWidgetSize.Tall };
    const columnVisited = { ...visitedProps, size: FeedWidgetSize.Tall };
    let visitedColumn: ReactElement;
    if (isVisitedPending) {
      visitedColumn = <VisitedEmpty isPending />;
    } else if (!isVisitedAllowed) {
      visitedColumn = (
        <ColumnAsk
          isMuted
          title={mostVisitedAsk.title}
          note={mostVisitedAsk.note}
        >
          {askButton}
        </ColumnAsk>
      );
    } else if (!visited.length) {
      visitedColumn = <ColumnAsk isMuted title={noHistoryMessage} />;
    } else {
      visitedColumn = <Sites layout={layout} {...columnVisited} />;
    }

    content = (
      <>
        <div className="flex h-6 shrink-0 gap-12">
          <div className="min-w-0 flex-1">
            <WidgetHeader />
          </div>
          <div className="min-w-0 flex-1">
            <WidgetHeader
              icon={
                <TrendingIcon
                  secondary
                  size={IconSize.Size16}
                  className="shrink-0 text-accent-water-default"
                />
              }
              trailing={gear}
            >
              Most visited
            </WidgetHeader>
          </div>
        </div>
        <div className="flex min-h-0 flex-1 gap-12">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            {manualRow.shortcuts.length ? (
              <Sites layout={layout} {...columnMine} />
            ) : (
              <ColumnAsk title="Pin the sites you open every day.">
                {addButton(false)}
              </ColumnAsk>
            )}
          </div>
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            {visitedColumn}
          </div>
        </div>
      </>
    );
  } else {
    content = (
      <>
        <WidgetHeader trailing={gear}>
          {hasMostVisited ? (
            <SourceTabs id={tabsId} source={source} onChange={setSource} />
          ) : (
            'Shortcuts'
          )}
        </WidgetHeader>
        <div
          className="flex min-h-0 flex-1 flex-col"
          {...(hasMostVisited && {
            id: `${tabsId}-panel`,
            role: 'tabpanel',
            'aria-labelledby': `${tabsId}-tab-${shownSource}`,
          })}
        >
          {shownSource === 'mine' ? renderMine() : renderVisited()}
        </div>
      </>
    );
  }

  return (
    <div
      className="relative isolate flex min-h-0 min-w-0 flex-1 flex-col px-4"
      data-size={size}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-4 -z-1"
        style={launcherStyle}
      />
      {content}
    </div>
  );
};

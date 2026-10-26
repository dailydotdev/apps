import type { CSSProperties, ReactElement, ReactNode } from 'react';
import React, { useCallback, useMemo, useState } from 'react';
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
  const [src, setSrc] = useState<string | null>(
    shortcut.iconUrl || iconService,
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
      onError={() => setSrc(src === iconService ? null : iconService)}
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
  source,
  onChange,
}: {
  source: Source;
  onChange: (source: Source) => void;
}): ReactElement => (
  <span role="tablist" aria-label="Shortcut lists" className="flex gap-3">
    {sourceLabels.map(([value, label]) => (
      <button
        key={value}
        type="button"
        role="tab"
        aria-selected={value === source}
        onClick={() => onChange(value)}
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

const GearButton = ({ onClick }: { onClick: () => void }): ReactElement => (
  <Button
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
  const canAdd = isMine && shortcuts.length < MAX_SHORTCUTS;
  const shown = shortcuts.slice(0, gridCapacity[size] - (canAdd ? 1 : 0));
  const isChip = appearance === 'chip';
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
        'grid shrink-0 content-start justify-items-center gap-x-1',
        isChip ? 'mt-2 grid-cols-2 gap-y-0.5' : gridColumns[size],
        !isChip && gridSpacing[size],
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
            onClick={onClick}
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
  className,
}: {
  count: number;
  /** Most visited before the browser has said yes. */
  isMuted?: boolean;
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

  return (
    <span aria-hidden className={classNames('flex gap-2', className)}>
      {icons.map((icon) => (
        <span
          key={icon}
          className="flex size-10 items-center justify-center rounded-12 border border-dashed border-border-subtlest-secondary"
        >
          <img
            src={icon}
            alt=""
            loading="lazy"
            className={classNames(
              'size-5 object-contain',
              isMuted ? 'opacity-40 grayscale' : 'opacity-50',
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
        count={isSmall ? 4 : 5}
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
    <PlaceholderIcons count={4} isMuted={isMuted} className="gap-1.5" />
    <span className="flex flex-col gap-1">
      <span className="font-bold text-text-primary typo-footnote">{title}</span>
      {!!note && (
        <span className="text-text-tertiary typo-caption1">{note}</span>
      )}
    </span>
    {children}
  </div>
);

const SettingRow = ({
  label,
  isCompact,
  children,
}: {
  label: string;
  isCompact: boolean;
  children: ReactNode;
}): ReactElement => (
  <div
    className={classNames(
      'flex items-center justify-between gap-3 border-b border-border-subtlest-tertiary last:border-0',
      isCompact ? 'h-8' : 'h-10',
    )}
  >
    <span className="truncate text-text-primary typo-footnote">{label}</span>
    {children}
  </div>
);

const SettingAction = ({
  label,
  icon,
  isCompact,
  onClick,
}: {
  label: string;
  icon: ReactElement;
  isCompact: boolean;
  onClick: () => void;
}): ReactElement => (
  <button
    type="button"
    onClick={onClick}
    className={classNames(
      'flex w-full items-center gap-2 border-b border-border-subtlest-tertiary text-left text-text-primary transition-colors last:border-0 hover:text-accent-water-default',
      isCompact ? 'h-8' : 'h-10',
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
}): ReactElement => {
  const isCompact = size === FeedWidgetSize.Small;

  return (
    <>
      <WidgetHeader
        trailing={
          <Button
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
          'flex flex-col',
          isCompact ? 'mt-1' : 'mt-3',
          size === FeedWidgetSize.Large && 'max-w-80',
        )}
      >
        <SettingRow label="Layout" isCompact={isCompact}>
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
          <SettingRow label="Most visited sites" isCompact={isCompact}>
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
            isCompact={isCompact}
            onClick={onImportBookmarks}
          />
        )}
        <SettingAction
          label="Manage shortcuts"
          icon={<EditIcon size={IconSize.Size16} />}
          isCompact={isCompact}
          onClick={onManage}
        />
      </div>
    </>
  );
};

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
  const [source, setSource] = useState<Source>('mine');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
      action: { copy: 'Undo', onClick: () => unhideTopSite(shortcut.url) },
    });
  };

  const onImportBookmarks = () => setShowImportSource?.('bookmarks');
  const onManage = () => openModal({ type: LazyModal.ShortcutsManage });
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
  const gear = <GearButton onClick={() => setIsSettingsOpen(true)} />;

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
        onDone={() => setIsSettingsOpen(false)}
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
            <SourceTabs source={source} onChange={setSource} />
          ) : (
            'Shortcuts'
          )}
        </WidgetHeader>
        {shownSource === 'mine' ? renderMine() : renderVisited()}
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

import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import { Switch } from '../../../../components/fields/Switch';
import {
  BookmarkIcon,
  EarthIcon,
  LinkIcon,
  RefreshIcon,
} from '../../../../components/icons';
import { ChromeIcon } from '../../../../components/icons/Browser/Chrome';
import { SectionHeader } from './ShortcutsManageCommon';

function ShortcutsModeOption({
  id,
  checked,
  onSelect,
  title,
  description,
  trailingBadge,
}: {
  id: string;
  checked: boolean;
  onSelect: () => void;
  title: string;
  description: string;
  trailingBadge?: ReactElement;
}): ReactElement {
  return (
    <label
      htmlFor={id}
      className="group flex cursor-pointer items-start gap-3 rounded-10 p-2 transition-colors duration-150 hover:bg-surface-float motion-reduce:transition-none"
    >
      <input
        id={id}
        type="radio"
        name="shortcuts-mode"
        checked={checked}
        onChange={onSelect}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className={classNames(
          'mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-150 motion-reduce:transition-none',
          checked
            ? 'border-accent-cabbage-default'
            : 'border-border-subtlest-secondary group-hover:border-border-subtlest-primary',
        )}
      >
        {checked && (
          <span className="size-2 rounded-full bg-accent-cabbage-default" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p
          className={classNames(
            'typo-callout',
            checked ? 'font-bold text-text-primary' : 'text-text-primary',
          )}
        >
          {title}
        </p>
        <p className="mt-0.5 text-text-tertiary typo-caption1">{description}</p>
      </div>
      {trailingBadge && (
        <span
          aria-hidden
          className="mt-0.5 flex size-5 shrink-0 items-center justify-center"
        >
          {trailingBadge}
        </span>
      )}
    </label>
  );
}

interface ShortcutsModeSectionProps {
  mode: 'manual' | 'auto';
  onSelectMode: (next: 'manual' | 'auto') => void;
}

export function ShortcutsModeSection({
  mode,
  onSelectMode,
}: ShortcutsModeSectionProps): ReactElement {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="contents">
        <SectionHeader
          title="Source"
          description="Choose where this row gets its shortcuts from."
        />
      </legend>
      <div className="flex flex-col gap-1">
        <ShortcutsModeOption
          id="shortcuts-mode-manual"
          checked={mode === 'manual'}
          onSelect={() => onSelectMode('manual')}
          title="My shortcuts"
          description="Curated by you. Add, edit, and reorder."
        />
        <ShortcutsModeOption
          id="shortcuts-mode-auto"
          checked={mode === 'auto'}
          onSelect={() => onSelectMode('auto')}
          title="Most visited sites"
          description="Pulled automatically from your browser history."
          trailingBadge={<ChromeIcon className="size-5" />}
        />
      </div>
    </fieldset>
  );
}

interface ConnectionRowProps {
  icon: ReactElement;
  label: string;
  description: string;
  primaryLabel?: string;
  onPrimary?: () => void | Promise<unknown>;
  secondaryLabel?: string;
  onSecondary?: () => void | Promise<unknown>;
  trailing?: ReactElement;
}

function ConnectionRow({
  icon,
  label,
  description,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  trailing,
}: ConnectionRowProps): ReactElement {
  return (
    <li className="flex items-center gap-3 rounded-10 p-2 transition-colors duration-150 hover:bg-surface-float motion-reduce:transition-none">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-8 bg-surface-float text-text-tertiary">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-text-primary typo-callout">{label}</p>
        <p className="truncate text-text-tertiary typo-caption1">
          {description}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {trailing ?? (
          <>
            {secondaryLabel && (
              <Button
                type="button"
                variant={ButtonVariant.Tertiary}
                size={ButtonSize.XSmall}
                onClick={onSecondary}
              >
                {secondaryLabel}
              </Button>
            )}
            {primaryLabel && (
              <Button
                type="button"
                variant={ButtonVariant.Float}
                size={ButtonSize.XSmall}
                disabled={!onPrimary}
                onClick={onPrimary}
              >
                {primaryLabel}
              </Button>
            )}
          </>
        )}
      </div>
    </li>
  );
}

interface AutoConnectionsSectionProps {
  topSitesGranted: boolean;
  topSitesKnown: boolean;
  topSitesCount: number;
  hiddenTopSitesCount: number;
  onImportTopSites?: () => void;
  onAskTopSites?: () => Promise<boolean> | void;
  onRevokeTopSites?: () => Promise<void> | void;
  onRestoreHiddenTopSites: () => void;
}

export function AutoConnectionsSection({
  topSitesGranted,
  topSitesKnown,
  topSitesCount,
  hiddenTopSitesCount,
  onImportTopSites,
  onAskTopSites,
  onRevokeTopSites,
  onRestoreHiddenTopSites,
}: AutoConnectionsSectionProps): ReactElement {
  return (
    <section aria-label="Connections" className="flex flex-col gap-2">
      <SectionHeader
        title="Connections"
        description="Pull your most visited sites from your browser."
      />
      <ul className="flex flex-col gap-0.5">
        <ConnectionRow
          icon={<LinkIcon />}
          label="Browser access"
          description={
            topSitesKnown
              ? `${topSitesCount} sites available from your browser.`
              : 'Grant access so we can read your most visited sites.'
          }
          primaryLabel={topSitesGranted ? 'Import' : 'Connect'}
          onPrimary={topSitesGranted ? onImportTopSites : onAskTopSites}
          secondaryLabel={topSitesGranted ? 'Disconnect' : undefined}
          onSecondary={topSitesGranted ? () => onRevokeTopSites?.() : undefined}
        />
        {hiddenTopSitesCount > 0 && (
          <ConnectionRow
            icon={<RefreshIcon />}
            label={`Hidden sites (${hiddenTopSitesCount})`}
            description="Restore sites you removed from your Most visited row."
            primaryLabel="Restore all"
            onPrimary={onRestoreHiddenTopSites}
          />
        )}
      </ul>
    </section>
  );
}

interface BrowserConnectionsSectionProps {
  bookmarksGranted: boolean;
  bookmarksCount: number;
  bookmarksKnown: boolean;
  showOnWebapp: boolean;
  onToggleShowOnWebapp: () => void;
  onImportBookmarks?: () => void;
  onAskBookmarks?: () => void | Promise<boolean>;
  onRevokeBookmarks?: () => void | Promise<void>;
}

export function BrowserConnectionsSection({
  bookmarksGranted,
  bookmarksCount,
  bookmarksKnown,
  showOnWebapp,
  onToggleShowOnWebapp,
  onImportBookmarks,
  onAskBookmarks,
  onRevokeBookmarks,
}: BrowserConnectionsSectionProps): ReactElement {
  return (
    <section aria-label="Connections" className="flex flex-col gap-2">
      <SectionHeader
        title="Connections"
        description="Pull from your browser, or mirror your shortcuts on the daily.dev web app."
      />
      <ul className="flex flex-col gap-0.5">
        <ConnectionRow
          icon={<BookmarkIcon />}
          label="Bookmarks bar"
          description={
            bookmarksKnown
              ? `${bookmarksCount} available`
              : 'Grant access to import your browser bookmarks.'
          }
          primaryLabel={bookmarksGranted ? 'Import' : 'Connect'}
          onPrimary={bookmarksGranted ? onImportBookmarks : onAskBookmarks}
          secondaryLabel={bookmarksGranted ? 'Disconnect' : undefined}
          onSecondary={
            bookmarksGranted ? () => onRevokeBookmarks?.() : undefined
          }
        />
        <ConnectionRow
          icon={<EarthIcon />}
          label="Show on daily.dev web app"
          description="Mirror these shortcuts across every signed-in browser."
          trailing={
            <Switch
              inputId="shortcuts-show-on-webapp"
              name="shortcuts-show-on-webapp"
              compact={false}
              checked={showOnWebapp}
              onToggle={onToggleShowOnWebapp}
              aria-label="Show shortcuts on daily.dev web app"
            />
          }
        />
      </ul>
    </section>
  );
}

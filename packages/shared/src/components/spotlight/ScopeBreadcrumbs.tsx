import type { ComponentType, ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  ClearIcon,
  DocsIcon,
  HashtagIcon,
  SquadIcon,
  UserIcon,
} from '../icons';
import type { IconProps } from '../Icon';
import { IconSize } from '../Icon';
import { isAppleDevice } from '../../lib/func';
import { scopeMeta, scopeOrder, SpotlightScope } from './types';

interface ScopeBreadcrumbsProps {
  scope: SpotlightScope;
  /** When `scope === All`, only chips for these scopes render (Apple-style
   *  context tabs). Pass an empty array to render no chips. */
  availableScopes?: Array<Exclude<SpotlightScope, SpotlightScope.All>>;
  onSelect: (scope: SpotlightScope) => void;
  onClear: () => void;
}

const altLabel = isAppleDevice() ? '⌥' : 'Alt';

const scopeIcons: Record<
  Exclude<SpotlightScope, SpotlightScope.All>,
  ComponentType<IconProps>
> = {
  [SpotlightScope.Posts]: DocsIcon,
  [SpotlightScope.Squads]: SquadIcon,
  [SpotlightScope.People]: UserIcon,
  [SpotlightScope.Tags]: HashtagIcon,
};

/**
 * Apple-Tahoe browse-mode equivalent shown directly under the search input.
 * When `scope === All` we render four ghost chips advertising the available
 * scopes. When a scope is active we render only that scope as a removable
 * breadcrumb (cmdk-pages convention: "you are here, press Backspace to
 * go back").
 */
export const ScopeBreadcrumbs = ({
  scope,
  availableScopes,
  onSelect,
  onClear,
}: ScopeBreadcrumbsProps): ReactElement | null => {
  if (scope !== SpotlightScope.All) {
    const meta = scopeMeta[scope];
    const Icon = scopeIcons[scope];
    return (
      <div
        role="navigation"
        aria-label="Active search scope"
        className="flex items-center gap-2 px-4 pb-2 pt-1.5"
      >
        <span className="border-accent-cabbage-default/40 flex items-center gap-1.5 rounded-8 border bg-overlay-active-cabbage px-2 py-1 text-accent-cabbage-default typo-caption1">
          <Icon size={IconSize.XSmall} aria-hidden />
          <span className="font-medium">{meta.label}</span>
          <button
            type="button"
            aria-label={`Clear ${meta.label} scope (Backspace)`}
            onClick={onClear}
            className="opacity-60 -m-0.5 ml-0.5 rounded-full p-0.5 transition-opacity hover:opacity-100"
          >
            <ClearIcon size={IconSize.XSmall} aria-hidden />
          </button>
        </span>
      </div>
    );
  }

  // In `All` scope only render chips for scopes we've been told are
  // available (i.e. have current results). Stay quiet otherwise.
  const chips = availableScopes ?? [];
  if (chips.length === 0) {
    return null;
  }

  // Preserve canonical order regardless of the order callers pass.
  const ordered = scopeOrder.filter((s) => chips.includes(s));

  return (
    <div
      role="navigation"
      aria-label="Filter results by type"
      className="flex items-center gap-1 overflow-x-auto px-3 pb-1.5 pt-1"
    >
      {ordered.map((s) => {
        const meta = scopeMeta[s];
        const Icon = scopeIcons[s];
        return (
          <button
            key={s}
            type="button"
            data-testid={`scope-chip-${s}`}
            aria-keyshortcuts={`Alt+${meta.shortcutIndex}`}
            onClick={() => onSelect(s)}
            title={`${meta.triggerLabel} (${altLabel}+${meta.shortcutIndex})`}
            className={classNames(
              'flex shrink-0 items-center gap-1.5 rounded-8 px-2 py-1 text-text-tertiary transition-colors typo-caption1',
              'hover:bg-surface-hover hover:text-text-primary',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cabbage-default focus-visible:ring-offset-1',
            )}
          >
            <Icon size={IconSize.XSmall} aria-hidden />
            <span>{meta.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ScopeBreadcrumbs;

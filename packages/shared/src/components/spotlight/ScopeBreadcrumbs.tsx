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
  onSelect,
  onClear,
}: ScopeBreadcrumbsProps): ReactElement => {
  if (scope !== SpotlightScope.All) {
    const meta = scopeMeta[scope];
    const Icon = scopeIcons[scope];
    return (
      <div
        role="navigation"
        aria-label="Active search scope"
        className="flex items-center gap-2 px-4 pb-2 pt-2"
      >
        <span className="flex items-center gap-1.5 rounded-8 bg-accent-cabbage-default px-2 py-1 text-text-primary typo-caption1">
          <Icon size={IconSize.XSmall} aria-hidden />
          <span className="font-bold">{meta.label}</span>
          <button
            type="button"
            aria-label={`Clear ${meta.label} scope (Backspace)`}
            onClick={onClear}
            className="opacity-70 -m-0.5 ml-0.5 rounded-full p-0.5 text-text-primary transition-opacity hover:opacity-100"
          >
            <ClearIcon size={IconSize.XSmall} aria-hidden />
          </button>
        </span>
        <span className="text-text-tertiary typo-caption1">
          Backspace to clear
        </span>
      </div>
    );
  }

  return (
    <div
      role="navigation"
      aria-label="Search scopes"
      className="flex items-center gap-1.5 overflow-x-auto px-4 pb-2 pt-1.5"
    >
      {scopeOrder.map((s) => {
        const meta = scopeMeta[s];
        const Icon = scopeIcons[s];
        return (
          <button
            key={s}
            type="button"
            data-testid={`scope-chip-${s}`}
            aria-keyshortcuts={`Alt+${meta.shortcutIndex}`}
            onClick={() => onSelect(s)}
            className={classNames(
              'flex shrink-0 items-center gap-1.5 rounded-8 border border-border-subtlest-tertiary bg-background-subtle px-2 py-1 text-text-secondary transition-all typo-caption1',
              'hover:border-border-subtlest-secondary hover:bg-surface-hover hover:text-text-primary',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cabbage-default focus-visible:ring-offset-1',
            )}
          >
            <Icon size={IconSize.XSmall} aria-hidden />
            <span>{meta.label}</span>
            <span className="text-text-tertiary">
              {altLabel}+{meta.shortcutIndex}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default ScopeBreadcrumbs;

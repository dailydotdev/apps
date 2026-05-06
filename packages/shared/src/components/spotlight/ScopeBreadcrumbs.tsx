import type { ComponentType, ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  DocsIcon,
  HashtagIcon,
  SquadIcon,
  TerminalIcon,
  UserIcon,
} from '../icons';
import type { IconProps } from '../Icon';
import { IconSize } from '../Icon';
import { isAppleDevice } from '../../lib/func';
import { scopeMeta, scopeOrder, SpotlightScope } from './types';

interface ScopeBreadcrumbsProps {
  scope: SpotlightScope;
  onSelect: (scope: SpotlightScope) => void;
}

const altLabel = isAppleDevice() ? '⌥' : 'Alt';

export const scopeIcons: Record<
  Exclude<SpotlightScope, SpotlightScope.All>,
  ComponentType<IconProps>
> = {
  [SpotlightScope.Actions]: TerminalIcon,
  [SpotlightScope.Posts]: DocsIcon,
  [SpotlightScope.Squads]: SquadIcon,
  [SpotlightScope.People]: UserIcon,
  [SpotlightScope.Tags]: HashtagIcon,
};

/**
 * Filter chips shown directly under the search input.
 *
 * When `scope === All` we render every available filter as a calm,
 * uniform tab bar — no "available vs dimmed" two-tone (it was confusing
 * which were clickable). Picking one is a one-way move: the chip
 * collapses into a pill inside the input field (Slack / Apple Spotlight
 * Tahoe pattern) and this bar disappears, so we return null to keep the
 * surface uncluttered.
 *
 * To leave the active scope the user clicks the in-input pill or hits
 * Backspace on an empty input — both are wired up in `Spotlight.tsx`.
 */
export const ScopeBreadcrumbs = ({
  scope,
  onSelect,
}: ScopeBreadcrumbsProps): ReactElement | null => {
  if (scope !== SpotlightScope.All) {
    return null;
  }

  return (
    <div
      role="navigation"
      aria-label="Filter results by type"
      className="flex items-center gap-2 overflow-x-auto px-4 pb-2 pt-3"
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
            title={`${meta.triggerLabel} (${altLabel}+${meta.shortcutIndex})`}
            className={classNames(
              'flex h-8 shrink-0 items-center gap-1.5 rounded-10 border px-3 transition-all typo-callout',
              'border-border-subtlest-tertiary bg-surface-float text-text-tertiary',
              'hover:-translate-y-px hover:border-border-subtlest-secondary hover:bg-surface-hover hover:text-text-primary hover:shadow-2',
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

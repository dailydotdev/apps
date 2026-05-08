import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { IconSize } from '../Icon';
import { isAppleDevice } from '../../lib/func';
import type { SpotlightScope } from './types';
import { scopeMeta } from './types';
import { scopeIcons } from './ScopeBreadcrumbs';

interface ScopeFilterPillProps {
  scope: Exclude<SpotlightScope, SpotlightScope.All>;
  onRemove: () => void;
}

const backspaceLabel = isAppleDevice() ? '⌫' : 'Backspace';

/**
 * Slack/Apple-Tahoe-style search token shown inside the input field at
 * the start of the query. Replaces the old "active scope chip with X
 * button" treatment — clicking the pill OR pressing Backspace on an
 * empty input removes it (the latter is wired up by the input's own
 * `onKeyDown`, this component just exposes the click affordance).
 *
 * The pill is intentionally calm (subtle background, no accent color)
 * so it reads as "context for the input" rather than as a destructive
 * action.
 */
export const ScopeFilterPill = ({
  scope,
  onRemove,
}: ScopeFilterPillProps): ReactElement => {
  const meta = scopeMeta[scope];
  const Icon = scopeIcons[scope];

  return (
    <button
      type="button"
      onClick={onRemove}
      data-testid="scope-filter-pill"
      aria-label={`Filtering by ${meta.label}. Click or press ${backspaceLabel} to remove.`}
      title={`Press ${backspaceLabel} to remove filter`}
      className={classNames(
        'flex h-7 shrink-0 items-center gap-1.5 rounded-8 bg-background-subtle px-2 transition-colors',
        'text-text-primary typo-callout',
        'hover:bg-surface-hover',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cabbage-default focus-visible:ring-offset-1',
      )}
    >
      <Icon size={IconSize.XSmall} aria-hidden />
      <span className="font-medium">{meta.label}</span>
    </button>
  );
};

export default ScopeFilterPill;

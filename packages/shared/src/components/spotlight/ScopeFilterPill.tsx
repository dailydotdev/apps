import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { IconSize } from '../Icon';
import { isAppleDevice } from '../../lib/func';
import type { SpotlightScope, SpotlightSource } from './types';
import { scopeMeta } from './types';
import { scopeIcons, SourceAvatar } from './ScopeBreadcrumbs';

interface ScopeFilterPillProps {
  scope: Exclude<SpotlightScope, SpotlightScope.All>;
  onRemove: () => void;
}

const backspaceLabel = isAppleDevice() ? '⌫' : 'Backspace';

const FilterPill = ({
  label,
  leading,
  ariaLabel,
  testId,
  onRemove,
}: {
  label: string;
  leading: ReactNode;
  ariaLabel: string;
  testId: string;
  onRemove: () => void;
}): ReactElement => (
  <button
    type="button"
    onClick={onRemove}
    data-testid={testId}
    aria-label={ariaLabel}
    title={`Press ${backspaceLabel} to remove filter`}
    className={classNames(
      'flex h-7 min-w-0 shrink-0 items-center gap-1.5 rounded-8 bg-background-subtle px-2 transition-colors',
      'text-text-primary typo-callout',
      'mouse:hover:bg-surface-hover',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cabbage-default focus-visible:ring-offset-1',
    )}
  >
    {leading}
    <span className="truncate font-medium">{label}</span>
  </button>
);

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
    <FilterPill
      label={meta.label}
      leading={<Icon size={IconSize.XSmall} aria-hidden />}
      ariaLabel={`Filtering by ${meta.label}. Click or press ${backspaceLabel} to remove.`}
      testId="scope-filter-pill"
      onRemove={onRemove}
    />
  );
};

/**
 * The squad a Spotlight session is narrowed to, as the same in-field token.
 * Removing it widens the search to all of daily.dev.
 */
export const SourceFilterPill = ({
  source,
  onRemove,
}: {
  source: SpotlightSource;
  onRemove: () => void;
}): ReactElement => (
  <FilterPill
    label={source.name}
    leading={<SourceAvatar source={source} />}
    ariaLabel={`Searching in ${source.name}. Click or press ${backspaceLabel} to search all of daily.dev.`}
    testId="source-filter-pill"
    onRemove={onRemove}
  />
);

export default ScopeFilterPill;

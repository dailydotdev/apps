import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';

interface SectionRuleProps {
  label: string;
  meta?: ReactNode;
  className?: string;
}

/**
 * Editorial section divider used across the Field Report surfaces.
 * Renders an uppercase monospace label, a hairline that fills the row,
 * and optional right-aligned metadata. Reads like a section break in a
 * field report or newsroom briefing.
 */
export const SectionRule = ({
  label,
  meta,
  className,
}: SectionRuleProps): ReactElement => (
  <div
    className={classNames(
      'flex items-center gap-3 text-text-tertiary',
      className,
    )}
  >
    <span className="font-mono font-semibold uppercase tracking-[0.18em] text-text-secondary typo-caption2">
      {label}
    </span>
    <span aria-hidden className="h-px flex-1 bg-border-subtlest-secondary" />
    {meta && (
      <span className="font-mono uppercase tracking-[0.14em] text-text-tertiary typo-caption2">
        {meta}
      </span>
    )}
  </div>
);

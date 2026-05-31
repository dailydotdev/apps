import type { ReactElement } from 'react';
import React from 'react';
import { largeNumberFormat } from '@dailydotdev/shared/src/lib/numberFormat';

interface TagKeyFactsProps {
  occurrences?: number;
  relatedTopicsCount?: number;
  contributorsCount?: number;
  createdAt?: Date | string;
}

interface Fact {
  value: string;
  label: string;
}

/**
 * "At a glance" — a scannable strip of real, data-backed stats that gives the
 * tag page an authoritative, directory-style identity above the fold. Every
 * value comes from data we already have; facts without data are dropped so the
 * strip never shows a hollow "0".
 */
export function TagKeyFacts({
  occurrences,
  relatedTopicsCount,
  contributorsCount,
  createdAt,
}: TagKeyFactsProps): ReactElement | null {
  const facts: Fact[] = [];

  if (occurrences && occurrences > 0) {
    facts.push({
      value: largeNumberFormat(occurrences) ?? `${occurrences}`,
      label: 'Posts',
    });
  }
  if (relatedTopicsCount && relatedTopicsCount > 0) {
    facts.push({ value: `${relatedTopicsCount}`, label: 'Topics' });
  }
  if (contributorsCount && contributorsCount > 0) {
    facts.push({ value: `${contributorsCount}`, label: 'Contributors' });
  }
  facts.push({ value: 'Daily', label: 'Updates' });
  if (createdAt) {
    const year = new Date(createdAt).getFullYear();
    if (!Number.isNaN(year)) {
      facts.push({ value: `${year}`, label: 'Since' });
    }
  }

  if (facts.length === 0) {
    return null;
  }

  return (
    <dl className="flex flex-wrap gap-3">
      {facts.map((fact) => (
        <div
          key={fact.label}
          className="flex min-w-24 flex-1 flex-col gap-0.5 rounded-12 border border-border-subtlest-tertiary px-4 py-3"
        >
          <dt className="order-2 text-text-tertiary typo-caption1">
            {fact.label}
          </dt>
          <dd className="order-1 font-bold typo-title3">{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}

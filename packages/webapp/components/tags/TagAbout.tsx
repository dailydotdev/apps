import type { ReactElement } from 'react';
import React from 'react';
import { InfoIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { largeNumberFormat } from '@dailydotdev/shared/src/lib/numberFormat';
import { TagModule } from './TagModule';

interface TagAboutProps {
  title: string;
  description?: string;
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
 * "About #{tag}" — the topic's definition plus a compact key-facts grid. This
 * is the page's main editorial substance (and a `DefinedTerm` target for SEO /
 * answer engines), kept tidy inside a single hub module.
 */
export function TagAbout({
  title,
  description,
  occurrences,
  relatedTopicsCount,
  contributorsCount,
  createdAt,
}: TagAboutProps): ReactElement | null {
  const facts: Fact[] = [];
  if (occurrences && occurrences > 0) {
    facts.push({
      value: largeNumberFormat(occurrences) ?? `${occurrences}`,
      label: 'Posts',
    });
  }
  if (contributorsCount && contributorsCount > 0) {
    facts.push({ value: `${contributorsCount}`, label: 'Contributors' });
  }
  if (relatedTopicsCount && relatedTopicsCount > 0) {
    facts.push({ value: `${relatedTopicsCount}`, label: 'Related topics' });
  }
  if (createdAt) {
    const year = new Date(createdAt).getFullYear();
    if (!Number.isNaN(year)) {
      facts.push({ value: `${year}`, label: 'Tracked since' });
    }
  }

  if (!description && facts.length === 0) {
    return null;
  }

  return (
    <TagModule
      title={`About #${title}`}
      icon={<InfoIcon size={IconSize.Small} secondary />}
    >
      <div className="flex flex-col gap-4">
        {description && (
          <p className="text-text-secondary typo-body">{description}</p>
        )}
        {facts.length > 0 && (
          <dl className="grid grid-cols-2 gap-3 tablet:grid-cols-4">
            {facts.map((fact) => (
              <div
                key={fact.label}
                className="flex flex-col gap-0.5 rounded-12 bg-background-default px-3 py-2"
              >
                <dd className="font-bold typo-title3">{fact.value}</dd>
                <dt className="text-text-tertiary typo-caption1">
                  {fact.label}
                </dt>
              </div>
            ))}
          </dl>
        )}
      </div>
    </TagModule>
  );
}

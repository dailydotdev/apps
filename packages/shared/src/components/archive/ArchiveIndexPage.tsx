import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Archive } from '../../graphql/archive';
import type { ArchiveScopeInfo, ArchivesByYear } from '../../lib/archive';
import {
  getArchiveUrlFromArchive,
  getMonthName,
  groupArchivesByYear,
  parseArchivePeriod,
} from '../../lib/archive';
import Link from '../utilities/Link';
import { ArrowIcon } from '../icons';
import { IconSize } from '../Icon';
import { ElementPlaceholder } from '../ElementPlaceholder';

interface ArchiveIndexPageProps {
  scopeType: ArchiveScopeInfo['scopeType'];
  scopeId?: string;
  archives: Archive[];
  scopeName: string;
  isLoading?: boolean;
  className?: string;
}

function ArchiveMonthCard({
  archive,
  scopeType,
  scopeId,
}: {
  archive: Archive;
  scopeType: ArchiveScopeInfo['scopeType'];
  scopeId?: string;
}): ReactElement {
  const { month } = parseArchivePeriod(archive.periodStart);
  const url = getArchiveUrlFromArchive(
    { scopeType, scopeId } as ArchiveScopeInfo,
    archive,
  );
  const itemCount = archive.items?.length;

  return (
    <Link href={url} prefetch={false}>
      <a className="group flex flex-col gap-1 rounded-12 border border-border-subtlest-tertiary p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-border-subtlest-secondary hover:bg-surface-hover hover:shadow-2">
        <span className="font-bold text-text-primary typo-callout">
          {getMonthName(month)}
        </span>
        {typeof itemCount === 'number' && itemCount > 0 && (
          <span className="text-text-tertiary typo-footnote">
            {itemCount} post{itemCount !== 1 ? 's' : ''}
          </span>
        )}
      </a>
    </Link>
  );
}

function ArchiveYearLink({
  archive,
  scopeType,
  scopeId,
}: {
  archive: Archive;
  scopeType: ArchiveScopeInfo['scopeType'];
  scopeId?: string;
}): ReactElement {
  const url = getArchiveUrlFromArchive(
    { scopeType, scopeId } as ArchiveScopeInfo,
    archive,
  );

  return (
    <Link href={url} prefetch={false}>
      <a className="group mt-2 flex items-center gap-1.5 text-text-tertiary transition-colors typo-callout hover:text-text-primary">
        <ArrowIcon
          className="rotate-90 transition-transform group-hover:translate-x-0.5"
          size={IconSize.XSmall}
        />
        See yearly best-of
      </a>
    </Link>
  );
}

function ArchiveGrid({
  groups,
  scopeType,
  scopeId,
  isLoading,
}: {
  groups: ArchivesByYear[];
  scopeType: ArchiveScopeInfo['scopeType'];
  scopeId?: string;
  isLoading?: boolean;
}): ReactElement {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-4">
        {[...Array(2)].map((_, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={i} className="flex flex-col gap-3">
            <ElementPlaceholder className="h-8 w-20 rounded-8" />
            <div className="grid grid-cols-3 gap-3 tablet:grid-cols-4 laptop:grid-cols-6">
              {[...Array(6)].map((__, j) => (
                // eslint-disable-next-line react/no-array-index-key
                <ElementPlaceholder key={j} className="h-16 rounded-12" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="font-bold text-text-tertiary typo-body">
          No archives available yet.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 px-4 pb-4 pt-6">
      {groups.map((group) => (
        <section key={group.year}>
          <h2 className="mb-3 font-bold typo-title3">{group.year}</h2>
          <div className="grid grid-cols-3 gap-3 tablet:grid-cols-4 laptop:grid-cols-6">
            {group.monthly.map((archive) => (
              <ArchiveMonthCard
                key={archive.id}
                archive={archive}
                scopeType={scopeType}
                scopeId={scopeId}
              />
            ))}
          </div>
          {group.yearly && (
            <ArchiveYearLink
              archive={group.yearly}
              scopeType={scopeType}
              scopeId={scopeId}
            />
          )}
        </section>
      ))}
    </div>
  );
}

export function ArchiveIndexPage({
  archives,
  scopeType,
  scopeId,
  scopeName,
  isLoading,
  className,
}: ArchiveIndexPageProps): ReactElement {
  const groups = groupArchivesByYear(archives);

  return (
    <div className={classNames('flex flex-col', className)}>
      {/* Header */}
      <h1 className="mx-4 font-bold typo-title2 tablet:typo-title1">
        Best of {scopeName} &mdash; Archive
      </h1>

      {/* Archive grid by year */}
      <ArchiveGrid
        groups={groups}
        scopeType={scopeType}
        scopeId={scopeId}
        isLoading={isLoading}
      />
    </div>
  );
}

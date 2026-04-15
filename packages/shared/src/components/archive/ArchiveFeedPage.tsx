import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Archive, ArchiveItem } from '../../graphql/archive';
import { ArchivePeriodType } from '../../graphql/archive';
import type { ArchiveScopeInfo } from '../../lib/archive';
import { getArchiveTitle, getArchiveIndexUrl } from '../../lib/archive';
import { ArchiveNavigation } from './ArchiveNavigation';
import { ArchivePostItem } from './ArchivePostItem';
import { ElementPlaceholder } from '../ElementPlaceholder';
import Link from '../utilities/Link';
import { ArrowIcon } from '../icons';
import { IconSize } from '../Icon';

interface ArchiveFeedPageProps {
  scopeType: ArchiveScopeInfo['scopeType'];
  scopeId?: string;
  archive: Archive | null;
  scopeName: string;
  periodType: ArchivePeriodType;
  year: number;
  month?: number;
  prev?: Archive | null;
  next?: Archive | null;
  isLoading?: boolean;
  className?: string;
}

function ArchiveLoadingState(): ReactElement {
  return (
    <div className="flex flex-col gap-3 p-4">
      {[...Array(8)].map((_, i) => (
        <ElementPlaceholder
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          className="h-20 rounded-16"
        />
      ))}
    </div>
  );
}

function ArchivePostList({
  items,
  isLoading,
}: {
  items: ArchiveItem[];
  isLoading?: boolean;
}): ReactElement {
  if (isLoading) {
    return <ArchiveLoadingState />;
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="font-bold text-text-tertiary typo-body">
          No archive available for this period.
        </p>
      </div>
    );
  }

  return (
    <ol className="mt-6 flex flex-col">
      {items.map((item) => (
        <ArchivePostItem key={item.post.id} rank={item.rank} post={item.post} />
      ))}
    </ol>
  );
}

export function ArchiveFeedPage({
  archive,
  scopeType,
  scopeId,
  scopeName,
  periodType,
  year,
  month,
  prev,
  next,
  isLoading,
  className,
}: ArchiveFeedPageProps): ReactElement {
  const title = getArchiveTitle({
    periodType,
    periodStart:
      periodType === ArchivePeriodType.Month && month
        ? new Date(Date.UTC(year, month - 1, 1)).toISOString()
        : new Date(Date.UTC(year, 0, 1)).toISOString(),
  });
  const indexUrl = getArchiveIndexUrl({
    scopeType,
    scopeId,
  } as ArchiveScopeInfo);
  const items = archive?.items ?? [];

  return (
    <div
      className={classNames(
        'mx-auto flex w-full max-w-3xl flex-col',
        className,
      )}
    >
      {/* Header */}
      <h1 className="mx-4 font-bold typo-title2 tablet:typo-title1">
        Best of {scopeName} &mdash; {title.replace('Best of ', '')}
      </h1>

      {/* Top navigation */}
      <ArchiveNavigation
        prev={prev}
        next={next}
        scopeType={scopeType}
        scopeId={scopeId}
        className="mx-4 mt-4"
      />

      {/* Post list */}
      <ArchivePostList items={items} isLoading={isLoading} />

      {/* Bottom navigation */}
      {items.length > 5 && (
        <ArchiveNavigation
          prev={prev}
          next={next}
          scopeType={scopeType}
          scopeId={scopeId}
          className="mx-4 mt-4"
        />
      )}

      {/* Link to index */}
      <div className="mx-4 mb-4 mt-6">
        <Link href={indexUrl} prefetch={false}>
          <a className="group flex items-center gap-1.5 text-text-tertiary transition-colors typo-callout hover:text-text-primary">
            See all {scopeName} archives
            <ArrowIcon
              className="rotate-90 transition-transform group-hover:translate-x-0.5"
              size={IconSize.XSmall}
            />
          </a>
        </Link>
      </div>
    </div>
  );
}

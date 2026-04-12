import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import type { ArchiveIndexData } from '../../graphql/archive';
import {
  ARCHIVE_INDEX_QUERY,
  ArchiveRankingType,
  ArchiveSubjectType,
} from '../../graphql/archive';
import type { ArchiveScopeInfo } from '../../lib/archive';
import {
  getArchiveIndexUrl,
  getArchiveTitle,
  getArchiveUrlFromArchive,
} from '../../lib/archive';
import { gqlClient } from '../../graphql/common';
import { RequestKey, StaleTime } from '../../lib/query';
import Link from '../utilities/Link';
import { ArrowIcon } from '../icons';
import { IconSize } from '../Icon';

interface ArchiveEntryCardProps extends ArchiveScopeInfo {
  scopeName: string;
  className?: string;
}

export function ArchiveEntryCard({
  scopeType,
  scopeId,
  scopeName,
  className,
}: ArchiveEntryCardProps): ReactElement | null {
  const { data } = useQuery({
    queryKey: [RequestKey.Archive, scopeType, scopeId],
    queryFn: () =>
      gqlClient.request<ArchiveIndexData>(ARCHIVE_INDEX_QUERY, {
        subjectType: ArchiveSubjectType.Post,
        rankingType: ArchiveRankingType.Best,
        scopeType,
        scopeId,
      }),
    staleTime: StaleTime.OneHour,
  });

  const archives = data?.archiveIndex;

  if (!archives || archives.length === 0) {
    return null;
  }

  const scope = { scopeType, scopeId };
  const indexUrl = getArchiveIndexUrl(scope);
  // Show the most recent archives (last 6)
  const recentArchives = archives.slice(-6).reverse();

  return (
    <section className={classNames('flex flex-col gap-3', className)}>
      <div className="flex items-center justify-between">
        <h2 className="font-bold typo-body">Best of {scopeName}</h2>
        <Link href={indexUrl} prefetch={false}>
          <a className="group flex items-center gap-1 text-text-tertiary transition-colors typo-footnote hover:text-text-primary">
            All archives
            <ArrowIcon
              className="rotate-90 transition-transform group-hover:translate-x-0.5"
              size={IconSize.XSmall}
            />
          </a>
        </Link>
      </div>
      <div className="no-scrollbar flex gap-3 overflow-x-auto">
        {recentArchives.map((archive) => {
          const url = getArchiveUrlFromArchive(scope, archive);

          return (
            <Link key={archive.id} href={url} prefetch={false}>
              <a className="flex shrink-0 items-center rounded-12 border border-border-subtlest-tertiary px-4 py-2.5 transition-all duration-200 typo-callout hover:border-border-subtlest-secondary hover:bg-surface-hover">
                {getArchiveTitle(archive)}
              </a>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

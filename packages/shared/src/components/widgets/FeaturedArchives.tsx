import type { ReactElement } from 'react';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import type { FeaturedArchivesData } from '../../graphql/archive';
import {
  ArchivePeriodType,
  ArchiveScopeType,
  ArchiveSubjectType,
  FEATURED_ARCHIVES_QUERY,
} from '../../graphql/archive';
import type { ArchiveScopeInfo } from '../../lib/archive';
import {
  getArchivePeriodLabel,
  getArchiveUrlFromArchive,
  getArchiveIndexUrl,
} from '../../lib/archive';
import { gqlClient } from '../../graphql/common';
import { RequestKey, StaleTime } from '../../lib/query';
import Link from '../utilities/Link';
import { ArrowIcon } from '../icons';
import { MedalIcon } from '../icons/Medal';
import { IconSize } from '../Icon';
import { WidgetContainer } from './common';

interface FeaturedArchivesProps {
  postId: string;
  className?: string;
}

const MAX_VISIBLE = 3;

type FeaturedArchive = FeaturedArchivesData['featuredArchives'][number];

function getScopeInfo(
  scopeType: ArchiveScopeType,
  scopeId: string | null,
): ArchiveScopeInfo {
  if (scopeType === ArchiveScopeType.Global) {
    return { scopeType: ArchiveScopeType.Global };
  }

  return {
    scopeType: scopeType as ArchiveScopeType.Tag | ArchiveScopeType.Source,
    scopeId: scopeId!,
  };
}

function getArchiveLabel(archive: FeaturedArchive): string {
  if (archive.scopeType === ArchiveScopeType.Tag) {
    return archive.keyword?.flags?.title || archive.keyword?.value || 'Tag';
  }

  if (archive.scopeType === ArchiveScopeType.Source) {
    return archive.source?.name || 'Source';
  }

  return 'Global';
}

const SCOPE_PRIORITY: Record<ArchiveScopeType, number> = {
  [ArchiveScopeType.Global]: 0,
  [ArchiveScopeType.Tag]: 1,
  [ArchiveScopeType.Source]: 2,
};

const PERIOD_PRIORITY: Record<ArchivePeriodType, number> = {
  [ArchivePeriodType.Year]: 0,
  [ArchivePeriodType.Month]: 1,
};

function sortArchives(archives: FeaturedArchive[]): FeaturedArchive[] {
  return [...archives].sort((a, b) => {
    const periodDiff =
      PERIOD_PRIORITY[a.periodType] - PERIOD_PRIORITY[b.periodType];

    if (periodDiff !== 0) {
      return periodDiff;
    }

    return SCOPE_PRIORITY[a.scopeType] - SCOPE_PRIORITY[b.scopeType];
  });
}

export function FeaturedArchives({
  postId,
  className,
}: FeaturedArchivesProps): ReactElement | null {
  const { data } = useQuery({
    queryKey: [RequestKey.FeaturedArchives, postId],
    queryFn: () =>
      gqlClient.request<FeaturedArchivesData>(FEATURED_ARCHIVES_QUERY, {
        subjectType: ArchiveSubjectType.Post,
        subjectId: postId,
      }),
    staleTime: StaleTime.OneHour,
  });

  const archives = data?.featuredArchives;

  if (!archives || archives.length === 0) {
    return null;
  }

  const sorted = sortArchives(archives);
  const visible = sorted.slice(0, MAX_VISIBLE);
  const hidden = sorted.slice(MAX_VISIBLE);

  return (
    <WidgetContainer className={className}>
      <div className="flex items-center gap-2 border-b border-border-subtlest-tertiary px-4 py-3">
        <MedalIcon size={IconSize.Small} className="text-text-tertiary" />
        <h4 className="font-bold text-text-primary typo-callout">Best of</h4>
      </div>
      <div className="flex flex-col">
        {visible.map((archive) => {
          const scope = getScopeInfo(archive.scopeType, archive.scopeId);
          const url = getArchiveUrlFromArchive(scope, archive);
          const label = getArchiveLabel(archive);
          const date = getArchivePeriodLabel(archive);

          return (
            <Link key={archive.id} href={url} prefetch={false}>
              <a className="flex items-center justify-between gap-2 px-4 py-3 transition-colors hover:bg-surface-hover">
                <span className="break-words text-text-primary typo-callout">
                  {label} - {date}
                </span>
                <ArrowIcon
                  className="shrink-0 rotate-90 text-text-quaternary"
                  size={IconSize.Small}
                />
              </a>
            </Link>
          );
        })}
      </div>
      {hidden.length > 0 && (
        <nav aria-label="More archive links" className="sr-only">
          {hidden.map((archive) => {
            const scope = getScopeInfo(archive.scopeType, archive.scopeId);
            const url = getArchiveUrlFromArchive(scope, archive);
            const label = getArchiveLabel(archive);
            const date = getArchivePeriodLabel(archive);

            return (
              <Link key={archive.id} href={url} prefetch={false}>
                <a>
                  {label} - {date}
                </a>
              </Link>
            );
          })}
        </nav>
      )}
      <Link
        href={getArchiveIndexUrl({ scopeType: ArchiveScopeType.Global })}
        prefetch={false}
      >
        <a className="flex items-center justify-center border-t border-border-subtlest-tertiary px-4 py-3 text-text-tertiary transition-colors typo-callout hover:text-text-primary">
          Explore all archives
        </a>
      </Link>
    </WidgetContainer>
  );
}

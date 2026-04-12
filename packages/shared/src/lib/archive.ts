import { format, getMonth, getYear } from 'date-fns';
import type { Archive, ArchiveItem } from '../graphql/archive';
import { ArchivePeriodType, ArchiveScopeType } from '../graphql/archive';

export type ArchiveScopeInfo = {
  scopeType: ArchiveScopeType.Tag | ArchiveScopeType.Source;
  scopeId: string;
};

export function getMonthName(month: number, short = false): string {
  return format(new Date(2000, month - 1, 1), short ? 'MMM' : 'MMMM');
}

export function padMonth(month: number): string {
  return format(new Date(2000, month - 1, 1), 'MM');
}

export function parseArchivePeriod(periodStart: string | Date): {
  year: number;
  month: number;
} {
  const date = new Date(periodStart);
  return {
    year: getYear(date),
    month: getMonth(date) + 1,
  };
}

export function getArchiveTitle(archive: {
  periodType: ArchivePeriodType;
  periodStart: string | Date;
}): string {
  const { year, month } = parseArchivePeriod(archive.periodStart);

  if (archive.periodType === ArchivePeriodType.Month) {
    return `Best of ${getMonthName(month)} ${year}`;
  }

  return `Best of ${year}`;
}

function getScopeBasePath(scope: ArchiveScopeInfo): string {
  if (scope.scopeType === ArchiveScopeType.Tag) {
    return `/tags/${encodeURIComponent(scope.scopeId)}/best-of`;
  }

  return `/sources/${encodeURIComponent(scope.scopeId)}/best-of`;
}

export function getArchiveIndexUrl(scope: ArchiveScopeInfo): string {
  return getScopeBasePath(scope);
}

export function getArchiveUrl(
  scope: ArchiveScopeInfo,
  periodType: ArchivePeriodType,
  year: number,
  month?: number,
): string {
  const base = getScopeBasePath(scope);

  if (periodType === ArchivePeriodType.Month && month) {
    return `${base}/${year}/${padMonth(month)}`;
  }

  return `${base}/${year}`;
}

export function getArchiveUrlFromArchive(
  scope: ArchiveScopeInfo,
  archive: Pick<Archive, 'periodType' | 'periodStart'>,
): string {
  const { year, month } = parseArchivePeriod(archive.periodStart);
  return getArchiveUrl(scope, archive.periodType, year, month);
}

export function getArchiveDescription(
  scopeName: string,
  periodType: ArchivePeriodType,
  year: number,
  month?: number,
): string {
  if (periodType === ArchivePeriodType.Month && month) {
    return `The most upvoted ${scopeName} posts from ${getMonthName(
      month,
    )} ${year}, curated by the daily.dev community.`;
  }

  return `The most upvoted ${scopeName} posts of ${year}, curated by the daily.dev community.`;
}

export type ArchivesByYear = {
  year: number;
  yearly?: Archive;
  monthly: Archive[];
};

export function groupArchivesByYear(archives: Archive[]): ArchivesByYear[] {
  const yearMap = new Map<number, ArchivesByYear>();

  archives.forEach((archive) => {
    const { year } = parseArchivePeriod(archive.periodStart);
    let entry = yearMap.get(year);

    if (!entry) {
      entry = { year, monthly: [] };
      yearMap.set(year, entry);
    }

    if (archive.periodType === ArchivePeriodType.Year) {
      entry.yearly = archive;
    } else {
      entry.monthly.push(archive);
    }
  });

  Array.from(yearMap.values()).forEach((entry) => {
    entry.monthly.sort((a, b) => {
      const monthA = parseArchivePeriod(a.periodStart).month;
      const monthB = parseArchivePeriod(b.periodStart).month;
      return monthA - monthB;
    });
  });

  return Array.from(yearMap.values()).sort((a, b) => b.year - a.year);
}

export function findAdjacentArchives(
  archives: Archive[],
  currentPeriodStart: string | Date,
  periodType: ArchivePeriodType,
): { prev?: Archive; next?: Archive } {
  const filtered = archives
    .filter((a) => a.periodType === periodType)
    .sort(
      (a, b) =>
        new Date(a.periodStart).getTime() - new Date(b.periodStart).getTime(),
    );

  const currentTime = new Date(currentPeriodStart).getTime();
  const currentIndex = filtered.findIndex(
    (a) => new Date(a.periodStart).getTime() === currentTime,
  );

  if (currentIndex === -1) {
    return {};
  }

  return {
    prev: currentIndex > 0 ? filtered[currentIndex - 1] : undefined,
    next:
      currentIndex < filtered.length - 1
        ? filtered[currentIndex + 1]
        : undefined,
  };
}

/**
 * Build a JSON-LD ItemList from archive items.
 * Returns an empty array when there are no items,
 * so the caller can spread the result into the @graph array.
 */
export function buildArchiveItemListJsonLd(
  pageUrl: string,
  items: ArchiveItem[] | undefined,
): object[] {
  if (!items?.length) {
    return [];
  }

  const appOrigin = pageUrl.split('/').slice(0, 3).join('/');

  return [
    {
      '@type': 'ItemList',
      '@id': `${pageUrl}#items`,
      numberOfItems: items.length,
      itemListElement: items.map((item) => ({
        '@type': 'ListItem',
        position: item.rank,
        url: `${appOrigin}/posts/${item.post.slug || item.post.id}`,
        name: item.post.title || '',
      })),
    },
  ];
}

/**
 * Build a JSON-LD BreadcrumbList from an array of {name, item?} pairs.
 */
export function buildBreadcrumbListJsonLd(
  crumbs: Array<{ name: string; item?: string }>,
): object {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      ...(crumb.item && { item: crumb.item }),
    })),
  };
}

import { format, getMonth, getYear } from 'date-fns';
import type { Archive } from '../graphql/archive';
import { ArchivePeriodType, ArchiveScopeType } from '../graphql/archive';

export const getMonthName = (month: number, short = false): string =>
  format(new Date(2000, month - 1, 1), short ? 'MMM' : 'MMMM');

export const padMonth = (month: number): string =>
  format(new Date(2000, month - 1, 1), 'MM');

export const parseArchivePeriod = (
  periodStart: string | Date,
): { year: number; month: number } => {
  const date = new Date(periodStart);
  return {
    year: getYear(date),
    month: getMonth(date) + 1,
  };
};

export const getArchiveTitle = (archive: {
  periodType: ArchivePeriodType;
  periodStart: string | Date;
}): string => {
  const { year, month } = parseArchivePeriod(archive.periodStart);

  if (archive.periodType === ArchivePeriodType.Month) {
    return `Best of ${getMonthName(month)} ${year}`;
  }

  return `Best of ${year}`;
};

type ScopeInfo = {
  scopeType: ArchiveScopeType.Tag | ArchiveScopeType.Source;
  scopeId: string;
};

const getScopeBasePath = (scope: ScopeInfo): string => {
  if (scope.scopeType === ArchiveScopeType.Tag) {
    return `/tags/${encodeURIComponent(scope.scopeId)}/best-of`;
  }

  return `/sources/${encodeURIComponent(scope.scopeId)}/best-of`;
};

export const getArchiveIndexUrl = (scope: ScopeInfo): string =>
  getScopeBasePath(scope);

export const getArchiveUrl = (
  scope: ScopeInfo,
  periodType: ArchivePeriodType,
  year: number,
  month?: number,
): string => {
  const base = getScopeBasePath(scope);

  if (periodType === ArchivePeriodType.Month && month) {
    return `${base}/${year}/${padMonth(month)}`;
  }

  return `${base}/${year}`;
};

export const getArchiveUrlFromArchive = (
  scope: ScopeInfo,
  archive: Pick<Archive, 'periodType' | 'periodStart'>,
): string => {
  const { year, month } = parseArchivePeriod(archive.periodStart);
  return getArchiveUrl(scope, archive.periodType, year, month);
};

export const getArchiveDescription = (
  scopeName: string,
  periodType: ArchivePeriodType,
  year: number,
  month?: number,
): string => {
  if (periodType === ArchivePeriodType.Month && month) {
    return `The most upvoted ${scopeName} posts from ${getMonthName(
      month,
    )} ${year}, curated by the daily.dev community.`;
  }

  return `The most upvoted ${scopeName} posts of ${year}, curated by the daily.dev community.`;
};

export type ArchivesByYear = {
  year: number;
  yearly?: Archive;
  monthly: Archive[];
};

export const groupArchivesByYear = (archives: Archive[]): ArchivesByYear[] => {
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

  // Sort monthly archives by month within each year
  Array.from(yearMap.values()).forEach((entry) => {
    entry.monthly.sort((a, b) => {
      const monthA = parseArchivePeriod(a.periodStart).month;
      const monthB = parseArchivePeriod(b.periodStart).month;
      return monthA - monthB;
    });
  });

  return Array.from(yearMap.values()).sort((a, b) => b.year - a.year);
};

export const findAdjacentArchives = (
  archives: Archive[],
  currentPeriodStart: string | Date,
  periodType: ArchivePeriodType,
): { prev?: Archive; next?: Archive } => {
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
};

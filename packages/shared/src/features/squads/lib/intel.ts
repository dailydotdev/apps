// The weekly intel's audience filters, mirrored from the API
// (`common/schema/startupsIntel.ts`). The plan decides which ones a squad gets.
export enum IntelSeniority {
  Junior = 'junior',
  Mid = 'mid',
  Senior = 'senior',
}

export enum IntelRegion {
  NorthAmerica = 'north_america',
  Europe = 'europe',
  Apac = 'apac',
  LatinAmerica = 'latin_america',
  MiddleEastAfrica = 'middle_east_africa',
}

export const intelSeniorityLabels: Record<IntelSeniority, string> = {
  [IntelSeniority.Junior]: 'Junior (under 2 years)',
  [IntelSeniority.Mid]: 'Mid-level (2 to 6 years)',
  [IntelSeniority.Senior]: 'Senior (over 6 years)',
};

export const intelRegionLabels: Record<IntelRegion, string> = {
  [IntelRegion.NorthAmerica]: 'North America',
  [IntelRegion.Europe]: 'Europe and UK',
  [IntelRegion.Apac]: 'Asia Pacific',
  [IntelRegion.LatinAmerica]: 'Latin America',
  [IntelRegion.MiddleEastAfrica]: 'Middle East and Africa',
};

export const intelSeniorities = Object.values(IntelSeniority);
export const intelRegions = Object.values(IntelRegion);

// "Oct 26 to Nov 1": the week ends the Monday after, so the last day is the
// Sunday before it
export const getIntelWeekLabel = ({
  weekStart,
  weekEnd,
}: {
  weekStart: string;
  weekEnd: string;
}): string => {
  const format = (date: Date) =>
    date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    });
  const lastDay = new Date(new Date(weekEnd).getTime() - 24 * 60 * 60 * 1000);

  return `${format(new Date(weekStart))} to ${format(lastDay)}`;
};

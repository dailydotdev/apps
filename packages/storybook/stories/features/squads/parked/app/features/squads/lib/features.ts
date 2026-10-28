import type {
  Source,
  SourceFeatures,
} from '@dailydotdev/shared/src/graphql/sources';

// Parked: the jobs and perks flags join SourceFeatures in
// graphql/sources.ts when the feature ships.
export type ParkedSourceFeatures = SourceFeatures & {
  jobs?: boolean | null;
  perks?: boolean | null;
};

export type SquadFeature = keyof ParkedSourceFeatures;

export const hasSquadFeature = (
  source: Pick<Source, 'features'> | undefined,
  feature: SquadFeature,
): boolean =>
  !!(source?.features as ParkedSourceFeatures | undefined)?.[feature];

// A squad the page renders always comes from the API with its id; the type
// only keeps it optional for the other sources.
export const getSquadId = (squad: Pick<Source, 'id'>): string => {
  if (!squad.id) {
    throw new Error('The squad has no id');
  }

  return squad.id;
};

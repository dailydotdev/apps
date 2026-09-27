import type { Source, SourceFeatures } from '../../../graphql/sources';

export type SquadFeature = keyof SourceFeatures;

export const hasSquadFeature = (
  source: Pick<Source, 'features'> | undefined,
  feature: SquadFeature,
): boolean => !!source?.features?.[feature];

// A squad the page renders always comes from the API with its id; the type
// only keeps it optional for the other sources.
export const getSquadId = (squad: Pick<Source, 'id'>): string => {
  if (!squad.id) {
    throw new Error('The squad has no id');
  }

  return squad.id;
};

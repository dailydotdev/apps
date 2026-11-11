import type { Source, SourceFeatures } from '../../../graphql/sources';
import { SQUAD_PLAN_PRODUCTS_MAX, SQUAD_PRODUCTS_MAX } from './limits';

export type SquadFeature = keyof SourceFeatures;

export const hasSquadFeature = (
  source: Pick<Source, 'features'> | undefined,
  feature: SquadFeature,
): boolean => !!source?.features?.[feature];

// A company page: verified (Enterprise) or on a daily.dev for Startups plan,
// which turns on products.
export const isCompanySquad = (
  source: Pick<Source, 'features'> | undefined,
): boolean =>
  hasSquadFeature(source, 'verified') || hasSquadFeature(source, 'products');

// Verified squads get the full branding. The Startups Team plan gets only the
// header button; the brand color stays an Enterprise feature.
export const canSetSquadButton = (
  source: Pick<Source, 'features'> | undefined,
): boolean =>
  hasSquadFeature(source, 'verified') || hasSquadFeature(source, 'cta');

// Mirrors the API: only verified squads get the full products shelf
export const getSquadProductsMax = (
  source: Pick<Source, 'features'> | undefined,
): number =>
  hasSquadFeature(source, 'verified')
    ? SQUAD_PRODUCTS_MAX
    : SQUAD_PLAN_PRODUCTS_MAX;

// A squad the page renders always comes from the API with its id; the type
// only keeps it optional for the other sources.
export const getSquadId = (squad: Pick<Source, 'id'>): string => {
  if (!squad.id) {
    throw new Error('The squad has no id');
  }

  return squad.id;
};

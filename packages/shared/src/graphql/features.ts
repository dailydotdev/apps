export enum FeatureType {
  Squad = 'squad',
}

export interface Feature {
  feature: FeatureType;
  userId: string;
}

export const hasFeatureAccess = (
  features: Feature[],
  feature: FeatureType,
): boolean => features?.some((feat) => feat.feature === feature);

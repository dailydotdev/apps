export enum ExperimentWinner {
  ArticleOnboarding = 'v3',
  PostCardShareVersion = 'v2',
  OnboardingVersion = 'v2',
  CompanionPermissionPlacement = 'header',
  OnboardingV4 = 'v4',
}

export enum PlusPriceType {
  Monthly = 'monthly',
  Yearly = 'yearly',
}

export enum PlusPriceTypeAppsId {
  GiftOneYear = 'gift_one_year',
  EarlyAdopter = 'early_adopter',
}

export interface FeatureThemeVariant {
  logo?: string;
  logoText?: string;
  body?: Record<string, string>;
  navbar?: Record<string, string>;
}

export interface FeatureTheme {
  version?: number;
  light?: FeatureThemeVariant;
  dark?: FeatureThemeVariant;
  cursor?: string;

  [key: string]: number | FeatureThemeVariant | string | undefined;
}

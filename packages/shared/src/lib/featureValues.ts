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
  GiftOneYear = 'gift_one_year',
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

export enum ExperimentWinner {
  ArticleOnboarding = 'v3',
  PostCardShareVersion = 'v2',
  OnboardingVersion = 'v2',
  CompanionPermissionPlacement = 'header',
  OnboardingV4 = 'v4',
}

export enum ShortcutsUIExperiment {
  Control = 'control',
  V1 = 'v1',
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

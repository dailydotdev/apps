import { isPreviewDeployment } from './links';

export enum InAppNotificationPosition {
  Bottom = 'bottom',
  Top = 'top',
}

export enum OnboardingFiltersLayout {
  Grid = 'grid',
  List = 'list',
}

export enum ExperimentWinner {
  ArticleOnboarding = 'v3',
  PostCardShareVersion = 'v2',
  AuthVersion = 'v4',
  OnboardingVersion = 'v2',
  ScrollOnboardingVersion = 'v2',
}

export enum OnboardingV2 {
  Control = 'control',
  V1 = 'v1',
}

export enum OnboardingFilteringTitle {
  Control = 'control',
  V1 = 'v1',
  V2 = 'v2',
  V3 = 'v3',
  V4 = 'v4',
}

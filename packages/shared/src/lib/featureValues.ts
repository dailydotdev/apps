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

// July 10, 2023, is when we released the API - We will release the apps experiment by 11.
export const firstVisitRequirement = new Date(2023, 6, 11);

export enum OnboardingFilteringTitle {
  Control = 'control',
  V1 = 'v1',
  V2 = 'v2',
  V3 = 'v3',
  V4 = 'v4',
}

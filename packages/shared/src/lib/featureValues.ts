import { differenceInDays } from 'date-fns';

export enum ExperimentWinner {
  ArticleOnboarding = 'v3',
  PostCardShareVersion = 'v2',
  AuthVersion = 'v4',
  OnboardingVersion = 'v2',
  ScrollOnboardingVersion = 'v2',
  CompanionPermissionPlacement = 'header',
}

export enum OnboardingV2 {
  Control = 'control',
  V1 = 'v1',
}

export enum OnboardingV3 {
  Control = 'control',
  V3 = 'v3',
}

export enum OnboardingFilteringTitle {
  Control = 'control',
  V1 = 'v1',
  V2 = 'v2',
  V3 = 'v3',
  V4 = 'v4',
}

export enum SearchExperiment {
  Control = 'control',
  V1 = 'v1',
}

const anonymousMigrationDate = new Date(2023, 10, 1);
const now = new Date();
export const daysLeft = differenceInDays(anonymousMigrationDate, now);

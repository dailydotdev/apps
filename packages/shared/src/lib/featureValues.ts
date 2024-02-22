export enum ExperimentWinner {
  ArticleOnboarding = 'v3',
  PostCardShareVersion = 'v2',
  OnboardingVersion = 'v2',
  CompanionPermissionPlacement = 'header',
  OnboardingV4 = 'v4',
}

export enum SearchExperiment {
  Control = 'control',
  V1 = 'v1',
}

export enum FeedLayout {
  Control = 'control',
  V1 = 'v1',
}

export enum ReadingStreaksExperiment {
  Control = 'control',
  V1 = 'v1',
}

export enum PostPageOnboarding {
  Control = 'control',
  V1 = 'v1',
}

export enum OnboardingV4dot5 {
  Control = 'control',
  V4dot5 = 'v4dot5',
}

export const isOnboardingV4dot5 = (flag: string): boolean =>
  flag === OnboardingV4dot5.V4dot5;

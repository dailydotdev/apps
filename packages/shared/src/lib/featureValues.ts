import { defaultFeedContextData } from '../contexts/FeedContext';

export enum ExperimentWinner {
  ArticleOnboarding = 'v3',
  PostCardShareVersion = 'v2',
  OnboardingVersion = 'v2',
  CompanionPermissionPlacement = 'header',
  OnboardingV4 = 'v4',
}

export enum ReadingStreaksExperiment {
  Control = 'control',
  V1 = 'v1',
}

export enum OnboardingV4dot5 {
  Control = 'control',
  V4dot5 = 'v4dot5',
}

export enum PostPageOnboarding {
  Control = 'control',
  V3 = 'v3',
}

export enum UserAcquisition {
  Control = 'control',
  V1 = 'v1',
}

export enum FeedAdSpot {
  Control = defaultFeedContextData.adSpot,
  V1 = 0,
}

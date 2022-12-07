export enum Origin {
  ShareBar = 'share bar',
  ReadingHistoryContextMenu = 'reading history context menu',
  ArticlePage = 'article page',
  ArticleModal = 'article modal',
  Companion = 'companion',
  Feed = 'feed',
  PostContextMenu = 'post context menu',
  TagsFilter = 'tags filter',
  TagsSearch = 'tags search',
}

export enum LoginTrigger {
  CreateFeedFilters = 'create feed filters',
}

export enum AnalyticsEvent {
  Impression = 'impression',
  ManageTags = 'click manage tags',
  SearchTags = 'search tags',
  ClickOnboardingBack = 'click onboarding back',
  ClickOnboardingNext = 'click onboarding next',
  OnboardingSkip = 'my feed onboarding skip',
  CompleteOnboarding = 'complete onboarding',
  GlobalError = 'global error',
}

export enum TargetType {
  MyFeedModal = 'my feed modal',
}

export enum TargetId {
  MyFeedHeading = 'my feed heading',
  Legacy = 'legacy',
}

export enum ScreenValue {
  Intro = 'intro',
}

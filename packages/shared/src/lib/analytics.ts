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
  RealTime = 'realtime',
  NonRealTime = 'nonrealtime',
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
  ClickArticleAnonymousCTA = 'click article anonymous cta',
  ClickScrollBlock = 'click scroll block',
  // notifications - start
  ClickNotificationIcon = 'click notification icon',
  OpenNotificationList = 'open notification list',
  ClickNotification = 'click notification',
  ClickEnableNotification = 'click enable notification',
  ClickNotificationDismiss = 'click notification dismiss',
  DisableNotification = 'disable notification',
  // notifications - end
}

export enum TargetType {
  MyFeedModal = 'my feed modal',
  ArticleAnonymousCTA = 'article anonymous cta',
  ScrollBlock = 'scroll block',
  EnableNotifications = 'enable notifications',
}

export enum TargetId {
  MyFeedHeading = 'my feed heading',
  Legacy = 'legacy',
}

export enum ScreenValue {
  Intro = 'intro',
}

export enum NotificationChannel {
  Email = 'email',
  Web = 'web',
}

export enum NotificationCategory {
  Marketing = 'marketing',
  Product = 'product',
}

export enum NotificationTarget {
  Header = 'header',
  Footer = 'footer',
  Icon = 'notifications icon',
}

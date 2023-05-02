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
  // squads - start
  SquadCreation = 'squad creation',
  SquadPage = 'squad page',
  Auto = 'auto',
  Sidebar = 'sidebar',
  Share = 'share',
  Notification = 'notification',
  SquadMembersList = 'squad members list',
  // squads - end
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
  // squads - start
  ViewSquadInvitation = 'view squad invitation',
  ClickJoinSquad = 'click join squad',
  CompleteJoiningSquad = 'complete joining squad',
  DeleteSquad = 'delete squad',
  LeaveSquad = 'leave squad',
  ShareSquadInvitation = 'share squad invitation',
  ViewSquadPage = 'view squad page',
  ViewSquadForbiddenPage = 'view squad forbidden',
  CompleteSquadCreation = 'complete squad creation',
  StartShareToSquad = 'start share to squad',
  ShareToSquad = 'share to squad',
  // squads - end
  EligibleScrollBlock = 'eligible scroll block',
}

export enum TargetType {
  MyFeedModal = 'my feed modal',
  ArticleAnonymousCTA = 'article anonymous cta',
  EnableNotifications = 'enable notifications',
  CreateSquadPopup = 'create squad popup',
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

export enum NotificationPromptSource {
  NotificationsPage = 'notifications page',
  NewComment = 'new comment',
  CommunityPicks = 'community picks modal',
  NewSourceModal = 'new source modal',
  SquadPage = 'squad page',
  SquadPostCommentary = 'squad post commentary',
  SquadPostModal = 'squad post modal',
}

export enum Origin {
  ShareBar = 'share bar',
  ReadingHistoryContextMenu = 'reading history context menu',
  ArticlePage = 'article page',
  ArticleModal = 'article modal',
  Companion = 'companion',
  Feed = 'feed',
  PostContextMenu = 'post context menu',
  PostCommentContextMenu = 'post comment context menu',
  TagsFilter = 'tags filter',
  TagsSearch = 'tags search',
  RealTime = 'realtime',
  NonRealTime = 'nonrealtime',
  ChangelogPopup = 'changelog popup',
  BlockedFilter = 'blocked filter',
  SourcePage = 'source page',
  TagPage = 'tag page',
  // squads - start
  SquadDirectory = 'squad directory',
  SquadCreation = 'squad creation',
  SquadPage = 'squad page',
  Auto = 'auto',
  Sidebar = 'sidebar',
  Share = 'share',
  Notification = 'notification',
  SquadMembersList = 'squad members list',
  SquadChecklist = 'squad checklist',
  SquadInvitation = 'squad invitation',
  // squads - end
  PostCommentButton = 'comment button',
  StartDiscussion = 'start discussion button',
  CompanionContextMenu = 'companion context menu',
  // search - start
  HomePage = 'home page',
  SearchPage = 'search page',
  HistoryPage = 'history page',
  HistoryTooltip = 'history tooltip',
  // search - end
  History = 'history',
  FeedbackCard = 'feedback card',
  InitializeRegistrationFlow = 'initialize registration flow',
  Onboarding = 'onboarding',
  ManageTag = 'manage_tag',
  EditTag = 'edit_tag',
}

export enum AnalyticsEvent {
  Click = 'click',
  CommentPost = 'comment post',
  StartSubmitArticle = 'start submit article',
  Impression = 'impression',
  ManageTags = 'click manage tags',
  SearchTags = 'search tags',
  ClickOnboardingBack = 'click onboarding back',
  ClickOnboardingNext = 'click onboarding next',
  OnboardingSkip = 'my feed onboarding skip',
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
  ChecklistClose = 'checklist close',
  DeletePost = 'delete post',
  DeleteComment = 'delete comment',
  // squads - end
  EligibleScrollBlock = 'eligible scroll block',
  OpenComment = 'open comment modal',
  // vote - start
  UpvotePost = 'upvote post',
  RemovePostUpvote = 'remove post upvote',
  DownvotePost = 'downvote post',
  RemovePostDownvote = 'remove post downvote',
  ClickDismissFeedback = 'click dismiss feedback',
  // vote - end
  // bookmark - start
  BookmarkPost = 'bookmark post',
  RemovePostBookmark = 'remove post bookmark',
  // bookmark - end
  ReportComment = 'report comment',
  // search start
  FocusSearch = 'focus search',
  SubmitSearch = 'submit search',
  OpenSearchHistory = 'open search history',
  UpvoteSearch = 'upvote search',
  DownvoteSearch = 'downvote search',
  CopySearch = 'copy search',
  CopyKeyLink = 'copy key link',
  HideFromHeader = 'hide from header',
  CloseInvitationPopup = 'close invitation popup',
  ErrorSearch = 'error search',
  AcceptInvitation = 'accept invitation',
  SearchHighlightAnimation = 'highlight search',
  // search end
  RequestContentScripts = 'request content scripts',
  ApproveContentScripts = 'approve content scripts',
  DeclineContentScripts = 'decline content scripts',
  ToggleFeedPreview = 'toggle feed preview',
  CreateFeed = 'create feed',
}

export enum FeedItemTitle {
  SubmitArticle = 'Submit article',
}

export enum TargetType {
  MyFeedModal = 'my feed modal',
  ArticleAnonymousCTA = 'article anonymous cta',
  EnableNotifications = 'enable notifications',
  OnboardingChecklist = 'onboarding checklist',
  LoginButton = 'login button',
  SignupButton = 'signup button',
  SquadJoinButton = 'squad join button',
  SearchRecommendation = 'search rec',
  SearchHistory = 'search history',
  SearchSource = 'search source',
  SearchInviteButton = 'search invite button',
  HideInviteCheckbox = 'hide invite mechanism',
}

export enum TargetId {
  SearchReferralBadge = 'search referral badge',
  InviteBanner = 'invite banner',
  InviteProfileMenu = 'invite in profile menu',
}

export enum NotificationChannel {
  Email = 'email',
  Web = 'web',
}

export enum NotificationCategory {
  Marketing = 'marketing',
  Product = 'product',
  Digest = 'digest',
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
  NotificationItem = 'notification item',
  SquadPostCommentary = 'squad post commentary',
  SquadPostModal = 'squad post modal',
  SquadChecklist = 'squad checklist',
}

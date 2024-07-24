export enum Origin {
  ShareBar = 'share bar',
  ReadingHistoryContextMenu = 'reading history context menu',
  ArticlePage = 'article page',
  ArticleModal = 'article modal',
  Companion = 'companion',
  Feed = 'feed',
  CommentFeed = 'comment feed',
  CustomFeed = 'custom feed',
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
  Profile = 'profile',
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
  PostContent = 'post content',
  History = 'history',
  FeedbackCard = 'feedback card',
  InitializeRegistrationFlow = 'initialize registration flow',
  Onboarding = 'onboarding',
  ManageTag = 'manage_tag',
  EditTag = 'edit_tag',
  // Collection
  CollectionModal = 'collection modal',
}

export enum LogEvent {
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
  KeyboardShortcutTriggered = 'keyboard shortcut triggered',
  // notifications - start
  ClickNotificationIcon = 'click notification icon',
  OpenNotificationList = 'open notification list',
  ClickNotification = 'click notification',
  ClickEnableNotification = 'click enable notification',
  ClickNotificationDismiss = 'click notification dismiss',
  EnableNotification = 'enable notification',
  DisableNotification = 'disable notification',
  ScheduleDigest = 'schedule digest',
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
  UpvoteComment = 'upvote comment',
  RemoveCommentUpvote = 'remove comment upvote',
  DownvoteComment = 'downvote comment',
  RemoveCommentDownvote = 'remove comment downvote',
  // vote - end
  // bookmark - start
  BookmarkPost = 'bookmark post',
  RemovePostBookmark = 'remove post bookmark',
  SetBookmarkReminder = 'set bookmark reminder',
  RemoveBookmarkReminder = 'remove bookmark reminder',
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
  DownloadExtension = 'download extension',
  SearchHighlightAnimation = 'highlight search',
  SwitchSearch = 'switch search',
  // search end
  RequestContentScripts = 'request content scripts',
  ApproveContentScripts = 'approve content scripts',
  DeclineContentScripts = 'decline content scripts',
  ToggleFeedPreview = 'toggle feed preview',
  CreateFeed = 'create feed',
  // Referral campaign
  CopyReferralLink = 'copy referral link',
  InviteReferral = 'invite referral',
  // Shortcuts
  RevokeShortcutAccess = 'revoke shortcut access',
  SaveShortcutAccess = 'save shortcut access',
  OpenShortcutConfig = 'open shortcut config',
  // Devcard
  ShareDevcard = 'share devcard',
  GenerateDevcard = 'generate devcard',
  DownloadDevcard = 'download devcard',
  CopyDevcardCode = 'copy devcard code',
  // Reading Streaks
  OpenStreaks = 'open streaks',
  DismissStreaksMilestone = 'dismiss streaks milestone',
  ScheduleStreakReminder = 'schedule streak reminder',
  // 404 page
  View404Page = '404 page',
  // Source Actions - start
  FollowSource = 'follow',
  UnfollowSource = 'unfollow',
  BlockSource = 'block',
  UnblockSource = 'unblock',
  SubscribeSource = 'subscribe',
  UnsubscribeSource = 'unsubscribe',
  // Source Actions - end
  // Tags - start
  BlockTag = 'block',
  UnblockTag = 'unblock',
  // Tags - end
  // marketing CTA
  MarketingCtaDismiss = 'dismiss promotion',
  // Reading reminder
  ScheduleReadingReminder = 'schedule reading reminder',
  SkipReadingReminder = 'skip reading reminder',
  // custom feeds start
  StartCustomFeed = 'start custom feed',
  CreateCustomFeed = 'create custom feed',
  UpdateCustomFeed = 'update custom feed',
  DeleteCustomFeed = 'delete custom feed',
  // custom feeds end
  // Settings
  ChangeSettings = 'change settings',
  // End settings
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
  ReferralPopup = 'referral popup',
  InviteFriendsPage = 'invite friends page',
  ProfilePage = 'profile page',
  GenericReferralPopup = 'generic referral popup',
  Shortcuts = 'shortcuts',
  VerifyEmail = 'verify email',
  ResendVerificationCode = 'resend verification code',
  StreaksMilestone = 'streaks milestone',
  PromotionCard = 'promotion_card',
  MarketingCtaPopover = 'promotion_popover',
  MarketingCtaPopoverSmall = 'promotion_popover_small',
  Comment = 'comment',
  ReadingReminder = 'reading reminder',
  // Settings
  Layout = 'layout',
  Theme = 'theme',
  // End settings
}

export enum TargetId {
  SearchReferralBadge = 'search referral badge',
  InviteBanner = 'invite banner',
  InviteProfileMenu = 'invite in profile menu',
  SearchActivation = 'search activation',
  // Referral campaign
  GenericReferralPopup = 'generic referral popup',
  ProfilePage = 'profile page',
  InviteFriendsPage = 'invite friends page',
  Squad = 'squad',
  General = 'general',
  // Settings
  Cards = 'cards',
  List = 'list',
  // End settings
}

export enum NotificationChannel {
  Email = 'email',
  Web = 'web',
}

export enum NotificationCategory {
  Marketing = 'marketing',
  Product = 'product',
  Digest = 'digest',
  ReadingReminder = 'reading reminder',
  StreakReminder = 'streak reminder',
}

export enum NotificationTarget {
  Header = 'header',
  Footer = 'footer',
  Icon = 'notifications icon',
}

export enum NotificationPromptSource {
  BookmarkReminder = 'bookmark reminder',
  NotificationsPage = 'notifications page',
  NewComment = 'new comment',
  CommunityPicks = 'community picks modal',
  NewSourceModal = 'new source modal',
  SquadPage = 'squad page',
  NotificationItem = 'notification item',
  SquadPostCommentary = 'squad post commentary',
  SquadPostModal = 'squad post modal',
  SquadChecklist = 'squad checklist',
  SourceSubscribe = 'source subscribe',
  ReadingReminder = 'reading reminder',
}

export enum ShortcutsSourceType {
  Custom = 'custom',
  Browser = 'browser',
  Placeholder = 'placeholder',
  Button = 'button',
}

export enum UserAcquisitionEvent {
  Dismiss = 'dismiss ua',
  Submit = 'choose ua',
}

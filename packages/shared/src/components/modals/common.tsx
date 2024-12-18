import React from 'react';
import dynamic from 'next/dynamic';
import { LazyModal } from './common/types';

export type CloseModalFunc = (
  e: React.MouseEvent | React.KeyboardEvent | React.FormEvent,
) => void;

const SquadMemberModal = dynamic(
  () => import(/* webpackChunkName: "squadMemberModal" */ './SquadMemberModal'),
);
const UpvotedPopupModal = dynamic(
  () =>
    import(/* webpackChunkName: "upvotedPopupModal" */ './UpvotedPopupModal'),
);
const UserFollowersModal = dynamic(
  () =>
    import(/* webpackChunkName: "userFollowersModal" */ './UserFollowersModal'),
);
const UserFollowingModal = dynamic(
  () =>
    import(/* webpackChunkName: "userFollowingModal" */ './UserFollowingModal'),
);
const SquadTourModal = dynamic(
  () => import(/* webpackChunkName: "squadTourModal" */ './SquadTourModal'),
);
const SquadPromotionModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "squadPromotionModal" */ './squads/SquadPromotionModal'
    ),
);

const ReadingHistoryModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "readingHistoryModal" */ './post/ReadingHistoryModal'
    ),
);

const CreateSharedPostModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "createSharedPostModal" */ './post/CreateSharedPostModal'
    ),
);

const ReportPostModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "reportPostModal" */ './report/ReportPostModal'
    ),
);

const ReportCommentModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "reportCommentModal" */ './report/ReportCommentModal'
    ),
);

const SquadNotificationsModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "squadNotificationsModal" */ './squads/SquadNotificationsModal'
    ),
);

const FeedFilters = dynamic(
  () => import(/* webpackChunkName: "feedFilters" */ '../filters/FeedFilters'),
);

const SubmitArticle = dynamic(
  () =>
    import(/* webpackChunkName: "submitArticleModal" */ './SubmitArticleModal'),
);

const NewSource = dynamic(
  () => import(/* webpackChunkName: "newSourceModal" */ './NewSourceModal'),
);

const VerifySession = dynamic(
  () =>
    import(
      /* webpackChunkName: "verifySessionModal" */ '../auth/VerifySessionModal'
    ),
);

const VideoModal = dynamic(
  () => import(/* webpackChunkName: "videoModal" */ './VideoModal'),
);

const GenericReferralModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "genericReferralModal" */ './referral/GenericReferralModal'
    ),
);

const NewStreakModal = dynamic(
  () =>
    import(/* webpackChunkName: "newStreakModal" */ './streaks/NewStreakModal'),
);

const ReputationPrivilegesModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "reputationPrivilegesModal" */ './ReputationPrivilegesModal'
    ),
);

const MarketingCtaModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "marketingCtaModal" */ '../marketingCta/MarketingCtaModal'
    ),
);

const UserSettingsModal = dynamic(
  () =>
    import(/* webpackChunkName: "userSettingsModal" */ './UserSettingsModal'),
);

const ShareModal = dynamic(
  () => import(/* webpackChunkName: "shareModal" */ './ShareModal'),
);

const PrivilegedMemberModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "privilegedMembersModal" */ './squads/PrivilegedMembersModal'
    ),
);

const BookmarkReminderModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "bookmarkReminderModal" */ './post/BookmarkReminderModal'
    ),
);

const StreakRecoverModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "streakRecoverModal" */ './streaks/StreakRecoverModal'
    ),
);

const SlackIntegrationModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "slackIntegrationModal" */ './SlackIntegrationModal/SlackIntegrationModal'
    ),
);

const ReportSourceModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "reportSourceModal" */ './report/ReportSourceModal'
    ),
);

const ReasonSelectionModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "reasonSelectionModal" */ './report/ReasonSelectionModal'
    ),
);

const PostModerationModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "postModerationModal" */ './squads/PostModerationModal'
    ),
);
const NewSquadModal = dynamic(
  () =>
    import(/* webpackChunkName: "newSquadModal" */ './squads/NewSquadModal'),
);
const TopReaderBadgeModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "topReaderBadgeModal" */ './badges/TopReaderBadgeModal'
    ),
);

const AdvancedCustomFeedSoonModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "advancedCustomFeedSoonModal" */ './soon/AdvancedCustomFeedSoonModal'
    ),
);

const BookmarkFolderSoonModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "bookmarkFolderSoonModal" */ './soon/BookmarkFolderSoonModal'
    ),
);

const BookmarkFolderModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "bookmarkFolderModal" */ './bookmark/BookmarkFolderModal'
    ),
);

const ClickbaitShieldModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "clickbaitShieldModal" */ './ClickbaitShieldModal'
    ),
);
const MoveBookmarkModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "moveBookmarkModal" */ './bookmark/MoveBookmarkModal'
    ),
);

const BookmarksFolderEntryModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "bookmarksFolderEntryModal" */ './bookmark/BookmarksFolderEntryModal'
    ),
);

const AddToCustomFeedModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "addToCustomFeedModal" */ './feed/AddToCustomFeedModal'
    ),
);

export const modals = {
  [LazyModal.SquadMember]: SquadMemberModal,
  [LazyModal.UpvotedPopup]: UpvotedPopupModal,
  [LazyModal.SquadTour]: SquadTourModal,
  [LazyModal.ReadingHistory]: ReadingHistoryModal,
  [LazyModal.SquadPromotion]: SquadPromotionModal,
  [LazyModal.CreateSharedPost]: CreateSharedPostModal,
  [LazyModal.ReportPost]: ReportPostModal,
  [LazyModal.ReportComment]: ReportCommentModal,
  [LazyModal.SquadNotifications]: SquadNotificationsModal,
  [LazyModal.SubmitArticle]: SubmitArticle,
  [LazyModal.NewSource]: NewSource,
  [LazyModal.FeedFilters]: FeedFilters,
  [LazyModal.VerifySession]: VerifySession,
  [LazyModal.GenericReferral]: GenericReferralModal,
  [LazyModal.Video]: VideoModal,
  [LazyModal.NewStreak]: NewStreakModal,
  [LazyModal.ReputationPrivileges]: ReputationPrivilegesModal,
  [LazyModal.MarketingCta]: MarketingCtaModal,
  [LazyModal.UserSettings]: UserSettingsModal,
  [LazyModal.Share]: ShareModal,
  [LazyModal.PrivilegedMembers]: PrivilegedMemberModal,
  [LazyModal.BookmarkReminder]: BookmarkReminderModal,
  [LazyModal.RecoverStreak]: StreakRecoverModal,
  [LazyModal.SlackIntegration]: SlackIntegrationModal,
  [LazyModal.ReportSource]: ReportSourceModal,
  [LazyModal.UserFollowersModal]: UserFollowersModal,
  [LazyModal.UserFollowingModal]: UserFollowingModal,
  [LazyModal.ReasonSelection]: ReasonSelectionModal,
  [LazyModal.PostModeration]: PostModerationModal,
  [LazyModal.NewSquad]: NewSquadModal,
  [LazyModal.TopReaderBadge]: TopReaderBadgeModal,
  [LazyModal.AdvancedCustomFeedSoon]: AdvancedCustomFeedSoonModal,
  [LazyModal.BookmarkFolderSoon]: BookmarkFolderSoonModal,
  [LazyModal.BookmarkFolder]: BookmarkFolderModal,
  [LazyModal.BookmarksFolderEntry]: BookmarksFolderEntryModal,
  [LazyModal.ClickbaitShield]: ClickbaitShieldModal,
  [LazyModal.MoveBookmark]: MoveBookmarkModal,
  [LazyModal.AddToCustomFeed]: AddToCustomFeedModal,
};

type GetComponentProps<T> = T extends
  | React.ComponentType<infer P>
  | React.Component<infer P>
  ? P
  : never;

export type ModalsType = typeof modals;

export type LazyPropTypes = Partial<
  {
    [K in keyof ModalsType]: GetComponentProps<ModalsType[K]>;
  }[keyof ModalsType]
>;

type LazyModalComponentType<K extends LazyModal> = Omit<
  GetComponentProps<ModalsType[K]>,
  'isOpen' | 'onRequestClose'
>;

type RequiredKeys<T> = {
  [K in keyof T]: Record<string, never> extends { [P in K]: T[K] } ? never : K;
}[keyof T];

type NonOptional<T> = Pick<T, RequiredKeys<T>>;

export type LazyModalType<T extends keyof ModalsType> = {
  [K in keyof ModalsType]: NonOptional<
    LazyModalComponentType<K>
  > extends Record<string, never>
    ? {
        type: K;
        persistOnRouteChange?: boolean;
        props?: LazyModalComponentType<K>;
      }
    : {
        type: K;
        persistOnRouteChange?: boolean;
        props: LazyModalComponentType<K>;
      };
}[T];

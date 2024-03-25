import request, { gql } from 'graphql-request';
import { subDays } from 'date-fns';
import {
  SHARED_POST_INFO_FRAGMENT,
  USER_SHORT_INFO_FRAGMENT,
} from './fragments';
import type { PublicProfile } from '../lib/user';
import { Connection } from './common';
import { SourceMember } from './sources';
import { graphqlUrl } from '../lib/config';

type PostStats = {
  numPosts: number;
  numPostViews: number;
  numPostUpvotes: number;
};
type CommentStats = { numComments: number; numCommentUpvotes: number };

export type UserStats = PostStats & CommentStats;
export type UserStatsData = { userStats: UserStats };

export const USER_BY_ID_STATIC_FIELDS_QUERY = `
  query User($id: ID!) {
    user(id: $id) {
      id
      name
      image
      cover
      username
      bio
      twitter
      github
      hashnode
      timezone
      portfolio
      reputation
      permalink
      createdAt
      readmeHtml
    }
  }
`;

export const USER_README_QUERY = `
  query Readme($id: ID!) {
    user(id: $id) {
      readme
    }
  }
`;

export const UPDATE_README_MUTATION = `
  mutation UpdateReadme($content: String!) {
    updateReadme(content: $content) {
      readmeHtml
    }
  }
`;

export const USER_STATS_QUERY = gql`
  query UserStats($id: ID!) {
    userStats(id: $id) {
      numCommentUpvotes
      numComments
      numPostUpvotes
      numPostViews
      numPosts
    }
  }
`;

const publicSourceMemberships = `
sources: publicSourceMemberships(userId: $id, first: 30) {
  edges {
    node {
      role
      source {
        id
        name
        handle
        membersCount
        image
        permalink
        currentMember {
          role
        }
      }
    }
  }
}`;

export const PROFILE_V2_EXTRA_QUERY = gql`
  query ProfileV2($id: ID!) {
    userStats(id: $id) {
      upvotes: numPostUpvotes
      views: numPostViews
    }
    ${publicSourceMemberships}
  }
`;

export const PUBLIC_SOURCE_MEMBERSHIPS_QUERY = gql`
  query PublicSourceMemberships($id: ID!) {
    ${publicSourceMemberships}
  }
`;

export type ProfileV2 = {
  user: PublicProfile;
  userStats: { upvotes: number; views: number };
  sources: Connection<SourceMember>;
};

export type UserReadingRank = { currentRank: number };
export type UserReadingRankData = { userReadingRank: UserReadingRank };
export type MostReadTag = {
  value: string;
  count: number;
  percentage?: number;
  total?: number;
};

export const USER_READING_RANK_QUERY = gql`
  query UserReadingRank($id: ID!, $version: Int) {
    userReadingRank(id: $id, version: $version) {
      currentRank
    }
  }
`;

export const USER_TOOLTIP_CONTENT_QUERY = gql`
  query UserTooltipContent(
    $id: ID!
    $version: Int
    $requestUserInfo: Boolean!
  ) {
    rank: userReadingRank(id: $id, version: $version) {
      currentRank
    }
    tags: userMostReadTags(id: $id) {
      value
    }
    user(id: $id) @include(if: $requestUserInfo) {
      ...UserShortInfo
    }
  }
  ${USER_SHORT_INFO_FRAGMENT}
`;

export type Tag = {
  tag: string;
  readingDays: number;
  percentage?: number;
};
export type TopTags = Tag[];
export interface MyRankData {
  rank: {
    rankLastWeek: number;
    currentRank: number;
    progressThisWeek: number;
    tags: TopTags;
    readToday: boolean;
    lastReadTime?: Date;
  };
}

export const MY_READING_RANK_QUERY = gql`
  query UserReadingRank($id: ID!, $version: Int) {
    rank: userReadingRank(id: $id, version: $version) {
      rankLastWeek
      currentRank
      progressThisWeek
      readToday
      lastReadTime
      tags {
        tag
        readingDays
        percentage
      }
    }
  }
`;

export type ProfileReadingData = UserReadingRankHistoryData &
  UserReadHistoryData &
  UserReadingTopTagsData;

export type UserReadingRankHistory = { rank: number; count: number };
export interface UserReadingRankHistoryData {
  userReadingRankHistory: UserReadingRankHistory[];
}

export type UserReadHistory = { date: string; reads: number };
export interface UserReadHistoryData {
  userReadHistory: UserReadHistory[];
}
export interface UserReadingTopTagsData {
  userMostReadTags: MostReadTag[];
}

export const USER_READING_HISTORY_QUERY = gql`
  query UserReadingHistory(
    $id: ID!
    $after: String!
    $before: String!
    $version: Int
    $limit: Int
  ) {
    userReadingRankHistory(
      id: $id
      version: $version
      after: $after
      before: $before
    ) {
      rank
      count
    }
    userReadHistory(id: $id, after: $after, before: $before) {
      date
      reads
    }
    userMostReadTags(id: $id, after: $after, before: $before, limit: $limit) {
      value
      count
      total
      percentage
    }
  }
`;

export const USER_STREAK_HISTORY = gql`
  query UserStreakHistory($id: ID!, $after: String!, $before: String!) {
    userReadHistory(id: $id, after: $after, before: $before) {
      date
      reads
    }
  }
`;

const READING_HISTORY_FRAGMENT = gql`
  fragment ReadingHistoryFragment on ReadingHistory {
    timestamp
    timestampDb
    post {
      ...SharedPostInfo
      sharedPost {
        ...SharedPostInfo
      }
    }
  }
  ${SHARED_POST_INFO_FRAGMENT}
`;

const READING_HISTORY_CONNECTION_FRAGMENT = gql`
  ${READING_HISTORY_FRAGMENT}
  fragment ReadingHistoryConnectionFragment on ReadingHistoryConnection {
    pageInfo {
      endCursor
      hasNextPage
    }
    edges {
      node {
        ...ReadingHistoryFragment
      }
    }
  }
`;

export interface HidePostItemCardProps {
  timestamp: Date;
  postId: string;
}

export const SEARCH_READING_HISTORY_SUGGESTIONS = gql`
  query SearchReadingHistorySuggestions($query: String!) {
    searchReadingHistorySuggestions(query: $query) {
      hits {
        title
      }
    }
  }
`;

export const SEARCH_READING_HISTORY_QUERY = gql`
  ${READING_HISTORY_CONNECTION_FRAGMENT}
  query SearchReadingHistory($first: Int, $after: String, $query: String!) {
    readHistory: searchReadingHistory(
      first: $first
      after: $after
      query: $query
    ) {
      ...ReadingHistoryConnectionFragment
    }
  }
`;

export const READING_HISTORY_QUERY = gql`
  ${READING_HISTORY_CONNECTION_FRAGMENT}
  query ReadHistory($after: String, $first: Int, $isPublic: Boolean) {
    readHistory(after: $after, first: $first, isPublic: $isPublic) {
      ...ReadingHistoryConnectionFragment
    }
  }
`;

export const HIDE_READING_HISTORY_MUTATION = gql`
  mutation HideReadHistory($postId: String!, $timestamp: DateTime!) {
    hideReadHistory(postId: $postId, timestamp: $timestamp) {
      _
    }
  }
`;

export const UPDATE_USER_PROFILE_MUTATION = gql`
  mutation UpdateUserProfile($data: UpdateUserInput, $upload: Upload) {
    updateUserProfile(data: $data, upload: $upload) {
      id
      name
      image
      username
      permalink
      bio
      twitter
      github
      hashnode
      createdAt
      infoConfirmed
      timezone
    }
  }
`;

export const UPLOAD_COVER_MUTATION = gql`
  mutation UploadCoverImage($upload: Upload!) {
    user: uploadCoverImage(image: $upload) {
      cover
    }
  }
`;

export const GET_USERNAME_SUGGESTION = gql`
  query GenerateUniqueUsername($name: String!) {
    generateUniqueUsername(name: $name)
  }
`;

// Regex taken from https://github.com/dailydotdev/daily-api/blob/234b0be53fea85954403cef5a2326fc50ce498fd/src/common/object.ts#L41
export const handleRegex = new RegExp(/^@?[a-z0-9](\w){2,38}$/i);
// Regex taken from https://github.com/dailydotdev/daily-api/blob/234b0be53fea85954403cef5a2326fc50ce498fd/src/common/object.ts#L40
export const socialHandleRegex = new RegExp(/^@?([\w-]){1,39}$/i);

export const REFERRAL_CAMPAIGN_QUERY = gql`
  query ReferralCampaign($referralOrigin: String!) {
    referralCampaign(referralOrigin: $referralOrigin) {
      referredUsersCount
      referralCountLimit
      referralToken
      url
    }
  }
`;

export const GET_REFERRING_USER_QUERY = gql`
  query User($id: ID!) {
    user(id: $id) {
      ...UserShortInfo
    }
  }
  ${USER_SHORT_INFO_FRAGMENT}
`;

export type UserPersonalizedDigest = {
  preferredDay: number;
  preferredHour: number;
  preferredTimezone: string;
};

export type UserPersonalizedDigestSubscribe = {
  day?: number;
  hour?: number;
  timezone?: string;
};

export const GET_PERSONALIZED_DIGEST_SETTINGS = gql`
  query PersonalizedDigest {
    personalizedDigest {
      preferredDay
      preferredHour
      preferredTimezone
    }
  }
`;

export const REFERRED_USERS_QUERY = gql`
  query ReferredUsers {
    referredUsers {
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        node {
          ...UserShortInfo
        }
      }
    }
  }
  ${USER_SHORT_INFO_FRAGMENT}
`;

export const SUBSCRIBE_PERSONALIZED_DIGEST_MUTATION = gql`
  mutation SubscribePersonalizedDigest(
    $hour: Int
    $day: Int
    $timezone: String
  ) {
    subscribePersonalizedDigest(hour: $hour, day: $day, timezone: $timezone) {
      preferredDay
      preferredHour
      preferredTimezone
    }
  }
`;

export const UNSUBSCRIBE_PERSONALIZED_DIGEST_MUTATION = gql`
  mutation UnsubscribePersonalizedDigest {
    unsubscribePersonalizedDigest {
      _
    }
  }
`;

export interface ReadingDay {
  date: string;
  reads: number;
}

export const getReadingStreak30Days = async (
  id: string,
  start: Date = subDays(new Date(), 30),
): Promise<ReadingDay[]> => {
  const today = new Date();
  const res = await request(graphqlUrl, USER_STREAK_HISTORY, {
    after: start.toISOString(),
    before: today.toISOString(),
    id,
  });

  return res.userReadHistory;
};

export const USER_STREAK_QUERY = gql`
  query UserStreak {
    userStreak {
      max
      total
      current
      lastViewAt
    }
  }
`;

export interface UserStreak {
  max: number;
  total: number;
  current: number;
  lastViewAt: Date;
}

export const getReadingStreak = async (): Promise<UserStreak> => {
  const res = await request(graphqlUrl, USER_STREAK_QUERY);

  return res.userStreak;
};

export const DEV_CARD_QUERY = gql`
  query DevCardById($id: ID!) {
    devCard(id: $id) {
      id
      user {
        ...UserShortInfo
        cover
      }
      createdAt
      theme
      isProfileCover
      showBorder
      articlesRead
      tags
      sources {
        name
        permalink
        image
      }
    }
  }
  ${USER_SHORT_INFO_FRAGMENT}
`;

export enum AcquisitionChannel {
  Friend = 'friend',
  SocialMedia = 'social_media',
  SearchEngine = 'search_engine',
  Blog = 'blog',
  ExtensionStore = 'extension_store',
  Advertisement = 'ad',
  Other = 'other',
}

export const USER_ACQUISITION_MUTATION = gql`
  mutation AddUserAcquisitionChannel($acquisitionChannel: AcquisitionChannel!) {
    addUserAcquisitionChannel(acquisitionChannel: $acquisitionChannel) {
      _
    }
  }
`;

export const updateUserAcquisition = (
  acquisitionChannel: AcquisitionChannel,
): Promise<void> =>
  request(graphqlUrl, USER_ACQUISITION_MUTATION, { acquisitionChannel });

export const CLEAR_MARKETING_CTA_MUTATION = gql`
  mutation ClearUserMarketingCta($campaignId: String!) {
    clearUserMarketingCta(campaignId: $campaignId) {
      _
    }
  }
`;

import { gql } from 'graphql-request';

export const CURRENT_MEMBER_FRAGMENT = gql`
  fragment CurrentMember on SourceMember {
    user {
      id
    }
    permissions
    role
    referralToken
    flags {
      hideFeedPosts
      collapsePinnedPosts
    }
  }
`;

export const USER_SHORT_INFO_FRAGMENT = gql`
  fragment UserShortInfo on User {
    id
    name
    image
    permalink
    username
    bio
    createdAt
    reputation
    companies {
      name
      image
    }
    isPlus
    plusMemberSince
  }
`;

export const CONTENT_PREFERENCE_FRAMENT = gql`
  fragment ContentPreferenceFragment on ContentPreference {
    referenceId
    type
    status
  }
`;

export const USER_SHORT_INFO_TOP_READER_FRAGMENT = gql`
  fragment UserShortInfoTopReaderFragment on User {
    topReader {
      issuedAt
      keyword {
        value
        flags {
          title
        }
      }
    }
  }
`;

export const USER_AUTHOR_FRAGMENT = gql`
  fragment UserAuthor on User {
    ...UserShortInfo
    contentPreference {
      ...ContentPreferenceFragment
    }
    ...UserShortInfoTopReaderFragment
  }
  ${CONTENT_PREFERENCE_FRAMENT}
  ${USER_SHORT_INFO_FRAGMENT}
  ${USER_SHORT_INFO_TOP_READER_FRAGMENT}
`;

export const USER_BASIC_INFO = gql`
  fragment UserBasicInfo on User {
    id
    name
    image
    permalink
  }
`;

export const SOURCE_DIRECTORY_INFO_FRAGMENT = gql`
  fragment SourceDirectoryInfo on Source {
    id
    name
    handle
    image
    permalink
    description
  }
`;

export const SOURCE_SHORT_INFO_FRAGMENT = gql`
  fragment SourceShortInfo on Source {
    id
    handle
    name
    permalink
    description
    image
    type
    active
    public
  }
`;

export const PRIVILEGED_MEMBERS_FRAGMENT = gql`
  fragment PrivilegedMembers on Source {
    privilegedMembers {
      user {
        id
        name
        image
        permalink
        username
        bio
        reputation
        companies {
          name
          image
        }
        contentPreference {
          status
        }
      }
      role
    }
  }
`;

// this query should use UserShortInfo fragment once the createdAt issue is fixed.
// for the mean time, we should not include the said property on privilegedMembers.
export const SOURCE_BASE_FRAGMENT = gql`
  fragment SourceBaseInfo on Source {
    id
    active
    handle
    name
    permalink
    public
    type
    description
    image
    membersCount
    currentMember {
      ...CurrentMember
    }
    memberPostingRole
    memberInviteRole
    moderationRequired
  }
  ${CURRENT_MEMBER_FRAGMENT}
`;

export const SQUAD_BASE_FRAGMENT = `
  fragment SquadBaseInfo on Source {
    ...SourceBaseInfo
    referralUrl
    createdAt
    flags {
      featured
      totalPosts
      totalViews
      totalUpvotes
    }
    category {
      id
      title
      slug
    }
    ...PrivilegedMembers
  }
  ${SOURCE_BASE_FRAGMENT}
  ${PRIVILEGED_MEMBERS_FRAGMENT}
`;

export const FEED_POST_INFO_FRAGMENT = gql`
  fragment FeedPostInfo on Post {
    id
    title
    image
    readTime
    permalink
    commentsPermalink
    createdAt
    commented
    bookmarked
    views
    numUpvotes
    numComments
    summary
    bookmark {
      remindAt
    }
    author {
      id
      name
      image
      username
      permalink
    }
    type
    tags
    source {
      id
      handle
      name
      permalink
      image
      type
    }
    userState {
      vote
      flags {
        feedbackDismiss
      }
    }
    slug
    clickbaitTitleDetected
  }
`;

export const SHARED_POST_INFO_FRAGMENT = gql`
  fragment SharedPostInfo on Post {
    id
    title
    titleHtml
    image
    readTime
    permalink
    commentsPermalink
    summary
    createdAt
    private
    upvoted
    commented
    bookmarked
    views
    numUpvotes
    numComments
    videoId
    bookmark {
      remindAt
    }
    scout {
      ...UserAuthor
    }
    author {
      ...UserAuthor
    }
    type
    tags
    source {
      ...SourceBaseInfo
      ...PrivilegedMembers
    }
    downvoted
    flags {
      promoteToPublic
    }
    userState {
      vote
      flags {
        feedbackDismiss
      }
    }
    slug
    domain
    clickbaitTitleDetected
  }
  ${PRIVILEGED_MEMBERS_FRAGMENT}
  ${SOURCE_BASE_FRAGMENT}
  ${USER_AUTHOR_FRAGMENT}
`;

export const COMMENT_FRAGMENT = gql`
  fragment CommentFragment on Comment {
    id
    contentHtml
    createdAt
    lastUpdatedAt
    permalink
    numUpvotes
    author {
      ...UserAuthor
    }
    userState {
      vote
    }
  }
  ${USER_AUTHOR_FRAGMENT}
`;

export const RELATED_POST_FRAGMENT = gql`
  fragment RelatedPost on Post {
    id
    commentsPermalink
    title
    summary
    createdAt
    source {
      id
      handle
      name
      image
    }
  }
`;

export const CUSTOM_FEED_FRAGMENT = gql`
  fragment CustomFeed on Feed {
    id
    userId
    flags {
      name
      icon
      orderBy
      maxDayRange
      minUpvotes
      minViews
      disableEngagementFilter
    }
    slug
    createdAt
  }
`;

export const LEADERBOARD_FRAMENT = gql`
  fragment LeaderboardFragment on Leaderboard {
    score
    user {
      ...UserShortInfo
    }
  }
  ${USER_SHORT_INFO_FRAGMENT}
`;

export const USER_STREAK_FRAGMENT = gql`
  fragment UserStreakFragment on UserStreak {
    max
    total
    current
    lastViewAt
    lastViewAtTz
    weekStart
  }
`;

export const SOURCE_CATEGORY_FRAGMENT = gql`
  fragment SourceCategoryFragment on SourceCategory {
    id
    slug
    title
  }
`;

export const POST_CODE_SNIPPET_FRAGMENT = gql`
  fragment PostCodeSnippet on PostCodeSnippet {
    content
  }
`;

export const TOP_READER_BADGE_FRAGMENT = gql`
  fragment TopReader on UserTopReader {
    id
    issuedAt
    image
    total
    keyword {
      value
      flags {
        title
      }
    }
  }
`;

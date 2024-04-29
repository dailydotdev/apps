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
  }
`;

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
    privilegedMembers {
      user {
        id
      }
      role
    }
    currentMember {
      ...CurrentMember
    }
    memberPostingRole
    memberInviteRole
  }
  ${CURRENT_MEMBER_FRAGMENT}
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
    scout {
      ...UserShortInfo
    }
    author {
      ...UserShortInfo
    }
    type
    tags
    source {
      ...SourceBaseInfo
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
  }
  ${SOURCE_BASE_FRAGMENT}
  ${USER_SHORT_INFO_FRAGMENT}
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
      ...UserShortInfo
    }
    userState {
      vote
    }
  }
  ${USER_SHORT_INFO_FRAGMENT}
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

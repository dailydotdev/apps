import { gql } from 'graphql-request';

export const CURRENT_MEMBER_FRAGMENT = gql`
  fragment CurrentMember on SourceMember {
    user {
      id
    }
    permissions
    role
    referralToken
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
    currentMember {
      ...CurrentMember
    }
    memberPostingRole
  }
  ${CURRENT_MEMBER_FRAGMENT}
`;

export const SHARED_POST_INFO_FRAGMENT = gql`
  fragment SharedPostInfo on Post {
    id
    title
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
    numUpvotes
    numComments
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
  }
  ${SOURCE_BASE_FRAGMENT}
  ${USER_SHORT_INFO_FRAGMENT}
`;

export const COMMENT_FRAGMENT = gql`
  fragment CommentFragment on Comment {
    id
    content
    contentHtml
    createdAt
    lastUpdatedAt
    permalink
    upvoted
    numUpvotes
    author {
      ...UserShortInfo
    }
  }
  ${USER_SHORT_INFO_FRAGMENT}
`;

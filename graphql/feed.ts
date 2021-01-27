import { gql } from 'graphql-request';

export const FEED_POST_FRAGMENT = gql`
  fragment FeedPost on Post {
    id
    title
    createdAt
    image
    placeholder
    readTime
    source {
      id
      name
      image
    }
    permalink
    numComments
    numUpvotes
    commentsPermalink
  }
`;

export const USER_POST_FRAGMENT = gql`
  fragment UserPost on Post {
    read
    upvoted
    commented
  }
`;

export const FEED_POST_CONNECTION_FRAGMENT = gql`
  fragment FeedPostConnection on PostConnection {
    pageInfo {
      hasNextPage
      endCursor
    }
    edges {
      node {
        ...FeedPost
        ...UserPost @include(if: $loggedIn)
      }
    }
  }
  ${FEED_POST_FRAGMENT}
  ${USER_POST_FRAGMENT}
`;

export const ANONYMOUS_FEED_QUERY = gql`
  query AnonymousFeed(
    $loggedIn: Boolean! = false
    $first: Int
    $after: String
    $ranking: Ranking
  ) {
    page: anonymousFeed(first: $first, after: $after, ranking: $ranking) {
      ...FeedPostConnection
    }
  }
  ${FEED_POST_CONNECTION_FRAGMENT}
`;

export const FEED_QUERY = gql`
  query Feed(
    $loggedIn: Boolean! = false
    $first: Int
    $after: String
    $ranking: Ranking
    $unreadOnly: Boolean
  ) {
    page: feed(
      first: $first
      after: $after
      ranking: $ranking
      unreadOnly: $unreadOnly
    ) {
      ...FeedPostConnection
    }
  }
  ${FEED_POST_CONNECTION_FRAGMENT}
`;

export const MOST_UPVOTED_FEED_QUERY = gql`
  query MostUpvotedFeed(
    $loggedIn: Boolean! = false
    $first: Int
    $after: String
  ) {
    page: mostUpvotedFeed(first: $first, after: $after) {
      ...FeedPostConnection
    }
  }
  ${FEED_POST_CONNECTION_FRAGMENT}
`;

export const TAG_FEED_QUERY = gql`
  query TagFeed(
    $tag: String!
    $loggedIn: Boolean! = false
    $first: Int
    $after: String
    $ranking: Ranking
  ) {
    page: tagFeed(tag: $tag, first: $first, after: $after, ranking: $ranking) {
      ...FeedPostConnection
    }
  }
  ${FEED_POST_CONNECTION_FRAGMENT}
`;

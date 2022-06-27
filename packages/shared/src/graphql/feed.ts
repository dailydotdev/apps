import { gql } from 'graphql-request';

export enum RankingAlgorithm {
  Popularity = 'POPULARITY',
  Time = 'TIME',
}

export enum MyFeedMode {
  Manual = 'manual',
  Auto = 'auto',
}

export const FEED_POST_FRAGMENT = gql`
  fragment FeedPost on Post {
    id
    title
    createdAt
    image
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
    scout {
      id
      name
      image
      username
    }
    author {
      id
      name
      image
      username
      permalink
    }
    trending
    tags
  }
`;

export const USER_POST_FRAGMENT = gql`
  fragment UserPost on Post {
    read
    upvoted
    commented
    bookmarked
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
    $version: Int
  ) {
    page: anonymousFeed(
      first: $first
      after: $after
      ranking: $ranking
      version: $version
    ) {
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
    $version: Int
  ) {
    page: feed(
      first: $first
      after: $after
      ranking: $ranking
      unreadOnly: $unreadOnly
      version: $version
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
    $period: Int
  ) {
    page: mostUpvotedFeed(first: $first, after: $after, period: $period) {
      ...FeedPostConnection
    }
  }
  ${FEED_POST_CONNECTION_FRAGMENT}
`;

export const MOST_DISCUSSED_FEED_QUERY = gql`
  query MostDiscussedFeed(
    $loggedIn: Boolean! = false
    $first: Int
    $after: String
  ) {
    page: mostDiscussedFeed(first: $first, after: $after) {
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

export const SOURCE_FEED_QUERY = gql`
  query SourceFeed(
    $source: ID!
    $loggedIn: Boolean! = false
    $first: Int
    $after: String
    $ranking: Ranking
  ) {
    page: sourceFeed(
      source: $source
      first: $first
      after: $after
      ranking: $ranking
    ) {
      ...FeedPostConnection
    }
  }
  ${FEED_POST_CONNECTION_FRAGMENT}
`;

export const BOOKMARKS_FEED_QUERY = gql`
  query BookmarksFeed(
    $loggedIn: Boolean! = false
    $first: Int
    $after: String
  ) {
    page: bookmarksFeed(first: $first, after: $after) {
      ...FeedPostConnection
    }
  }
  ${FEED_POST_CONNECTION_FRAGMENT}
`;

export const SEARCH_BOOKMARKS_QUERY = gql`
  query SearchBookmarks(
    $loggedIn: Boolean! = false
    $first: Int
    $after: String
    $query: String!
  ) {
    page: searchBookmarks(first: $first, after: $after, query: $query) {
      ...FeedPostConnection
    }
  }
  ${FEED_POST_CONNECTION_FRAGMENT}
`;

export const SEARCH_BOOKMARKS_SUGGESTIONS = gql`
  query SearchBookmarksSuggestions($query: String!) {
    searchBookmarksSuggestions(query: $query) {
      hits {
        title
      }
    }
  }
`;

export const SEARCH_POSTS_QUERY = gql`
  query SearchPosts(
    $loggedIn: Boolean! = false
    $first: Int
    $after: String
    $query: String!
  ) {
    page: searchPosts(first: $first, after: $after, query: $query) {
      ...FeedPostConnection
    }
  }
  ${FEED_POST_CONNECTION_FRAGMENT}
`;

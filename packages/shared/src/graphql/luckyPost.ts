import { gql } from 'graphql-request';

export const LUCKY_POST_QUERY = gql`
  query LuckyPost {
    randomTrendingPosts(first: 1) {
      id
      commentsPermalink
    }
  }
`;

export type LuckyPostData = {
  randomTrendingPosts: { id: string; commentsPermalink: string }[];
};

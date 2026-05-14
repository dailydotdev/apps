import { gql } from 'graphql-request';

export type FeedTagsListData = {
  feedTagsList: {
    tags: string[];
  };
};

export const FEED_TAGS_LIST_QUERY = gql`
  query FeedTagsList($limit: Int) {
    feedTagsList(limit: $limit) {
      tags
    }
  }
`;

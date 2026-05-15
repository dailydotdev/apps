import { gql } from 'graphql-request';

export type FeedTagsListItem = {
  value: string;
  label: string;
};

export type FeedTagsListData = {
  feedTagsList: {
    tags: FeedTagsListItem[];
  };
};

export const FEED_TAGS_LIST_QUERY = gql`
  query FeedTagsList($limit: Int) {
    feedTagsList(limit: $limit) {
      tags {
        value
        label
      }
    }
  }
`;

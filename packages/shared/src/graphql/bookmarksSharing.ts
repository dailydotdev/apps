import { gql } from 'graphql-request';

export type BookmarksSharing = {
  enabled: boolean;
  slug: string | null;
  rssUrl: string | null;
};

export type BookmarksSharingData = { bookmarksSharing: BookmarksSharing };

export const BOOKMARK_SHARING_QUERY = gql`
  query BookmarksSharing {
    bookmarksSharing {
      enabled
      slug
      rssUrl
    }
  }
`;

export const BOOKMARK_SHARING_MUTATION = gql`
  mutation SetBookmarksSharing($enabled: Boolean!) {
    bookmarksSharing: setBookmarksSharing(enabled: $enabled) {
      enabled
      slug
      rssUrl
    }
  }
`;

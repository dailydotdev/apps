import { gql } from 'graphql-request';
import type { EmptyResponse } from './emptyResponse';
import { gqlClient } from './common';
import { gqlBatchRequest } from './batch';
import type { FeedData } from './feed';
import {
  BOOKMARKS_FEED_QUERY,
  BookmarkSort,
  BookmarkStatus,
  baseFeedSupportedTypes,
} from './feed';
import type { LoggedUser } from '../lib/user';
import { generateQueryKey, RequestKey, StaleTime } from '../lib/query';

export const SET_BOOKMARK_REMINDER = gql`
  mutation SetBookmarkReminder($postId: ID!, $remindAt: DateTime) {
    setBookmarkReminder(postId: $postId, remindAt: $remindAt) {
      _
    }
  }
`;

export interface Bookmark {
  listId?: string;
  createdAt: Date;
  remindAt?: Date;
  archivedAt?: Date | null;
  note?: string | null;
  // Marked read, or viewed since it was last marked unread
  read?: boolean;
}

export const MAX_BOOKMARK_NOTE_LENGTH = 280;

export const SET_BOOKMARK_READ_STATE = gql`
  mutation SetBookmarkReadState($postId: ID!, $read: Boolean!) {
    setBookmarkReadState(postId: $postId, read: $read) {
      _
    }
  }
`;

export const setBookmarkReadState = ({
  postId,
  read,
}: {
  postId: string;
  read: boolean;
}): Promise<EmptyResponse> =>
  gqlClient.request(SET_BOOKMARK_READ_STATE, { postId, read });

export const SET_BOOKMARK_ARCHIVED = gql`
  mutation SetBookmarkArchived($postId: ID!, $archived: Boolean!) {
    setBookmarkArchived(postId: $postId, archived: $archived) {
      _
    }
  }
`;

export const setBookmarkArchived = ({
  postId,
  archived,
}: {
  postId: string;
  archived: boolean;
}): Promise<EmptyResponse> =>
  gqlClient.request(SET_BOOKMARK_ARCHIVED, { postId, archived });

export const SET_BOOKMARK_NOTE = gql`
  mutation SetBookmarkNote($postId: ID!, $note: String) {
    setBookmarkNote(postId: $postId, note: $note) {
      _
    }
  }
`;

export const setBookmarkNote = ({
  postId,
  note,
}: {
  postId: string;
  note?: string | null;
}): Promise<EmptyResponse> =>
  gqlClient.request(SET_BOOKMARK_NOTE, { postId, note: note || null });

export interface BookmarkTagFacet {
  tag: string;
  count: number;
}

export interface BookmarkSourceFacet {
  id: string;
  name: string;
  image?: string | null;
  count: number;
}

export interface BookmarkFacets {
  tags: BookmarkTagFacet[];
  sources: BookmarkSourceFacet[];
  squads: BookmarkSourceFacet[];
}

const BOOKMARK_FACETS_FIELDS = `
      tags {
        tag
        count
      }
      sources {
        id
        name
        image
        count
      }
      squads {
        id
        name
        image
        count
      }
`;

export const BOOKMARK_FACETS_QUERY = gql`
  query BookmarkFacets($listId: ID, $status: BookmarkStatus) {
    bookmarkFacets(listId: $listId, status: $status) {
      ${BOOKMARK_FACETS_FIELDS}
    }
  }
`;

// Its own document so the argument is only sent where it applies
export const BOOKMARK_REMINDER_FACETS_QUERY = gql`
  query BookmarkReminderFacets($status: BookmarkStatus) {
    bookmarkFacets(status: $status, reminderOnly: true) {
      ${BOOKMARK_FACETS_FIELDS}
    }
  }
`;

interface BookmarkFacetsQueryOptionsProps {
  user?: Pick<LoggedUser, 'id'>;
  listId?: string;
  status?: BookmarkStatus;
  reminderOnly?: boolean;
}

// Scoped to the folder and read status, not to the tag or source filters, so
// the chips keep their counts while the user clicks around.
export const bookmarkFacetsQueryOptions = ({
  user,
  listId,
  status = BookmarkStatus.All,
  reminderOnly = false,
}: BookmarkFacetsQueryOptionsProps) => ({
  queryKey: generateQueryKey(RequestKey.BookmarkFacets, user, {
    listId: listId ?? null,
    status,
    reminderOnly,
  }),
  queryFn: async (): Promise<BookmarkFacets> => {
    const { bookmarkFacets } = await gqlBatchRequest<{
      bookmarkFacets: BookmarkFacets;
    }>(
      reminderOnly ? BOOKMARK_REMINDER_FACETS_QUERY : BOOKMARK_FACETS_QUERY,
      reminderOnly ? { status } : { listId, status },
    );

    return bookmarkFacets;
  },
  staleTime: StaleTime.Default,
});

export interface BookmarkFolder {
  id: string;
  name: string;
  icon?: string | null;
  createdAt: Date;
  updatedAt: Date;
  bookmarks?: Bookmark[];
}

export interface SetBookmarkReminderProps {
  postId: string;
  remindAt?: Date | null;
}

export const setBookmarkReminder = ({
  postId,
  remindAt,
}: SetBookmarkReminderProps): Promise<EmptyResponse> =>
  gqlClient.request(SET_BOOKMARK_REMINDER, {
    postId,
    remindAt: remindAt ? remindAt.toISOString() : null,
  });

export const MOVE_BOOKMARK_TO_FOLDER = gql`
  mutation MoveBookmarkToFolder($postId: ID!, $listId: ID) {
    moveBookmark(id: $postId, listId: $listId) {
      _
    }
  }
`;

export interface MoveBookmarkToFolderProps {
  postId: string;
  listId?: string;
}

export const moveBookmarkToFolder = ({
  postId,
  listId,
}: MoveBookmarkToFolderProps): Promise<EmptyResponse> =>
  gqlClient.request(MOVE_BOOKMARK_TO_FOLDER, {
    postId,
    listId,
  });

export const GET_BOOKMARK_FOLDERS = gql`
  query GetBookmarkFolders {
    bookmarkLists {
      id
      name
      icon
    }
  }
`;

export const getBookmarkFolders = async (): Promise<BookmarkFolder[]> => {
  return gqlBatchRequest<{
    bookmarkLists: Array<BookmarkFolder>;
  }>(GET_BOOKMARK_FOLDERS).then((data) => data.bookmarkLists);
};

export const CREATE_BOOKMARK_FOLDER = gql`
  mutation CreateBookmarkFolder($name: String!, $icon: String) {
    createBookmarkList(name: $name, icon: $icon) {
      id
      name
      icon
    }
  }
`;

export const createBookmarkFolder = async ({
  name,
  icon,
}: Pick<BookmarkFolder, 'name' | 'icon'>): Promise<BookmarkFolder> => {
  return gqlClient
    .request<{
      createBookmarkList: BookmarkFolder;
    }>(CREATE_BOOKMARK_FOLDER, {
      name,
      icon,
    })
    .then((data) => data.createBookmarkList);
};

export const UPDATE_BOOKMARK_FOLDER = gql`
  mutation UpdateBookmarkList($id: ID!, $name: String!, $icon: String) {
    updateBookmarkList(id: $id, name: $name, icon: $icon) {
      icon
      name
    }
  }
`;

export const updateBookmarkFolder = async ({
  id,
  name,
  icon,
}: BookmarkFolder): Promise<BookmarkFolder> => {
  return gqlClient
    .request<{
      updateBookmarkList: BookmarkFolder;
    }>(UPDATE_BOOKMARK_FOLDER, {
      id,
      name,
      icon,
    })
    .then((data) => data.updateBookmarkList);
};

export const DELETE_BOOKMARK_FOLDER = gql`
  mutation RemoveBookmarkList($id: ID!) {
    removeBookmarkList(id: $id) {
      _
    }
  }
`;

export const deleteBookmarkFolder = async (
  id: string,
): Promise<EmptyResponse> => {
  return gqlClient.request(DELETE_BOOKMARK_FOLDER, { id });
};

export const getLatestBookmarksQueryKey = (
  user?: Pick<LoggedUser, 'id'>,
): ReturnType<typeof generateQueryKey> =>
  generateQueryKey(RequestKey.Bookmarks, user, 'latest');

/** The reader's latest bookmarks, newest first, as the bookmarks page lists them. */
export const latestBookmarksQueryOptions = ({
  user,
  first,
}: {
  user?: Pick<LoggedUser, 'id'>;
  first: number;
}) => ({
  queryKey: [...getLatestBookmarksQueryKey(user), first],
  queryFn: () =>
    gqlBatchRequest<FeedData>(BOOKMARKS_FEED_QUERY, {
      loggedIn: true,
      first,
      sort: BookmarkSort.TimeDesc,
      supportedTypes: baseFeedSupportedTypes,
    }),
  staleTime: StaleTime.OneMinute,
});

/** Whether the folder or view keeps any archived bookmark, out of the All list. */
export const archivedBookmarksQueryOptions = ({
  user,
  listId,
  reminderOnly = false,
}: {
  user?: Pick<LoggedUser, 'id'>;
  listId?: string;
  reminderOnly?: boolean;
}) => ({
  queryKey: generateQueryKey(RequestKey.Bookmarks, user, 'archived', {
    listId: listId ?? null,
    reminderOnly,
  }),
  queryFn: () =>
    gqlBatchRequest<FeedData>(BOOKMARKS_FEED_QUERY, {
      loggedIn: true,
      first: 1,
      ...(listId && { listId }),
      reminderOnly,
      status: BookmarkStatus.Archived,
      supportedTypes: baseFeedSupportedTypes,
    }),
});

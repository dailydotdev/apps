import { gql } from 'graphql-request';
import type { EmptyResponse } from './emptyResponse';
import { gqlClient } from './common';
import { gqlBatchRequest } from './batch';
import type { LoggedUser } from '../lib/user';
import { generateQueryKey, RequestKey, StaleTime } from '../lib/query';
import { BookmarkStatus } from './feed';

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
  readAt?: Date | null;
  unreadAt?: Date | null;
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

export const BOOKMARK_FACETS_QUERY = gql`
  query BookmarkFacets($listId: ID, $status: BookmarkStatus) {
    bookmarkFacets(listId: $listId, status: $status) {
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
    }
  }
`;

interface BookmarkFacetsQueryOptionsProps {
  user?: Pick<LoggedUser, 'id'>;
  listId?: string;
  status?: BookmarkStatus;
}

// Scoped to the folder and read status, not to the tag or source filters, so
// the chips keep their counts while the user clicks around.
export const bookmarkFacetsQueryOptions = ({
  user,
  listId,
  status = BookmarkStatus.All,
}: BookmarkFacetsQueryOptionsProps) => ({
  queryKey: generateQueryKey(RequestKey.BookmarkFacets, user, {
    listId: listId ?? null,
    status,
  }),
  queryFn: async (): Promise<BookmarkFacets> => {
    const { bookmarkFacets } = await gqlBatchRequest<{
      bookmarkFacets: BookmarkFacets;
    }>(BOOKMARK_FACETS_QUERY, { listId, status });

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

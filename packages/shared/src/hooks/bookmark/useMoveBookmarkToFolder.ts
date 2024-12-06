import { useMutation } from '@tanstack/react-query';
import { moveBookmarkToFolder } from '../../graphql/bookmarks';
import { EmptyResponse } from '../../graphql/emptyResponse';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent } from '../../lib/log';

interface UseMoveBookmarkToFolder {
  isPending: boolean;
  moveBookmarkToFolder: (
    options: Record<'postId' | 'listId', string>,
  ) => Promise<EmptyResponse>;
}

const useMoveBookmarkToFolder = (): UseMoveBookmarkToFolder => {
  const { logEvent } = useLogContext();
  const { isPending, mutateAsync } = useMutation({
    mutationFn: moveBookmarkToFolder,
    onSuccess: () => {
      logEvent({
        event_name: LogEvent.MoveBookmarkToFolder,
      });
    },
  });

  return {
    isPending,
    moveBookmarkToFolder: mutateAsync,
  };
};

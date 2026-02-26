import { useJustBookmarked } from './useJustBookmarked';
import type { Post } from '../../graphql/posts';

export const useBookmarkReminderCover = (post: Post): boolean => {
  const { justBookmarked } = useJustBookmarked({
    bookmarked: post?.bookmarked ?? false,
  });

  return !!(justBookmarked && !post?.bookmark?.remindAt);
};

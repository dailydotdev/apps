import { Post } from '../../graphql/posts';
import { useJustBookmarked } from './useJustBookmarked';

export const useBookmarkReminderCover = (post: Post): boolean => {
  const { justBookmarked } = useJustBookmarked({
    bookmarked: post?.bookmarked,
  });

  return justBookmarked && !post?.bookmark?.remindAt;
};

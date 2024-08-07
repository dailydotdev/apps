import { useJustBookmarked } from './useJustBookmarked';
import { Post } from '../../graphql/posts';

export const useBookmarkReminderCover = (post: Post): boolean => {
  const { justBookmarked } = useJustBookmarked({
    bookmarked: post?.bookmarked,
  });

  return justBookmarked && !post?.bookmark?.remindAt;
};

import { useJustBookmarked } from '../bookmark';
import { useConditionalFeature } from '../useConditionalFeature';
import { feature } from '../../lib/featureManagement';
import { Post } from '../../graphql/posts';

export const useBookmarkReminderEnrollment = (post: Post): boolean => {
  const { justBookmarked } = useJustBookmarked({
    bookmarked: post?.bookmarked,
  });
  const shouldShowReminder = justBookmarked && !post?.bookmark?.remindAt;
  const { value: readItLater } = useConditionalFeature({
    feature: feature.bookmarkReminder,
    shouldEvaluate: shouldShowReminder,
  });

  return shouldShowReminder && readItLater;
};

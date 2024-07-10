import { useJustBookmarked } from '../useBookmarkProvider';
import { useConditionalFeature } from '../useConditionalFeature';
import { feature } from '../../lib/featureManagement';
import { Post } from '../../graphql/posts';

export const useBookmarkReminderEnrollment = (post: Post): boolean => {
  const { justBookmarked } = useJustBookmarked({ bookmarked: post.bookmarked });
  const shouldShowReminder = justBookmarked && !post.bookmark?.remindAt;
  const { value: readItLater } = useConditionalFeature({
    feature: feature.readItLater,
    shouldEvaluate: shouldShowReminder,
  });

  return shouldShowReminder && readItLater;
};

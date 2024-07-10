import { useJustBookmarked } from '../useBookmarkProvider';
import { useConditionalFeature } from '../useConditionalFeature';
import { feature } from '../../lib/featureManagement';
import { Bookmark } from '../../graphql/bookmarks';

export const useBookmarkReminderEnrollment = (bookmark: Bookmark): boolean => {
  const { justBookmarked } = useJustBookmarked({ bookmarked: !!bookmark });
  const isBookmarked = !!bookmark && !bookmark.remindAt;
  const shouldShowReminder = justBookmarked && !bookmark.remindAt;
  const { value: readItLater } = useConditionalFeature({
    feature: feature.readItLater,
    shouldEvaluate: shouldShowReminder || isBookmarked,
  });

  return readItLater;
};

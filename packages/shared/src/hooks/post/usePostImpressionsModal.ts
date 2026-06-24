import type { MouseEvent } from 'react';
import { useCallback } from 'react';
import type { Post } from '../../graphql/posts';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLazyModal } from '../useLazyModal';
import { LazyModal } from '../../components/modals/common/types';
import { canViewPostAnalytics } from '../../lib/user';

/**
 * Click handler for the impressions stat. Non-authors get the X-style explainer
 * popup; the author (or a team member) owns the post and has real analytics, so
 * they get no popup (returns `undefined` → the stat stays display-only).
 */
export const usePostImpressionsModal = (
  post: Pick<Post, 'author'>,
): ((event?: MouseEvent) => void) | undefined => {
  const { user } = useAuthContext();
  const { openModal } = useLazyModal();
  const isAuthor = canViewPostAnalytics({ user, post });

  const onClick = useCallback(
    (event?: MouseEvent) => {
      event?.stopPropagation();
      event?.preventDefault();
      openModal({ type: LazyModal.PostImpressions });
    },
    [openModal],
  );

  return isAuthor ? undefined : onClick;
};

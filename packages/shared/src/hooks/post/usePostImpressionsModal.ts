import type { MouseEvent } from 'react';
import { useCallback } from 'react';
import { useRouter } from 'next/router';
import type { Post } from '../../graphql/posts';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLazyModal } from '../useLazyModal';
import { LazyModal } from '../../components/modals/common/types';
import { canViewPostAnalytics } from '../../lib/user';

/**
 * Click handler for the impressions stat:
 * - the post owner (or a team member) can see real analytics, so they go to the
 *   post analytics page;
 * - everyone else gets the X/Twitter-style explainer popup.
 */
export const usePostImpressionsModal = (
  post: Pick<Post, 'id' | 'author'>,
): ((event?: MouseEvent) => void) => {
  const router = useRouter();
  const { user } = useAuthContext();
  const { openModal } = useLazyModal();
  const canViewAnalytics = canViewPostAnalytics({ user, post });

  return useCallback(
    (event?: MouseEvent) => {
      event?.stopPropagation();
      event?.preventDefault();

      if (canViewAnalytics) {
        router.push(`/posts/${post.id}/analytics`);
        return;
      }

      openModal({ type: LazyModal.PostImpressions });
    },
    [canViewAnalytics, openModal, router, post.id],
  );
};

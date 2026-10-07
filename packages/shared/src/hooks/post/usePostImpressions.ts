import type { MouseEvent } from 'react';
import { useCallback } from 'react';
import { useRouter } from 'next/router';
import type { Post } from '../../graphql/posts';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLazyModal } from '../useLazyModal';
import { LazyModal } from '../../components/modals/common/types';
import { canViewPostAnalytics } from '../../lib/user';
import { webappUrl } from '../../lib/constants';

type PostImpressionsPost = Pick<Post, 'analytics'> &
  Partial<Pick<Post, 'id'>> & {
    author?: Pick<NonNullable<Post['author']>, 'id'>;
  };

interface UsePostImpressionsResult {
  /** Render the public impressions stat only when true. */
  showImpressions: boolean;
  /** The real impression count (0 when none is available). */
  impressions: number;
  /** Whether this viewer may see the post's real analytics (author or team). */
  canViewAnalytics: boolean;
  /**
   * Click handler for the impressions stat:
   * - the post owner (or a team member) can see real analytics, so they go to
   *   the post analytics page;
   * - everyone else gets the X/Twitter-style explainer popup.
   */
  onImpressionsClick: (event?: MouseEvent) => void;
}

/**
 * Single source of truth for the impressions stat: who may see the real
 * numbers, whether it renders, and where a click goes. `analytics.impressions`
 * is exposed publicly by the API, so the count itself only renders where the
 * surface says it should — hidden at zero the same way the upvote/comment
 * counters are.
 */
export const usePostImpressions = (
  post: PostImpressionsPost,
): UsePostImpressionsResult => {
  const router = useRouter();
  const { user } = useAuthContext();
  const { openModal } = useLazyModal();
  const impressions = post.analytics?.impressions ?? 0;
  const canViewAnalytics = canViewPostAnalytics({ user, post });

  const onImpressionsClick = useCallback(
    (event?: MouseEvent) => {
      event?.stopPropagation();
      event?.preventDefault();

      if (canViewAnalytics) {
        router.push(`${webappUrl}posts/${post.id}/analytics`);
        return;
      }

      openModal({ type: LazyModal.PostImpressions });
    },
    [canViewAnalytics, openModal, router, post.id],
  );

  return {
    showImpressions: impressions > 0,
    impressions,
    canViewAnalytics,
    onImpressionsClick,
  };
};

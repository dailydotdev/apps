import { useQuery } from '@tanstack/react-query';
import type { Squad } from '../../../../graphql/sources';
import type {
  SquadFreeBoost,
  SquadFreeBoostPost,
} from '../../../../graphql/squadFreeBoost';
import {
  squadFreeBoostQueryOptions,
  SquadFreeBoostStatus,
} from '../../../../graphql/squadFreeBoost';
import type { PostAnalytics } from '../../../../graphql/posts';
import { postAnalyticsQueryOptions } from '../../../../graphql/posts';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { link } from '../../../../lib/links';
import { getSquadViewer, isStaffViewer } from '../../lib/viewer';
import type { FreeBoostPost, FreeBoostStats } from './FreeBoostCard';

export type FreeBoostState =
  | { state: 'first_post'; composeUrl: string }
  | {
      state: 'boosting';
      post: FreeBoostPost;
      stats: FreeBoostStats;
      spent: number;
      budget: number;
      /** Unset while the post's checks run */
      endsAt?: Date;
    };

// $100 at 100 Cores a dollar, shown before the campaign exists
const BUDGET = 10_000;

const toPost = (post: SquadFreeBoostPost): FreeBoostPost => ({
  title: post.title,
  image: post.image ?? undefined,
  permalink: post.commentsPermalink,
});

const toStats = (analytics?: PostAnalytics | null): FreeBoostStats => ({
  impressions: analytics?.impressions ?? 0,
  reach: analytics?.reach ?? 0,
  clicks: analytics?.clicks ?? 0,
  bookmarks: analytics?.bookmarks ?? 0,
  followers: analytics?.squadJoins ?? 0,
});

/**
 * What the free boost card shows from the API's answer. Null once the boost
 * ends or the offer expires: the value panel takes over then.
 */
export const getFreeBoostState = ({
  squad,
  freeBoost,
  analytics,
}: {
  squad: Pick<Squad, 'handle'>;
  freeBoost?: SquadFreeBoost | null;
  analytics?: PostAnalytics | null;
}): FreeBoostState | null => {
  if (!freeBoost) {
    return null;
  }

  const { status, post, campaign } = freeBoost;

  switch (status) {
    // A post held back for limited reach keeps the offer for the next one
    case SquadFreeBoostStatus.Available:
    case SquadFreeBoostStatus.Held:
      return {
        state: 'first_post',
        composeUrl: `${link.post.create}?sid=${squad.handle}`,
      };
    case SquadFreeBoostStatus.Pending:
      return post
        ? {
            state: 'boosting',
            post: toPost(post),
            stats: toStats(),
            spent: 0,
            budget: BUDGET,
          }
        : null;
    case SquadFreeBoostStatus.Active:
      if (!post || !campaign) {
        return null;
      }

      return {
        state: 'boosting',
        post: toPost(post),
        stats: toStats(analytics),
        spent: campaign.spend,
        budget: campaign.budget,
        endsAt: new Date(campaign.endedAt),
      };
    default:
      return null;
  }
};

/**
 * The free first-post boost of a company page, for its admins and
 * moderators: null when there is nothing to show them.
 */
export const useSquadFreeBoost = (squad: Squad): FreeBoostState | null => {
  const { user, isLoggedIn } = useAuthContext();
  const isStaff = isStaffViewer(getSquadViewer(squad, isLoggedIn));
  const { data: freeBoost } = useQuery({
    ...squadFreeBoostQueryOptions({ user, sourceId: squad.id }),
    enabled: !!user && isStaff,
  });
  const isActive = freeBoost?.status === SquadFreeBoostStatus.Active;
  const { data: analytics } = useQuery({
    ...postAnalyticsQueryOptions({ id: freeBoost?.post?.id }),
    enabled: isActive && !!freeBoost?.post?.id,
    // The analytics land every 5 minutes while the boost runs
    refetchInterval: isActive ? 60_000 : false,
  });

  if (!isStaff) {
    return null;
  }

  return getFreeBoostState({ squad, freeBoost, analytics });
};

import { useQuery } from '@tanstack/react-query';
import { differenceInDays } from 'date-fns';
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
import { getStartupsCheckoutUrl } from '../../lib/routes';
import { useStartupsCashbackPromo } from '../../hooks/useStartupsCashbackPromo';
import type { StartupsStarterOffer } from '../../hooks/useStartupsPromo';
import { getStartupsStarterOffer } from '../../hooks/useStartupsPromo';
import type { FreeBoostPost, FreeBoostStats } from './FreeBoostCard';

// The results stay on the page for a week; the value panel takes over after
export const FREE_BOOST_RESULTS_DAYS = 7;

export type FreeBoostState =
  | {
      state: 'first_post';
      composeUrl: string;
      availableUntil?: Date;
      /** The post that was held back, when there is one */
      heldPost?: FreeBoostPost;
    }
  | { state: 'pending'; post: FreeBoostPost }
  | {
      state: 'live';
      post: FreeBoostPost;
      stats: FreeBoostStats;
      spent: number;
      budget: number;
      endsAt: Date;
    }
  | {
      state: 'ended';
      name: string;
      post: FreeBoostPost;
      stats: FreeBoostStats;
      offer: StartupsStarterOffer;
      checkoutUrl: string;
    };

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

/** What the free boost card shows from the API's answer, null when hidden */
export const getFreeBoostState = ({
  squad,
  freeBoost,
  analytics,
  promo,
  now = new Date(),
}: {
  squad: Pick<Squad, 'id' | 'handle' | 'name'>;
  freeBoost?: SquadFreeBoost | null;
  analytics?: PostAnalytics | null;
  promo: Parameters<typeof getStartupsStarterOffer>[0];
  now?: Date;
}): FreeBoostState | null => {
  if (!freeBoost) {
    return null;
  }

  const { status, post, campaign, availableUntil } = freeBoost;

  switch (status) {
    case SquadFreeBoostStatus.Available:
    case SquadFreeBoostStatus.Held:
      return {
        state: 'first_post',
        composeUrl: `${link.post.create}?sid=${squad.handle}`,
        availableUntil: availableUntil ? new Date(availableUntil) : undefined,
        heldPost:
          status === SquadFreeBoostStatus.Held && post
            ? toPost(post)
            : undefined,
      };
    case SquadFreeBoostStatus.Pending:
      return post ? { state: 'pending', post: toPost(post) } : null;
    case SquadFreeBoostStatus.Active:
      if (!post || !campaign) {
        return null;
      }

      return {
        state: 'live',
        post: toPost(post),
        stats: toStats(analytics),
        spent: campaign.spend,
        budget: campaign.budget,
        endsAt: new Date(campaign.endedAt),
      };
    case SquadFreeBoostStatus.Completed:
      if (
        !post ||
        !campaign ||
        differenceInDays(now, new Date(campaign.endedAt)) >=
          FREE_BOOST_RESULTS_DAYS
      ) {
        return null;
      }

      return {
        state: 'ended',
        name: squad.name,
        post: toPost(post),
        stats: toStats(analytics),
        offer: getStartupsStarterOffer(promo),
        checkoutUrl: getStartupsCheckoutUrl({ sourceId: squad.id }),
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
  const isBoosted =
    freeBoost?.status === SquadFreeBoostStatus.Active ||
    freeBoost?.status === SquadFreeBoostStatus.Completed;
  const { data: analytics } = useQuery({
    ...postAnalyticsQueryOptions({ id: freeBoost?.post?.id }),
    enabled: isBoosted && !!freeBoost?.post?.id,
    // The analytics land every 5 minutes while the boost runs
    refetchInterval:
      freeBoost?.status === SquadFreeBoostStatus.Active ? 60_000 : false,
  });
  const promo = useStartupsCashbackPromo();

  if (!isStaff) {
    return null;
  }

  return getFreeBoostState({ squad, freeBoost, analytics, promo });
};

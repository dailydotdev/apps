import { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Squad } from '../../../../graphql/sources';
import { squadProductsQueryOptions } from '../../../../graphql/squadProducts';
import { squadBrandingQueryOptions } from '../../../../graphql/squadBranding';
import { squadIntelSettingsQueryOptions } from '../../../../graphql/squadIntel';
import { squadSubscriptionBalanceQueryOptions } from '../../../../graphql/squadSubscription';
import { oauthConsentsQueryOptions } from '../../../../lib/oauthApps';
import { personalAccessTokensQueryOptions } from '../../../../hooks/api/usePersonalAccessTokens';
import { useActions } from '../../../../hooks/useActions';
import { ActionType } from '../../../../graphql/actions';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { useCampaigns } from '../../../boost/useCampaigns';
import {
  canSetSquadButton,
  getSquadId,
  hasSquadFeature,
} from '../../lib/features';
import type { PlanChecklistSkill, ReadinessItem } from '../../lib/readiness';
import {
  getCompanyPageReadinessItems,
  getPlanChecklistItems,
  ReadinessKind,
} from '../../lib/readiness';
import {
  CORES_PER_USD,
  formatBoostCredits,
  isSquadPlan,
  SQUAD_PLAN_INTEL_TOPICS,
} from '../../lib/plans';

const skillActions: Record<PlanChecklistSkill, ActionType> = {
  strategy: ActionType.TriedSkillStrategy,
  ideas: ActionType.TriedSkillIdeas,
  review: ActionType.TriedSkillReview,
  routine: ActionType.TriedSkillRoutine,
};

interface CompanyPageReadiness {
  isPending: boolean;
  /** Missing when the page opened, with their state now */
  rows: ReadinessItem[];
  done: ReadinessItem[];
  /** The founder tried a skill from their agent */
  onTrySkill: (id: string) => void;
  isDismissed: boolean;
  onDismiss: () => void;
}

/**
 * The page's and the viewer's readiness rows, and on a paid plan what the plan
 * gives them. Which rows are listed is fixed the first time everything is
 * known, so a row the admin finishes in another tab, or through their agent,
 * gets checked in place instead of jumping away.
 */
export const useCompanyPageReadiness = (
  squad: Squad,
  isShown: boolean,
  /** The page's plan, null without one */
  plan?: string | null,
): CompanyPageReadiness => {
  const { user } = useAuthContext();
  const sourceId = getSquadId(squad);
  const isPaid = !!plan;
  const hasSeat = !!squad.currentMember?.seat;
  const hasCta = isPaid && canSetSquadButton(squad);
  const hasProducts = hasSquadFeature(squad, 'products');
  const { data: products, isPending: isProductsPending } = useQuery({
    ...squadProductsQueryOptions({ squad, user }),
    enabled: isShown && hasProducts,
  });
  const { data: branding, isPending: isBrandingPending } = useQuery({
    ...squadBrandingQueryOptions({ squad, user }),
    enabled: isShown && hasCta,
  });
  const { data: intelSettings, isPending: isIntelPending } = useQuery(
    squadIntelSettingsQueryOptions({
      user,
      sourceId,
      enabled: isShown && isPaid && hasSeat,
    }),
  );
  const { data: balance } = useQuery(
    squadSubscriptionBalanceQueryOptions({
      user,
      sourceId,
      enabled: isShown && isPaid,
    }),
  );
  const { data: consents } = useQuery({
    ...oauthConsentsQueryOptions(),
    enabled: isShown && isPaid && hasSeat,
  });
  const { data: tokens } = useQuery({
    ...personalAccessTokensQueryOptions(),
    enabled: isShown && isPaid && hasSeat,
  });
  const { data: campaigns, isLoading: isCampaignsLoading } = useCampaigns({
    enabled: isShown && isPaid,
  });
  const { checkHasCompleted, completeAction, isActionsFetched } = useActions();
  const missingIds = useRef<string[] | null>(null);
  const isPending =
    !user ||
    !isActionsFetched ||
    (hasProducts && isProductsPending) ||
    (hasCta && isBrandingPending) ||
    (isPaid && hasSeat && isIntelPending) ||
    (isPaid && isCampaignsLoading);
  const onTrySkill = (id: string) => {
    const action = skillActions[id as PlanChecklistSkill];

    if (action) {
      completeAction(action);
    }
  };
  const onDismiss = () =>
    completeAction(ActionType.DismissCompanyPageChecklist);
  const isDismissed = checkHasCompleted(ActionType.DismissCompanyPageChecklist);

  if (!isShown || isPending) {
    return {
      isPending,
      rows: [],
      done: [],
      onTrySkill,
      isDismissed,
      onDismiss,
    };
  }

  const isTried = (skill: PlanChecklistSkill) =>
    checkHasCompleted(skillActions[skill]);
  const isBoosted = !!campaigns?.pages.some(({ edges }) =>
    edges.some(
      ({ node }) =>
        node.source?.id === sourceId || node.post?.source?.id === sourceId,
    ),
  );
  const items = [
    ...getCompanyPageReadinessItems({
      squad,
      user,
      hasLinks: hasSquadFeature(squad, 'links'),
      products: hasProducts ? (products?.length ?? 0) : undefined,
    }),
    ...(isPaid
      ? getPlanChecklistItems({
          squad,
          hasSeat,
          hasCta,
          intelTopics: isSquadPlan(plan)
            ? SQUAD_PLAN_INTEL_TOPICS[plan]
            : undefined,
          credits: balance
            ? formatBoostCredits(Math.floor(balance / CORES_PER_USD))
            : undefined,
          done: {
            cta: !!branding?.button?.enabled,
            intel: !!intelSettings?.selection,
            post: (squad.flags?.totalPosts ?? 0) > 0,
            boost: isBoosted,
            agent:
              !!consents?.length ||
              !!tokens?.some(({ lastUsedAt }) => lastUsedAt),
            strategy: isTried('strategy'),
            ideas: isTried('ideas'),
            review: isTried('review'),
            routine: isTried('routine'),
          },
        })
      : []),
  ];

  if (!missingIds.current) {
    missingIds.current = items
      .filter(({ isDone, kind }) => !isDone || kind === ReadinessKind.Included)
      .map(({ id }) => id);
  }

  const missing = new Set(missingIds.current);

  return {
    isPending: false,
    rows: items.filter(({ id }) => missing.has(id)),
    done: items.filter(({ id, isDone }) => isDone && !missing.has(id)),
    onTrySkill,
    isDismissed,
    onDismiss,
  };
};

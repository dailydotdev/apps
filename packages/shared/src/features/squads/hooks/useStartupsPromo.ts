import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import type { Squad } from '../../../graphql/sources';
import { SourceMemberRole } from '../../../graphql/sources';
import { squadSubscriptionQueryOptions } from '../../../graphql/squadSubscription';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { featureStartupsCheckout } from '../../../lib/featureManagement';
import { isIOSNative } from '../../../lib/func';
import { ActionType } from '../../../graphql/actions';
import { useActions } from '../../../hooks/useActions';
import { LogEvent } from '../../../lib/log';
import { hasSquadFeature } from '../lib/features';
import {
  formatCashbackPromoLength,
  getSquadPlanCashback,
  getSquadPlanMonthlyCores,
  SQUAD_PLAN_CASHBACK_PERCENTAGE,
  SquadPlan,
} from '../lib/plans';
import { getStartupsCheckoutUrl } from '../lib/routes';
import { useLogStartups } from './useLogStartups';
import { useSquadPlanPrices } from './useSquadPlanPrices';
import { useStartupsCashbackPromo } from './useStartupsCashbackPromo';

/** Where in the app a daily.dev for Startups promotion shows */
export enum StartupsPromoSpot {
  BoostPost = 'boost post promo',
  BoostSquad = 'boost squad promo',
  BuyCores = 'buy cores promo',
  Wallet = 'wallet promo',
  AdsDashboard = 'ads dashboard promo',
}

interface UseStartupsPromoProps {
  spot: StartupsPromoSpot;
  /** The squad being boosted, or whose post is. Unset: the viewer's own. */
  sourceId?: string;
  /** False keeps it off where the viewer runs no squad they could upgrade. */
  isPersonalAllowed?: boolean;
  /** False while the host isn't on screen yet, so the impression waits. */
  isVisible?: boolean;
}

export interface StartupsPromo {
  isShown: boolean;
  /** The squad the plan would go on; unset when the viewer runs none. */
  squad?: Squad;
  starterPrice: string;
  /** Starter's cashback, the launch promo's while it is on */
  cashback: number;
  /** "for your first year" while the launch promo is on */
  promoLength?: string;
  /** Cores Starter's cashback adds to the squad wallet each month */
  monthlyCores: number;
  /** Set while the launch promo beats Starter's own rate: what to strike */
  launchOffer?: { cashback: number; monthlyCores: number };
  checkoutUrl: string;
  onClick: () => void;
  /** Hides this and every other Startups promotion, on all devices */
  onDismiss: () => void;
}

const isAdmin = (squad: Squad): boolean =>
  squad.currentMember?.role === SourceMemberRole.Admin;

/**
 * daily.dev for Startups promotions outside the squad page, behind the same
 * flag as the squad page upsell. They pitch the first squad the viewer runs
 * that has no plan; a squad already on a plan, or verified, never gets one.
 */
export const useStartupsPromo = ({
  spot,
  sourceId,
  isPersonalAllowed = true,
  isVisible = true,
}: UseStartupsPromoProps): StartupsPromo => {
  const { user, squads } = useAuthContext();
  const { checkHasCompleted, completeAction, isActionsFetched } = useActions();
  const isDismissed = checkHasCompleted(ActionType.DismissStartupsPromo);
  const adminSquads = useMemo(() => (squads ?? []).filter(isAdmin), [squads]);
  // Squads that could still take a plan: not verified, and no paid seat for
  // the viewer, which every plan gives its owner
  const freeSquads = useMemo(
    () =>
      adminSquads.filter(
        (adminSquad) =>
          !hasSquadFeature(adminSquad, 'verified') &&
          !adminSquad.currentMember?.seat,
      ),
    [adminSquads],
  );
  // Someone who already pays gets no pitch for a personal post
  const isCustomer = freeSquads.length < adminSquads.length;
  // Boosting a post of a squad the viewer already pays for
  const sourceIdIsPaid =
    !!sourceId &&
    adminSquads.some(({ id }) => id === sourceId) &&
    !freeSquads.some(({ id }) => id === sourceId);
  const squad = sourceId
    ? freeSquads.find(({ id }) => id === sourceId)
    : freeSquads[0];
  const isCandidate =
    !!user &&
    !isIOSNative() &&
    (!!squad || (isPersonalAllowed && !isCustomer && !sourceIdIsPaid));
  const { value: isEnabled } = useConditionalFeature({
    feature: featureStartupsCheckout,
    shouldEvaluate: isCandidate,
  });
  const { data: subscription, isPending } = useQuery({
    ...squadSubscriptionQueryOptions({ user, sourceId: squad?.id }),
    enabled: !!squad && isCandidate && isEnabled,
  });
  const promo = useStartupsCashbackPromo();
  const prices = useSquadPlanPrices();
  const logStartups = useLogStartups();
  const isShown =
    isCandidate &&
    isEnabled &&
    isActionsFetched &&
    !isDismissed &&
    (!squad || (!isPending && !!subscription && !subscription.plan));
  const extra = useMemo(
    () => ({ source_id: squad?.id, has_squad: !!squad }),
    [squad?.id], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const loggedRef = useRef(false);

  useEffect(() => {
    if (!isShown || !isVisible || loggedRef.current) {
      return;
    }

    loggedRef.current = true;
    logStartups(LogEvent.Impression, spot, extra);
  }, [isShown, isVisible, logStartups, spot, extra]);

  const onClick = useCallback(
    () => logStartups(LogEvent.UpgradeSubscription, spot, extra),
    [logStartups, spot, extra],
  );

  const onDismiss = useCallback(() => {
    logStartups(LogEvent.DismissStartupsUpsell, spot, extra);
    completeAction(ActionType.DismissStartupsPromo);
  }, [completeAction, logStartups, spot, extra]);

  const cashback = getSquadPlanCashback(SquadPlan.Starter, promo);
  const baseCashback = SQUAD_PLAN_CASHBACK_PERCENTAGE[SquadPlan.Starter];

  return {
    isShown,
    squad,
    starterPrice: prices[SquadPlan.Starter],
    cashback,
    promoLength: promo ? formatCashbackPromoLength(promo.months) : undefined,
    monthlyCores: getSquadPlanMonthlyCores(SquadPlan.Starter, promo),
    launchOffer:
      cashback > baseCashback
        ? {
            cashback: baseCashback,
            monthlyCores: getSquadPlanMonthlyCores(SquadPlan.Starter),
          }
        : undefined,
    checkoutUrl: getStartupsCheckoutUrl({
      plan: SquadPlan.Starter,
      sourceId: squad?.id,
    }),
    onClick,
    onDismiss,
  };
};

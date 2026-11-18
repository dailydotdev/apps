import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import type { Squad } from '../../../graphql/sources';
import { SourceMemberRole } from '../../../graphql/sources';
import { squadSubscriptionQueryOptions } from '../../../graphql/squadSubscription';
import { isIOSNative } from '../../../lib/func';
import { ActionType } from '../../../graphql/actions';
import { useActions } from '../../../hooks/useActions';
import { LogEvent } from '../../../lib/log';
import { hasSquadFeature } from '../lib/features';
import type { StartupsCashbackPromo } from '../lib/plans';
import {
  formatCashbackPromoLength,
  getSquadPlanCashback,
  getSquadPlanMonthlyCredits,
  SQUAD_PLAN_CASHBACK_PERCENTAGE,
  SquadPlan,
} from '../lib/plans';
import {
  getCompanyPageCreateUrl,
  getSquadManageUrl,
  SquadManageSection,
} from '../lib/routes';
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
  SquadAnalytics = 'squad analytics promo',
  PostAnalytics = 'post analytics promo',
}

interface UseStartupsPromoProps {
  spot: StartupsPromoSpot;
  /** The squad being boosted, or whose post is. Unset: the viewer's own. */
  sourceId?: string;
  /** False keeps it off where the viewer runs no company page to upgrade */
  isPersonalAllowed?: boolean;
  /** False while the host isn't on screen yet, so the impression waits. */
  isVisible?: boolean;
  /** False for a locked feature, which shows even after a dismissed promo */
  isDismissible?: boolean;
}

/** What Starter gives back each month, the launch promo's while it is on */
export interface StartupsStarterOffer {
  /** Starter's cashback, the launch promo's while it is on */
  cashback: number;
  /** "for your first year" while the launch promo is on */
  promoLength?: string;
  /** Boost credits, in US dollars, Starter adds to the squad wallet each month */
  monthlyCredits: number;
  /** Set while the launch promo beats Starter's own rate: what to strike */
  launchOffer?: { cashback: number; monthlyCredits: number };
}

export interface StartupsPromo extends StartupsStarterOffer {
  isShown: boolean;
  /**
   * The free company page the plan would go on. Unset: the viewer runs none,
   * so the promo leads to a new company page with the plan picked.
   */
  squad?: Squad;
  starterPrice: string;
  /** The page's plan screen, or the company page form with Starter picked */
  href: string;
  onClick: () => void;
  /** Hides this and every other Startups promotion, on all devices */
  onDismiss: () => void;
}

export const getStartupsStarterOffer = (
  promo?: StartupsCashbackPromo | null,
): StartupsStarterOffer => {
  const cashback = getSquadPlanCashback(SquadPlan.Starter, promo);
  const baseCashback = SQUAD_PLAN_CASHBACK_PERCENTAGE[SquadPlan.Starter];

  return {
    cashback,
    promoLength: promo ? formatCashbackPromoLength(promo.months) : undefined,
    monthlyCredits: getSquadPlanMonthlyCredits(SquadPlan.Starter, promo),
    launchOffer:
      cashback > baseCashback
        ? {
            cashback: baseCashback,
            monthlyCredits: getSquadPlanMonthlyCredits(SquadPlan.Starter),
          }
        : undefined,
  };
};

const isAdmin = (squad: Squad): boolean =>
  squad.currentMember?.role === SourceMemberRole.Admin;

/**
 * daily.dev for Startups promotions outside the squad page. Someone who runs
 * a company page with no plan gets the plan for it; someone who runs none
 * gets a free company page. Community squads never get a promotion, and an
 * admin of a verified squad sees none at all.
 */
export const useStartupsPromo = ({
  spot,
  sourceId,
  isPersonalAllowed = true,
  isVisible = true,
  isDismissible = true,
}: UseStartupsPromoProps): StartupsPromo => {
  const { user, squads } = useAuthContext();
  const { checkHasCompleted, completeAction, isActionsFetched } = useActions();
  const isDismissed = checkHasCompleted(ActionType.DismissStartupsPromo);
  const adminSquads = useMemo(() => (squads ?? []).filter(isAdmin), [squads]);
  // Company pages that could still take a plan: not verified, and no paid
  // seat for the viewer, which every plan gives its owner
  const freeCompanyPages = useMemo(
    () =>
      adminSquads.filter(
        (adminSquad) =>
          !!adminSquad.flags?.company &&
          !hasSquadFeature(adminSquad, 'verified') &&
          !adminSquad.currentMember?.seat,
      ),
    [adminSquads],
  );
  // Someone who already pays gets no free company page pitch
  const isCustomer = adminSquads.some(
    (adminSquad) =>
      hasSquadFeature(adminSquad, 'verified') ||
      !!adminSquad.currentMember?.seat,
  );
  // Inside a squad, only a free company page the viewer runs gets a pitch
  const squad = sourceId
    ? freeCompanyPages.find(({ id }) => id === sourceId)
    : freeCompanyPages[0];
  // An admin of a verified squad is an Enterprise customer: no pitch at all
  const isEnterprise = adminSquads.some((adminSquad) =>
    hasSquadFeature(adminSquad, 'verified'),
  );
  const isCandidate =
    !!user &&
    !isIOSNative() &&
    !isEnterprise &&
    (!!squad || (isPersonalAllowed && !sourceId && !isCustomer));
  const { data: subscription, isPending } = useQuery({
    ...squadSubscriptionQueryOptions({ user, sourceId: squad?.id }),
    enabled: !!squad && isCandidate,
  });
  const promo = useStartupsCashbackPromo();
  const prices = useSquadPlanPrices();
  const logStartups = useLogStartups();
  const isShown =
    isCandidate &&
    isActionsFetched &&
    (!isDismissible || !isDismissed) &&
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

  return {
    ...getStartupsStarterOffer(promo),
    isShown,
    squad,
    starterPrice: prices[SquadPlan.Starter],
    href: squad
      ? getSquadManageUrl(squad.handle, SquadManageSection.Plan)
      : getCompanyPageCreateUrl({
          plan: SquadPlan.Starter,
          cta: spot.replace(/ /g, '_'),
        }),
    onClick,
    onDismiss,
  };
};

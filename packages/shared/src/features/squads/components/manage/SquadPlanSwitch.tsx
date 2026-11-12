import type { ReactElement } from 'react';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import { usePrompt } from '../../../../hooks/usePrompt';
import { useAuthContext } from '../../../../contexts/AuthContext';
import type { SquadSubscription } from '../../../../graphql/squadSubscription';
import { squadPlanChangePreviewQueryOptions } from '../../../../graphql/squadSubscription';
import { getPlusMemberDateFormat } from '../../../../lib/dateFormat';
import { useSquadPageContext } from '../../SquadPageContext';
import { getSquadId } from '../../lib/features';
import {
  formatBoostCredits,
  getSquadPlanCreditsForRate,
  getSquadPlanTitle,
  SQUAD_PLAN_CASHBACK_PERCENTAGE,
  SQUAD_PLAN_SEATS,
  SquadPlan,
} from '../../lib/plans';
import { useSquadPlanPrices } from '../../hooks/useSquadPlanPrices';

const PromptLine = ({ children }: { children: string }): ReactElement => (
  <p className="text-text-secondary typo-callout">{children}</p>
);

/**
 * The owner's plan switch on the active plan card. An upgrade starts now and
 * tops up the wallet to the bigger plan's month, a downgrade waits for the
 * renewal so the month already paid is kept.
 */
export const SquadPlanSwitch = ({
  subscription,
}: {
  subscription: SquadSubscription;
}): ReactElement | null => {
  const { squad } = useSquadPageContext();
  const { user } = useAuthContext();
  const { showPrompt } = usePrompt();
  const prices = useSquadPlanPrices();
  const sourceId = getSquadId(squad);
  const plan = subscription.plan as SquadPlan;
  const target = plan === SquadPlan.Team ? SquadPlan.Starter : SquadPlan.Team;
  const isUpgrade = target === SquadPlan.Team;
  const { data: preview } = useQuery({
    ...squadPlanChangePreviewQueryOptions({ user, sourceId, plan: target }),
    enabled: isUpgrade && !!user && !!sourceId,
  });
  const { renewsAt, scheduledPlan, downgradeAvailableAt } = subscription;
  const renewal = renewsAt ? getPlusMemberDateFormat(renewsAt) : 'renewal';
  // The launch promo stays with the subscription across plans
  const getRate = (forPlan: SquadPlan) =>
    subscription.cashbackPromoEndsAt
      ? subscription.cashbackPercentage
      : SQUAD_PLAN_CASHBACK_PERCENTAGE[forPlan];
  const getCredits = (forPlan: SquadPlan) =>
    getSquadPlanCreditsForRate(forPlan, getRate(forPlan));
  const credits = (forPlan: SquadPlan) =>
    formatBoostCredits(getCredits(forPlan));
  const topUp = formatBoostCredits(
    getCredits(SquadPlan.Team) - getCredits(SquadPlan.Starter),
  );

  if (scheduledPlan) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-subtlest-tertiary pt-4">
        <span className="font-bold typo-callout">
          {`Switches to ${getSquadPlanTitle(scheduledPlan)} on ${renewal}`}
        </span>
        <Button variant={ButtonVariant.Float} size={ButtonSize.Small}>
          {`Keep ${getSquadPlanTitle(plan)}`}
        </Button>
      </div>
    );
  }

  const seatsBlock =
    !isUpgrade && subscription.seatsUsed > SQUAD_PLAN_SEATS[target]
      ? `${getSquadPlanTitle(target)} has ${
          SQUAD_PLAN_SEATS[target]
        } seat. Remove seats until only yours is left.`
      : null;
  const renewalBlock =
    !isUpgrade && downgradeAvailableAt
      ? `You can switch to ${getSquadPlanTitle(
          target,
        )} after your first ${getSquadPlanTitle(
          plan,
        )} renewal on ${getPlusMemberDateFormat(downgradeAvailableAt)}.`
      : null;
  const blocked = renewalBlock ?? seatsBlock;

  const onSwitch = () =>
    showPrompt(
      isUpgrade
        ? {
            title: 'Switch to Team',
            description: (
              <div className="flex flex-col gap-3">
                <PromptLine>
                  {`Team starts now. Today you pay ${
                    preview?.dueNow ?? 'the difference'
                  } for the rest of this month, then ${
                    prices[SquadPlan.Team]
                  } a month from ${renewal}.`}
                </PromptLine>
                <PromptLine>
                  {`Boost credits go up to ${credits(
                    SquadPlan.Team,
                  )} a month. We add ${topUp} to your wallet now.`}
                </PromptLine>
              </div>
            ),
            okButton: { title: 'Switch to Team' },
            cancelButton: { title: 'Keep Starter' },
          }
        : {
            title: `Switch to Starter on ${renewal}`,
            description: (
              <PromptLine>
                {`You keep Team until then. After that you pay ${
                  prices[SquadPlan.Starter]
                } a month and get ${credits(
                  SquadPlan.Starter,
                )} in boost credits.`}
              </PromptLine>
            ),
            okButton: { title: `Switch on ${renewal}` },
            cancelButton: { title: 'Keep Team' },
          },
    );

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-subtlest-tertiary pt-4">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="font-bold typo-callout">
          {isUpgrade ? 'Need more seats?' : 'Need less?'}
        </span>
        <span className="text-text-tertiary typo-footnote">
          {blocked ??
            (isUpgrade
              ? `Team has ${SQUAD_PLAN_SEATS[SquadPlan.Team]} seats, ${credits(
                  SquadPlan.Team,
                )} in boost credits a month and a CTA in your page header.`
              : `Starter is ${prices[SquadPlan.Starter]} a month with ${
                  SQUAD_PLAN_SEATS[SquadPlan.Starter]
                } seat.`)}
        </span>
      </div>
      <Button
        variant={isUpgrade ? ButtonVariant.Primary : ButtonVariant.Float}
        size={ButtonSize.Small}
        disabled={!!blocked}
        onClick={onSwitch}
      >
        {`Switch to ${getSquadPlanTitle(target)}`}
      </Button>
    </div>
  );
};

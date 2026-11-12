import type { ReactElement } from 'react';
import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import { usePrompt } from '../../../../hooks/usePrompt';
import { useToastNotification } from '../../../../hooks/useToastNotification';
import { useAuthContext } from '../../../../contexts/AuthContext';
import type { ApiErrorResult } from '../../../../graphql/common';
import type { SquadSubscription } from '../../../../graphql/squadSubscription';
import {
  changeSquadPlan,
  squadPlanChangePreviewQueryOptions,
  squadSubscriptionBalanceQueryOptions,
  squadSubscriptionQueryOptions,
} from '../../../../graphql/squadSubscription';
import { getPlusMemberDateFormat } from '../../../../lib/dateFormat';
import { LogEvent } from '../../../../lib/log';
import { useSquadPageContext } from '../../SquadPageContext';
import { getSquadId } from '../../lib/features';
import {
  CORES_PER_USD,
  formatBoostCredits,
  getSquadPlanCreditsForRate,
  getSquadPlanTitle,
  SQUAD_PLAN_CASHBACK_PERCENTAGE,
  SQUAD_PLAN_SEATS,
  SquadPlan,
} from '../../lib/plans';
import { useSquadPlanPrices } from '../../hooks/useSquadPlanPrices';
import { useLogStartups } from '../../hooks/useLogStartups';

const PromptLine = ({ children }: { children: string }): ReactElement => (
  <p className="text-text-secondary typo-callout">{children}</p>
);

const getErrorMessage = (error: unknown): string =>
  (error as ApiErrorResult)?.response?.errors?.[0]?.message ??
  'Something went wrong, your plan has not changed. Try again in a minute.';

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
  const client = useQueryClient();
  const { showPrompt } = usePrompt();
  const { displayToast } = useToastNotification();
  const logStartups = useLogStartups();
  const prices = useSquadPlanPrices();
  const [isPending, setIsPending] = useState(false);
  const [upgradingTo, setUpgradingTo] = useState<SquadPlan | null>(null);
  const sourceId = getSquadId(squad);
  const plan = subscription.plan as SquadPlan;
  const target = plan === SquadPlan.Team ? SquadPlan.Starter : SquadPlan.Team;
  const isUpgrade = target === SquadPlan.Team;
  const isUpgrading = !!upgradingTo && plan !== upgradingTo;
  // The webhook applies an upgrade, so the card polls until it lands
  useQuery({
    ...squadSubscriptionQueryOptions({
      user,
      sourceId,
      refetchInterval: (query) =>
        upgradingTo && query.state.data?.plan !== upgradingTo ? 2000 : false,
    }),
  });
  const { renewsAt, scheduledPlan, downgradeAvailableAt } = subscription;
  const renewal = renewsAt ? getPlusMemberDateFormat(renewsAt) : 'renewal';
  // The launch promo stays with the subscription across plans
  const getCredits = (forPlan: SquadPlan) =>
    getSquadPlanCreditsForRate(
      forPlan,
      subscription.cashbackPromoEndsAt
        ? subscription.cashbackPercentage
        : SQUAD_PLAN_CASHBACK_PERCENTAGE[forPlan],
    );
  const credits = (forPlan: SquadPlan) =>
    formatBoostCredits(getCredits(forPlan));

  const change = async (to: SquadPlan) => {
    setIsPending(true);
    try {
      await changeSquadPlan({ sourceId, plan: to });
      logStartups(
        to === plan ? LogEvent.KeepSquadPlan : LogEvent.ChangeSquadPlan,
        to,
        { source_id: sourceId, from: plan },
      );
      if (to !== plan && isUpgrade) {
        setUpgradingTo(to);
        displayToast(`Switching to ${getSquadPlanTitle(to)}`);
      }
      await Promise.all([
        client.invalidateQueries({
          queryKey: squadSubscriptionQueryOptions({ user, sourceId }).queryKey,
        }),
        client.invalidateQueries({
          queryKey: squadSubscriptionBalanceQueryOptions({ user, sourceId })
            .queryKey,
        }),
      ]);
    } catch (error) {
      displayToast(getErrorMessage(error));
    } finally {
      setIsPending(false);
    }
  };

  if (scheduledPlan) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-subtlest-tertiary pt-4">
        <span className="font-bold typo-callout">
          {`Switches to ${getSquadPlanTitle(scheduledPlan)} on ${renewal}`}
        </span>
        <Button
          variant={ButtonVariant.Float}
          size={ButtonSize.Small}
          loading={isPending}
          onClick={() => change(plan)}
        >
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

  const onSwitch = async () => {
    if (!isUpgrade) {
      const isConfirmed = await showPrompt({
        title: `Switch to Starter on ${renewal}`,
        description: (
          <PromptLine>
            {`You keep Team until then. After that you pay ${
              prices[SquadPlan.Starter]
            } a month and get ${credits(SquadPlan.Starter)} in boost credits.`}
          </PromptLine>
        ),
        okButton: { title: `Switch on ${renewal}` },
        cancelButton: { title: 'Keep Team' },
      });
      if (isConfirmed) {
        await change(target);
      }
      return;
    }

    setIsPending(true);
    const preview = await client
      .fetchQuery(
        squadPlanChangePreviewQueryOptions({ user, sourceId, plan: target }),
      )
      .catch((error: unknown) => {
        displayToast(getErrorMessage(error));
        return null;
      });
    setIsPending(false);
    if (!preview) {
      return;
    }

    const topUp = preview.creditsTopUp / CORES_PER_USD;
    const isConfirmed = await showPrompt({
      title: 'Switch to Team',
      description: (
        <div className="flex flex-col gap-3">
          <PromptLine>
            {`Team starts now. Today you pay ${
              preview.dueNow
            } for the rest of this month, then ${
              preview.renewal ?? prices[SquadPlan.Team]
            } a month from ${renewal}.`}
          </PromptLine>
          <PromptLine>
            {topUp > 0
              ? `Boost credits go up to ${credits(
                  SquadPlan.Team,
                )} a month. We add ${formatBoostCredits(
                  topUp,
                )} to your wallet now.`
              : `Boost credits go up to ${credits(
                  SquadPlan.Team,
                )} a month on paid renewals.`}
          </PromptLine>
        </div>
      ),
      okButton: { title: 'Switch to Team' },
      cancelButton: { title: 'Keep Starter' },
    });
    if (isConfirmed) {
      await change(target);
    }
  };

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
        disabled={!!blocked || isUpgrading}
        loading={isPending}
        onClick={onSwitch}
      >
        {`Switch to ${getSquadPlanTitle(target)}`}
      </Button>
    </div>
  );
};

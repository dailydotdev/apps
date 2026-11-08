import type { ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import CloseButton from '../../../../components/CloseButton';
import { VIcon } from '../../../../components/icons';
import { IconSize } from '../../../../components/Icon';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { useConditionalFeature } from '../../../../hooks/useConditionalFeature';
import usePersistentContext from '../../../../hooks/usePersistentContext';
import { featureStartupsCheckout } from '../../../../lib/featureManagement';
import { LogEvent, Origin } from '../../../../lib/log';
import { squadSubscriptionQueryOptions } from '../../../../graphql/squadSubscription';
import { useSquadPageContext } from '../../SquadPageContext';
import { getSquadId, hasSquadFeature } from '../../lib/features';
import { SquadViewer } from '../../lib/viewer';
import { getStartupsCheckoutUrl } from '../../lib/routes';
import {
  formatCashbackPromoLength,
  getSquadPlanCashback,
  SQUAD_PLAN_CASHBACK_PERCENTAGE,
  SquadPlan,
} from '../../lib/plans';
import { useStartupsCashbackPromo } from '../../hooks/useStartupsCashbackPromo';
import { useSquadPlanPrices } from '../../hooks/useSquadPlanPrices';
import { useLogStartups } from '../../hooks/useLogStartups';

// Starter bullets from the plan table on daily.dev/startups/, word for word.
const benefits = [
  'In the feed and search, cited by AI answers',
  'Weekly intel on up to 5 topics',
  'API, so your agent posts and boosts',
];

/**
 * daily.dev for Startups upsell for the admins of a Squad without a plan:
 * the first card of the right column, until they dismiss it for this Squad.
 */
export const SquadPlanUpsellWidget = (): ReactElement | null => {
  const { squad, viewer, isViewerKnown } = useSquadPageContext();
  const { user } = useAuthContext();
  const sourceId = getSquadId(squad);
  const isCandidate =
    isViewerKnown &&
    viewer === SquadViewer.Admin &&
    !hasSquadFeature(squad, 'verified');
  const { value: isEnabled } = useConditionalFeature({
    feature: featureStartupsCheckout,
    shouldEvaluate: isCandidate,
  });
  const [isDismissed, setDismissed, isDismissedFetched] = usePersistentContext(
    `startups_upsell_dismissed_${sourceId}`,
    false,
  );
  const { data: subscription } = useQuery({
    ...squadSubscriptionQueryOptions({ user, sourceId }),
    enabled: !!user && isCandidate && isEnabled,
  });
  const prices = useSquadPlanPrices();
  const logStartups = useLogStartups();
  const isShown =
    isCandidate &&
    isEnabled &&
    isDismissedFetched &&
    !isDismissed &&
    !!subscription &&
    !subscription.plan;
  const cashbackPromo = useStartupsCashbackPromo();
  const loggedRef = useRef(false);

  useEffect(() => {
    if (!isShown || loggedRef.current) {
      return;
    }

    loggedRef.current = true;
    logStartups(LogEvent.Impression, 'squad upsell', {
      origin: Origin.SquadPage,
      source_id: sourceId,
    });
  }, [isShown, logStartups, sourceId]);

  if (!isShown) {
    return null;
  }

  return (
    <section
      className="relative flex w-full flex-col gap-5 rounded-16 border border-border-subtlest-tertiary p-4"
      style={{
        background:
          'linear-gradient(180deg, color-mix(in srgb, var(--theme-accent-cabbage-default) 9%, transparent), transparent 120px)',
      }}
    >
      <CloseButton
        size={ButtonSize.XSmall}
        className="absolute right-2 top-2"
        aria-label="Dismiss"
        onClick={() => {
          setDismissed(true);
          logStartups(LogEvent.DismissStartupsUpsell, 'squad upsell', {
            origin: Origin.SquadPage,
            source_id: sourceId,
          });
        }}
      />
      <div className="flex flex-col gap-1 pr-6">
        <h2 className="text-balance font-bold typo-callout">
          {`Make ${squad.name} your company page`}
        </h2>
        <p className="text-text-secondary typo-footnote">
          {cashbackPromo
            ? `From ${prices[SquadPlan.Starter]} a month, with ${getSquadPlanCashback(
                SquadPlan.Starter,
                cashbackPromo,
              )}% back to boost your posts for ${formatCashbackPromoLength(
                cashbackPromo.months,
              )}.`
            : `From ${prices[SquadPlan.Starter]} a month, with up to ${
                SQUAD_PLAN_CASHBACK_PERCENTAGE[SquadPlan.Team]
              }% back to boost your posts.`}
        </p>
      </div>
      <ul className="flex flex-col gap-2">
        {benefits.map((benefit) => (
          <li
            key={benefit}
            className="flex items-start gap-2 text-text-secondary typo-footnote"
          >
            <VIcon
              size={IconSize.Size16}
              className="shrink-0 text-accent-cabbage-default"
            />
            <span className="min-w-0 flex-1">{benefit}</span>
          </li>
        ))}
      </ul>
      <Button
        tag="a"
        href={getStartupsCheckoutUrl({ sourceId })}
        variant={ButtonVariant.Primary}
        size={ButtonSize.Small}
        className="w-full"
        onClick={() =>
          logStartups(LogEvent.UpgradeSubscription, 'squad upsell', {
            origin: Origin.SquadPage,
            source_id: sourceId,
          })
        }
      >
        See plans
      </Button>
    </section>
  );
};

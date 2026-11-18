import type { ReactElement, ReactNode } from 'react';
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
import usePersistentContext from '../../../../hooks/usePersistentContext';
import { LogEvent, Origin } from '../../../../lib/log';
import { squadSubscriptionQueryOptions } from '../../../../graphql/squadSubscription';
import { useSquadPageContext } from '../../SquadPageContext';
import { getSquadId, hasSquadFeature } from '../../lib/features';
import { SquadViewer } from '../../lib/viewer';
import { getStartupsCheckoutUrl } from '../../lib/routes';
import { SquadPlan } from '../../lib/plans';
import { useStartupsCashbackPromo } from '../../hooks/useStartupsCashbackPromo';
import { useSquadPlanPrices } from '../../hooks/useSquadPlanPrices';
import { useLogStartups } from '../../hooks/useLogStartups';
import { ActionType } from '../../../../graphql/actions';
import { useActions } from '../../../../hooks/useActions';
import { LaunchOfferBanner, MonthlyCredits } from '../promos/StartupsPromo';
import { getStartupsStarterOffer } from '../../hooks/useStartupsPromo';

// The Distribution and Analytics points of daily.dev/startups/, word for word.
const benefits = [
  'In developers’ feeds, by topic',
  'On Google and in AI answers',
  'What to write next, every week',
];

const Benefit = ({ children }: { children: ReactNode }): ReactElement => (
  <li className="flex items-start gap-2 text-text-secondary typo-footnote">
    <VIcon
      size={IconSize.Size16}
      className="shrink-0 text-accent-cabbage-default"
    />
    <span className="min-w-0 flex-1">{children}</span>
  </li>
);

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
  const [isDismissed, setDismissed, isDismissedFetched] = usePersistentContext(
    `startups_upsell_dismissed_${sourceId}`,
    false,
  );
  const { data: subscription } = useQuery({
    ...squadSubscriptionQueryOptions({ user, sourceId }),
    enabled: !!user && isCandidate,
  });
  const prices = useSquadPlanPrices();
  const logStartups = useLogStartups();
  // Dismissing any Startups promotion hides them all
  const { checkHasCompleted, completeAction, isActionsFetched } = useActions();
  const isShown =
    isCandidate &&
    isDismissedFetched &&
    !isDismissed &&
    isActionsFetched &&
    !checkHasCompleted(ActionType.DismissStartupsPromo) &&
    !!subscription &&
    !subscription.plan;
  const offer = getStartupsStarterOffer(useStartupsCashbackPromo());
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
      className="relative flex w-full flex-col overflow-hidden rounded-16 border border-border-subtlest-tertiary"
      style={{
        background:
          'linear-gradient(180deg, color-mix(in srgb, var(--theme-accent-cabbage-default) 9%, transparent), transparent 120px)',
      }}
    >
      <CloseButton
        size={ButtonSize.XSmall}
        className={
          offer.launchOffer
            ? 'absolute right-1.5 top-0'
            : 'absolute right-2 top-2'
        }
        aria-label="Dismiss"
        onClick={() => {
          setDismissed(true);
          completeAction(ActionType.DismissStartupsPromo);
          logStartups(LogEvent.DismissStartupsUpsell, 'squad upsell', {
            origin: Origin.SquadPage,
            source_id: sourceId,
          });
        }}
      />
      <LaunchOfferBanner promo={offer} />
      <div className="flex flex-col gap-5 p-4">
        <div className="flex flex-col gap-1 pr-6">
          <h2 className="text-balance font-bold typo-callout">
            Get your startup in front of developers
          </h2>
          <p className="text-text-secondary typo-footnote">
            {`Make ${squad.name} your company page, from ${
              prices[SquadPlan.Starter]
            } a month.`}
          </p>
        </div>
        <ul className="flex flex-col gap-2">
          {benefits.map((benefit) => (
            <Benefit key={benefit}>{benefit}</Benefit>
          ))}
          <Benefit>
            <MonthlyCredits promo={offer} /> every month
          </Benefit>
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
      </div>
    </section>
  );
};

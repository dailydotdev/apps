import type { ReactElement } from 'react';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import { CoreIcon, VIcon } from '../../../../components/icons';
import { IconSize } from '../../../../components/Icon';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { squadSubscriptionQueryOptions } from '../../../../graphql/squadSubscription';
import { LogEvent, Origin } from '../../../../lib/log';
import {
  startupsLavender,
  startupsLavenderBorder,
  startupsLavenderGlow,
  startupsLavenderInk,
  startupsLavenderTint,
} from '../../../../styles/custom';
import { useSquadPageContext } from '../../SquadPageContext';
import { getSquadId, hasSquadFeature } from '../../lib/features';
import { isStaffViewer } from '../../lib/viewer';
import { isCompanyPage } from '../../lib/companyPage';
import { getStartupsCheckoutUrl } from '../../lib/routes';
import { formatBoostCredits, formatCashbackMultiple } from '../../lib/plans';
import { useStartupsCashbackPromo } from '../../hooks/useStartupsCashbackPromo';
import { getStartupsStarterOffer } from '../../hooks/useStartupsPromo';
import { useLogStartups } from '../../hooks/useLogStartups';
import { useSquadFreeBoost } from '../freeBoost/useSquadFreeBoost';

// What the plan adds to a free page, each short enough for one line
const planAdds = [
  "In developers' feeds, by topic",
  'On Google and in AI answers',
  'Weekly intel on what your readers read',
  'Ideas for your next post',
  'Draft check before you post',
  'Content strategy with your agent',
  'API for posting and boosting',
];

const Added = ({ children }: { children: string }): ReactElement => (
  <li className="flex items-center gap-2.5 typo-footnote">
    <span
      className="flex size-4 shrink-0 items-center justify-center rounded-full"
      style={{ background: startupsLavender, color: startupsLavenderInk }}
    >
      <VIcon size={IconSize.Size16} secondary />
    </span>
    <span className="min-w-0 flex-1 truncate">{children}</span>
  </li>
);

const PlanOffer = ({
  sourceId,
  name,
}: {
  sourceId: string;
  name: string;
}): ReactElement => {
  const offer = getStartupsStarterOffer(useStartupsCashbackPromo());
  const logStartups = useLogStartups();

  return (
    <section
      className="flex w-full flex-col gap-4 rounded-16 border p-4"
      style={{
        borderColor: startupsLavenderBorder,
        background: startupsLavenderGlow,
      }}
    >
      <div className="flex flex-col gap-0.5">
        <h2 className="font-bold typo-callout">Reach more developers</h2>
        <p className="text-text-tertiary typo-footnote">
          {`What the Startup plan adds for ${name}:`}
        </p>
      </div>
      <ul className="flex flex-col gap-2">
        {planAdds.map((item) => (
          <Added key={item}>{item}</Added>
        ))}
      </ul>
      <div
        className="flex items-center gap-2.5 rounded-12 p-2.5"
        style={{ background: startupsLavenderTint }}
      >
        <CoreIcon size={IconSize.Medium} className="shrink-0" />
        <span className="flex min-w-0 flex-1 flex-col">
          <strong className="typo-footnote">Boost credits every month</strong>
          <span className="text-text-tertiary typo-caption1">
            {offer.launchOffer
              ? `From ${formatBoostCredits(offer.monthlyCredits)}, ${formatCashbackMultiple(offer.cashback)} your plan for ${offer.promoLength}`
              : `From ${formatBoostCredits(offer.monthlyCredits)} a month`}
          </span>
        </span>
      </div>
      <Button
        tag="a"
        href={getStartupsCheckoutUrl({ sourceId })}
        variant={ButtonVariant.Primary}
        size={ButtonSize.Small}
        className="w-full"
        onClick={() =>
          logStartups(LogEvent.UpgradeSubscription, 'plan widget', {
            origin: Origin.SquadPage,
            source_id: sourceId,
          })
        }
      >
        See the Startup plan
      </Button>
    </section>
  );
};

/**
 * In the side column of a free company page, for its admins, from their first
 * visit: what upgrading adds and where the plans start. Once the free
 * boost is over, the value panel above the feed carries the offer instead.
 */
export const SquadPlanWidget = (): ReactElement | null => {
  const { squad, viewer, isViewerKnown } = useSquadPageContext();
  const { user } = useAuthContext();
  const sourceId = getSquadId(squad);
  const isCandidate =
    isViewerKnown &&
    isStaffViewer(viewer) &&
    isCompanyPage(squad) &&
    !hasSquadFeature(squad, 'verified');
  const { data: subscription, isPending } = useQuery({
    ...squadSubscriptionQueryOptions({ user, sourceId }),
    enabled: !!user && isCandidate,
  });
  const boost = useSquadFreeBoost(squad);

  if (!isCandidate || isPending || subscription?.plan || !boost) {
    return null;
  }

  return <PlanOffer sourceId={sourceId} name={squad.name} />;
};

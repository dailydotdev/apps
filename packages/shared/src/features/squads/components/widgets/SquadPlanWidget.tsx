import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import { VIcon } from '../../../../components/icons';
import { IconSize } from '../../../../components/Icon';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { squadSubscriptionQueryOptions } from '../../../../graphql/squadSubscription';
import { LogEvent, Origin } from '../../../../lib/log';
import { useSquadPageContext } from '../../SquadPageContext';
import { getSquadId, hasSquadFeature } from '../../lib/features';
import { isStaffViewer } from '../../lib/viewer';
import { isCompanyPage } from '../../lib/companyPage';
import { getStartupsCheckoutUrl } from '../../lib/routes';
import { useStartupsCashbackPromo } from '../../hooks/useStartupsCashbackPromo';
import { getStartupsStarterOffer } from '../../hooks/useStartupsPromo';
import { useLogStartups } from '../../hooks/useLogStartups';
import { MonthlyCredits } from '../promos/StartupsPromo';
import { useSquadFreeBoost } from '../freeBoost/useSquadFreeBoost';
import { SquadWidget } from './SquadWidget';

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
 * What the Startup plan adds, in the side column of a free company page, for
 * its admins, from their first visit. Once the free boost is over, the value
 * panel above the feed carries the offer instead.
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
  const offer = getStartupsStarterOffer(useStartupsCashbackPromo());
  const logStartups = useLogStartups();

  if (!isCandidate || isPending || subscription?.plan || !boost) {
    return null;
  }

  return (
    <SquadWidget
      title="You're on the free plan"
      className="gap-3 bg-overlay-float-cabbage"
    >
      <p className="text-text-secondary typo-footnote">
        {`The Startup plan puts ${squad.name} in front of more developers:`}
      </p>
      <ul className="flex flex-col gap-2">
        <Benefit>In developers&apos; feeds, by topic</Benefit>
        <Benefit>On Google and in AI answers</Benefit>
        <Benefit>
          <MonthlyCredits promo={offer} /> every month
        </Benefit>
        <Benefit>Weekly intel on what your readers read</Benefit>
      </ul>
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
    </SquadWidget>
  );
};

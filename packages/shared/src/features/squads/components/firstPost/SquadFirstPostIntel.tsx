import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../../../contexts/AuthContext';
import {
  developerTrendsQueryOptions,
  squadIntelHighlightsQueryOptions,
} from '../../../../graphql/squadIntel';
import { squadSubscriptionQueryOptions } from '../../../../graphql/squadSubscription';
import { useLazyModal } from '../../../../hooks/useLazyModal';
import { LazyModal } from '../../../../components/modals/common/types';
import { LogEvent, Origin } from '../../../../lib/log';
import { useSquadPageContext } from '../../SquadPageContext';
import { getSquadId } from '../../lib/features';
import { getIntelOpening } from '../../lib/intel';
import {
  getSquadManageUrl,
  getSquadUrl,
  getStartupsCheckoutUrl,
  SquadManageSection,
} from '../../lib/routes';
import { getStartupsContentPrompt } from '../../lib/setup';
import { useLogStartups } from '../../hooks/useLogStartups';
import { SquadPageLayout } from '../SquadPageLayout';
import { SquadSubPageHeader } from '../SquadSubPageHeader';
import { useSquadFreeBoost } from '../freeBoost/useSquadFreeBoost';
import { FirstPostIntel, FirstPostIntelWrite } from './FirstPostIntel';
import { FirstPostIntelProgress } from './FirstPostIntelProgress';
import { FirstPostTrends } from './FirstPostTrends';

const BOOST_DOLLARS = 100;

// Pages whose admin already watched the intel being put together, so it
// opens straight on the intel the next time
const analysisSeen = new Set<string>();

const prefersReducedMotion = (): boolean =>
  !!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * The page's intel as a sub-page of the company page, at /intel: it takes
 * the content area, with a way back, the way Members or Rules do.
 */
export const SquadFirstPostIntel = (): ReactElement | null => {
  const { squad } = useSquadPageContext();
  const { user } = useAuthContext();
  const sourceId = getSquadId(squad);
  const { openModal } = useLazyModal();
  const logStartups = useLogStartups();
  const { data: subscription } = useQuery(
    squadSubscriptionQueryOptions({ user, sourceId }),
  );
  const { data: intel } = useQuery(
    squadIntelHighlightsQueryOptions({
      user,
      sourceId,
      createdAt: squad.createdAt,
    }),
  );
  // A free page whose trial ended, or never had one, reads the general trends
  const { data: trends } = useQuery(developerTrendsQueryOptions({ user }));
  const boost = useSquadFreeBoost(squad);
  const [isAnalyzing, setAnalyzing] = useState(
    () => !analysisSeen.has(sourceId) && !prefersReducedMotion(),
  );

  useEffect(() => {
    globalThis.scrollTo?.({ top: 0 });
  }, []);

  if (!intel && !trends) {
    return null;
  }

  const log = (event: LogEvent, targetId: string) =>
    logStartups(event, targetId, {
      origin: Origin.SquadIntel,
      source_id: sourceId,
    });
  const write = () => {
    log(LogEvent.ClickStartupsSetupStep, 'first post write');
    openModal({
      type: LazyModal.SmartComposer,
      props: { initialSquadHandle: squad.handle, initialKind: 'text' },
    });
  };
  const hasBoost = boost?.state === 'setup' || boost?.state === 'first_post';
  const upgradeUrl = subscription?.plan
    ? undefined
    : getStartupsCheckoutUrl({ sourceId });
  const isAnalyzingIntel = !!intel?.trial && isAnalyzing;

  return (
    <SquadPageLayout
      header={
        <SquadSubPageHeader
          title={
            (isAnalyzingIntel && 'Building your intel') ||
            (intel ? 'Weekly intel' : 'Developer trends')
          }
          backUrl={getSquadUrl(squad.handle)}
          backLabel={`Back to ${squad.name}`}
          action={!isAnalyzingIntel && <FirstPostIntelWrite onWrite={write} />}
        />
      }
    >
      {!intel && trends && (
        <FirstPostTrends
          trends={trends}
          upgradeUrl={upgradeUrl}
          onUpgrade={() =>
            log(LogEvent.UpgradeSubscription, 'first post trends')
          }
        />
      )}
      {intel && isAnalyzingIntel && (
        <div className="px-4 tablet:px-6">
          <FirstPostIntelProgress
            intel={intel}
            name={squad.name}
            openingTag={getIntelOpening(intel.topics)?.tag}
            onDone={() => {
              analysisSeen.add(sourceId);
              setAnalyzing(false);
            }}
          />
        </div>
      )}
      {intel && !isAnalyzingIntel && (
        <FirstPostIntel
          intel={intel}
          editTopicsUrl={getSquadManageUrl(
            squad.handle,
            SquadManageSection.Intel,
          )}
          getAgentPrompt={() => getStartupsContentPrompt(squad.handle)}
          onCopyPrompt={() =>
            log(LogEvent.CopyStartupsSetup, 'first post content prompt')
          }
          upgradeUrl={upgradeUrl}
          onUpgrade={() =>
            log(LogEvent.UpgradeSubscription, 'first post intel')
          }
          boostDollars={hasBoost ? BOOST_DOLLARS : undefined}
          onWrite={write}
        />
      )}
    </SquadPageLayout>
  );
};

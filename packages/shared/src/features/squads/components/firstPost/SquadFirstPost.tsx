import type { ReactElement } from 'react';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { developerTrendsQueryOptions } from '../../../../graphql/developerTrends';
import { squadSubscriptionQueryOptions } from '../../../../graphql/squadSubscription';
import { useLazyModal } from '../../../../hooks/useLazyModal';
import { LazyModal } from '../../../../components/modals/common/types';
import { LogEvent, Origin } from '../../../../lib/log';
import { useSquadPageContext } from '../../SquadPageContext';
import type { Squad } from '../../../../graphql/sources';
import { getSquadId } from '../../lib/features';
import { isStaffViewer } from '../../lib/viewer';
import { isCompanyPage } from '../../lib/companyPage';
import {
  getSquadIntelUrl,
  getSquadManageUrl,
  getStartupsCheckoutUrl,
  SquadManageSection,
} from '../../lib/routes';
import {
  isCompanyPageDescriptionReady,
  isPlaceholderSquadImage,
} from '../../lib/readiness';
import { getFirstPostIdeasPrompt } from '../../lib/setup';
import { useLogStartups } from '../../hooks/useLogStartups';
import { useSquadFreeBoost } from '../freeBoost/useSquadFreeBoost';
import type { FirstPostBoostStep } from './FirstPostCard';
import { FirstPostCard } from './FirstPostCard';

const BOOST_DOLLARS = 100;
const TRENDS_SHOWN = 4;

/** Whether the page's admins see the first post card instead of the composer */
export const useIsFirstPostShown = (): boolean => {
  const { squad, viewer, isViewerKnown } = useSquadPageContext();

  return (
    isViewerKnown &&
    isStaffViewer(viewer) &&
    isCompanyPage(squad) &&
    !squad.flags?.totalPosts
  );
};

const getMissingForBoost = (
  squad: Pick<Squad, 'handle' | 'image' | 'website' | 'description'>,
): FirstPostBoostStep[] => {
  const details = getSquadManageUrl(squad.handle, SquadManageSection.Details);
  const steps: Array<FirstPostBoostStep | false> = [
    isPlaceholderSquadImage(squad.image) && {
      id: 'logo',
      title: 'a logo',
      href: details,
    },
    !squad.website && {
      id: 'website',
      title: 'a website',
      href: getSquadManageUrl(squad.handle, SquadManageSection.Links),
    },
    !isCompanyPageDescriptionReady(squad.description) && {
      id: 'description',
      title: 'a description',
      href: details,
    },
  ];

  return steps.filter((step): step is FirstPostBoostStep => !!step);
};

/** The first post card at the top of a company page with no posts yet */
export const SquadFirstPost = (): ReactElement | null => {
  const { squad } = useSquadPageContext();
  const { user } = useAuthContext();
  const isShown = useIsFirstPostShown();
  const sourceId = getSquadId(squad);
  const { openModal } = useLazyModal();
  const logStartups = useLogStartups();
  const boost = useSquadFreeBoost(squad);
  const { data: subscription } = useQuery({
    ...squadSubscriptionQueryOptions({ user, sourceId }),
    enabled: !!user && isShown,
  });
  const { data: trends } = useQuery({
    ...developerTrendsQueryOptions(),
    enabled: isShown,
  });

  if (!isShown) {
    return null;
  }

  const log = (targetId: string) =>
    logStartups(LogEvent.ClickStartupsSetupStep, targetId, {
      origin: Origin.SquadPage,
      source_id: sourceId,
    });
  const openComposer = (initialKind: 'text' | 'link') =>
    openModal({
      type: LazyModal.SmartComposer,
      props: { initialSquadHandle: squad.handle, initialKind },
    });
  const hasBoost = boost?.state === 'setup' || boost?.state === 'first_post';
  const isPaid = !!subscription?.plan;

  return (
    <FirstPostCard
      className="mx-4 tablet:mx-0"
      boostDollars={hasBoost ? BOOST_DOLLARS : undefined}
      missingForBoost={boost?.state === 'setup' ? getMissingForBoost(squad) : []}
      ideas={{
        trends: trends?.risingTopics
          .filter(({ broad }) => broad)
          .slice(0, TRENDS_SHOWN),
        intelUrl:
          isPaid && squad.currentMember?.seat
            ? getSquadIntelUrl(squad.handle)
            : undefined,
        upgradeUrl: isPaid ? undefined : getStartupsCheckoutUrl({ sourceId }),
        getAgentPrompt: () =>
          getFirstPostIdeasPrompt({ handle: squad.handle, hasIntel: isPaid }),
      }}
      onWrite={(starter) => {
        log(starter ? 'first post starter' : 'first post idea');
        openComposer('text');
      }}
      onShare={() => {
        log('first post share');
        openComposer('link');
      }}
      onOpenIdeas={() => log('first post ideas')}
      onUpgrade={() =>
        logStartups(LogEvent.UpgradeSubscription, 'first post ideas', {
          origin: Origin.SquadPage,
          source_id: sourceId,
        })
      }
      onCopyAgentPrompt={() =>
        logStartups(LogEvent.CopyStartupsSetup, 'first post ideas', {
          origin: Origin.SquadPage,
          source_id: sourceId,
        })
      }
    />
  );
};

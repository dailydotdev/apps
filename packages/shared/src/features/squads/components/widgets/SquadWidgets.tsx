import type { ReactElement } from 'react';
import React from 'react';
import { SquadStack } from '../../../../components/squads/stack/SquadStack';
import { useSquadPageContext } from '../../SquadPageContext';
import { hasSquadFeature } from '../../lib/features';
import { isStaffViewer } from '../../lib/viewer';
import { FeaturedSquadCard, VerifiedCompanySquadCard } from '../VerifiedSquad';
import { SquadPreviewToggle } from './SquadPreview';
import { SquadShareWidget } from './SquadShareWidget';
import { SquadTeamWidget } from './SquadTeamWidget';
import { SquadAnalyticsWidget } from './SquadAnalyticsWidget';
import { SquadLinksWidget } from './SquadLinksWidget';
import { SquadRulesWidget } from './SquadRulesWidget';
import { SquadJobsWidget } from './SquadJobsWidget';
import { SimilarSquadsWidget } from './SimilarSquadsWidget';
import { SquadAgentWidget } from './SquadAgentWidget';
import { isCompanyPage } from '../../lib/companyPage';
import { SquadSupportWidget } from './SquadSupportWidget';
import { SquadSetupWidget } from './SquadSetupWidget';
import { SquadIntelWidget } from './SquadIntelWidget';
import { SquadPlanWidget } from './SquadPlanWidget';

export const SquadWidgets = (): ReactElement => {
  const { squad, viewer, isViewerKnown } = useSquadPageContext();
  const isStaff = isViewerKnown && isStaffViewer(viewer);
  // Until the first post, the page's admins see only what gets them to it;
  // View as a visitor shows the rest
  const isBeforeFirstPost =
    isStaff && isCompanyPage(squad) && !squad.flags?.totalPosts;

  return (
    <>
      <SquadPreviewToggle />
      {hasSquadFeature(squad, 'verified') && <VerifiedCompanySquadCard />}
      {squad.flags?.featured && <FeaturedSquadCard />}
      {isStaff && !isBeforeFirstPost && <SquadShareWidget squad={squad} />}
      <div className="hidden laptop:contents">
        <SquadSetupWidget shouldRefresh />
        <SquadIntelWidget />
        <SquadPlanWidget />
      </div>
      <SquadAgentWidget />
      <SquadSupportWidget />
      <SquadJobsWidget />
      <SquadTeamWidget squad={squad} />
      <SquadRulesWidget squad={squad} />
      <SquadLinksWidget squad={squad} />
      {!isBeforeFirstPost && <SquadStack squad={squad} />}
      {!isBeforeFirstPost && (
        <SimilarSquadsWidget key={squad.id} squad={squad} />
      )}
      {isStaff && !isCompanyPage(squad) && (
        <SquadAnalyticsWidget squad={squad} />
      )}
    </>
  );
};

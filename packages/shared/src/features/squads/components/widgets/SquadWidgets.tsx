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

export const SquadWidgets = (): ReactElement => {
  const { squad, viewer, isViewerKnown } = useSquadPageContext();
  const isStaff = isViewerKnown && isStaffViewer(viewer);

  return (
    <>
      <SquadPreviewToggle />
      {hasSquadFeature(squad, 'verified') && <VerifiedCompanySquadCard />}
      <SquadAgentWidget />
      {squad.flags?.featured && <FeaturedSquadCard />}
      <SquadJobsWidget />
      {isStaff && <SquadShareWidget squad={squad} />}
      <SquadRulesWidget squad={squad} />
      <SquadTeamWidget squad={squad} />
      <SquadStack squad={squad} />
      <SimilarSquadsWidget key={squad.id} squad={squad} />
      {isStaff && !isCompanyPage(squad) && (
        <SquadAnalyticsWidget squad={squad} />
      )}
      <SquadLinksWidget squad={squad} />
    </>
  );
};

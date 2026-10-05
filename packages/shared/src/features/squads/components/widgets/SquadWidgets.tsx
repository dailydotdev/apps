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

export const SquadWidgets = (): ReactElement => {
  const { squad, viewer, isViewerKnown } = useSquadPageContext();
  const isStaff = isViewerKnown && isStaffViewer(viewer);

  return (
    <>
      <SquadPreviewToggle />
      {hasSquadFeature(squad, 'verified') && <VerifiedCompanySquadCard />}
      {squad.flags?.featured && <FeaturedSquadCard />}
      {isStaff && <SquadShareWidget squad={squad} />}
      <SquadRulesWidget squad={squad} />
      <SquadTeamWidget squad={squad} />
      <SquadStack squad={squad} />
      {isStaff && <SquadAnalyticsWidget squad={squad} />}
      <SquadLinksWidget squad={squad} />
    </>
  );
};

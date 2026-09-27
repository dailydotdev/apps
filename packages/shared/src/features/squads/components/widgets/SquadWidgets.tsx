import type { ReactElement } from 'react';
import React from 'react';
import { SquadStack } from '../../../../components/squads/stack/SquadStack';
import { useSquadPageContext } from '../../SquadPageContext';
import { hasSquadFeature } from '../../lib/features';
import { isStaffViewer } from '../../lib/viewer';
import { VerifiedCompanySquadCard } from '../VerifiedSquad';
import { SquadPreviewToggle } from './SquadPreview';
import { SquadShareWidget } from './SquadShareWidget';
import { SquadTeamWidget } from './SquadTeamWidget';
import { SquadAnalyticsWidget } from './SquadAnalyticsWidget';
import { SquadLinksWidget } from './SquadLinksWidget';

export const SquadWidgets = (): ReactElement => {
  const { squad, viewer, isViewerReady } = useSquadPageContext();

  return (
    <>
      <SquadPreviewToggle />
      {hasSquadFeature(squad, 'verified') && <VerifiedCompanySquadCard />}
      {isViewerReady && isStaffViewer(viewer) && (
        <SquadShareWidget squad={squad} />
      )}
      <SquadTeamWidget squad={squad} />
      <SquadStack squad={squad} />
      {isViewerReady && <SquadAnalyticsWidget squad={squad} />}
      <SquadLinksWidget squad={squad} />
    </>
  );
};

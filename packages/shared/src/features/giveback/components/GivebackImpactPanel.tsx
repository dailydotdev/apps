import type { ReactElement } from 'react';
import React from 'react';
import { FlexCol } from '../../../components/utilities';
import { GivebackPersonalRoadmap } from './GivebackPersonalRoadmap';
import { GivebackLeaderboard } from './GivebackLeaderboard';

interface GivebackImpactPanelProps {
  onTakeAction: () => void;
}

// The Impact tab: the visitor's own reward-ladder journey through the campaign,
// followed by where they stand against the rest of the community this week.
export const GivebackImpactPanel = ({
  onTakeAction,
}: GivebackImpactPanelProps): ReactElement => (
  <FlexCol className="gap-12">
    <GivebackPersonalRoadmap onTakeAction={onTakeAction} />
    <div className="border-t border-border-subtlest-tertiary pt-12">
      <GivebackLeaderboard onTakeAction={onTakeAction} />
    </div>
  </FlexCol>
);

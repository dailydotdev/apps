import type { ReactElement } from 'react';
import React from 'react';
import { FlexCol } from '../../../components/utilities';
import { GivebackCommunityGoalProgress } from './GivebackCommunityGoalProgress';
import { GivebackPersonalRoadmap } from './GivebackPersonalRoadmap';

interface GivebackImpactPanelProps {
  onTakeAction: () => void;
}

// The Impact tab: the campaign's funding progress (community pot + sponsors)
// followed by the visitor's own reward-ladder journey. The leaderboard and live
// community feed from the design are intentionally skipped — the campaign starts
// from scratch, so the social-proof half stays funding + personal progress.
export const GivebackImpactPanel = ({
  onTakeAction,
}: GivebackImpactPanelProps): ReactElement => (
  <FlexCol className="gap-12">
    <GivebackCommunityGoalProgress />
    <div className="border-t border-border-subtlest-tertiary pt-12">
      <GivebackPersonalRoadmap onTakeAction={onTakeAction} />
    </div>
  </FlexCol>
);

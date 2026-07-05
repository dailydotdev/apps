import type { ReactElement } from 'react';
import React from 'react';
import { FlexCol } from '../../../components/utilities';
import { GivebackPersonalRoadmap } from './GivebackPersonalRoadmap';

interface GivebackImpactPanelProps {
  onTakeAction: () => void;
}

// The Impact tab: the visitor's own reward-ladder journey through the campaign.
export const GivebackImpactPanel = ({
  onTakeAction,
}: GivebackImpactPanelProps): ReactElement => (
  <FlexCol className="gap-12">
    <GivebackPersonalRoadmap onTakeAction={onTakeAction} />
  </FlexCol>
);

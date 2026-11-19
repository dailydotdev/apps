import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../components/typography/Typography';
import type { PatchyMood } from './patchyConfig';
import { getPatchyConfig } from './patchyConfig';
import { PatchyMenu } from './PatchyMenu';

interface PatchyPanelHeaderProps {
  mood: PatchyMood;
  onNavigate?: () => void;
}

// Top of the Streak panel when Patchy is on: his face, his mood and what you
// can ask him for.
export const PatchyPanelHeader = ({
  mood,
  onNavigate,
}: PatchyPanelHeaderProps): ReactElement => {
  const { faceImage, moods } = getPatchyConfig();
  return (
    // mx-4 lines the card up with the streak hero's px-4 below it.
    <div className="mx-4 mb-2 mt-1 flex flex-col gap-2 rounded-16 bg-surface-float p-2">
      <div className="flex items-center gap-2">
        <img
          src={faceImage[moods[mood].face]}
          alt="Patchy"
          className="size-12 shrink-0 rounded-full"
          draggable={false}
        />
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
          className="min-w-0 flex-1"
        >
          {moods[mood].copy}
        </Typography>
      </div>
      <PatchyMenu onNavigate={onNavigate} />
    </div>
  );
};

import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../components/typography/Typography';
import type { PatchyMood } from './patchyConfig';
import { getPatchyConfig } from './patchyConfig';
import { PatchyMenu, usePatchyContext } from './PatchyMenu';
import { getPatchyContextLine } from './patchyContext';

interface PatchyPanelHeaderProps {
  mood: PatchyMood;
  onNavigate?: () => void;
}

// Top of the Streak panel when Patchy is on: his face, a line about where you
// are (or his mood), and what he can do for you here.
export const PatchyPanelHeader = ({
  mood,
  onNavigate,
}: PatchyPanelHeaderProps): ReactElement => {
  const { faceImage, moods } = getPatchyConfig();
  const context = usePatchyContext();
  const contextLine = getPatchyContextLine(context);
  // Reading along: his reading face; otherwise his mood's.
  const face = context.kind === 'post' ? 'reading' : moods[mood].face;
  return (
    // mx-4 lines the card up with the streak hero's px-4 below it.
    <div className="mx-4 mb-2 mt-1 flex flex-col gap-2 rounded-16 bg-surface-float p-2">
      <div className="flex items-center gap-2">
        <img
          src={faceImage[face]}
          alt="Patchy"
          className="size-12 shrink-0 rounded-full"
          draggable={false}
        />
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
          className="min-w-0 flex-1"
        >
          {contextLine ?? moods[mood].copy}
        </Typography>
      </div>
      <PatchyMenu context={context} onNavigate={onNavigate} />
    </div>
  );
};

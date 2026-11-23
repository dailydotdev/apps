import type { ReactElement } from 'react';
import React from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../components/typography/Typography';
import type { StreakRingState } from '../../hooks/streaks/useStreakRingState';
import type { PatchyEmote, PatchyFace, PatchyMood } from './patchyConfig';
import { getPatchyConfig } from './patchyConfig';
import type { PatchyMotion } from './patchyIdle';
import { PatchyMenu, usePatchyContext } from './PatchyMenu';
import { getPatchyContextLine } from './patchyContext';
import { PatchyBoneImage, PatchyRailIcon } from './PatchyRailIcon';
import { usePatchyBone } from './patchyBone';

export interface PatchyPanelState {
  face: PatchyFace;
  mood: PatchyMood;
  motion: PatchyMotion | null;
  motionKey: string;
  emote: PatchyEmote | null;
  emoteCount: number;
  emoteKey: number;
}

interface PatchyPanelProps {
  patchy: PatchyPanelState;
  state: StreakRingState;
  hasReadToday: boolean;
  onClose?: () => void;
}

const PatchyBoneCard = ({
  hasFreeBone,
  bonesGiven,
  giveFreeBone,
}: ReturnType<typeof usePatchyBone>): ReactElement => {
  const bonesLine =
    bonesGiven === 1 ? '1 bone given' : `${bonesGiven} bones given`;
  return (
    <div className="flex items-center gap-3 rounded-16 bg-surface-float p-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-12 bg-background-default">
        <PatchyBoneImage className="size-8" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <Typography type={TypographyType.Callout} bold>
          Give a bone
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          {hasFreeBone
            ? 'One free bone a day'
            : `Next free bone tomorrow · ${bonesLine}`}
        </Typography>
      </div>
      <Button
        type="button"
        size={ButtonSize.Small}
        variant={ButtonVariant.Primary}
        disabled={!hasFreeBone}
        onClick={giveFreeBone}
      >
        {hasFreeBone ? 'Give' : 'Given'}
      </Button>
    </div>
  );
};

// Patchy's own panel, opened from his spot on the rail: him up close (the
// same circle, animations and reactions as on the rail), a line about where
// you are, what he can do for you here, and his bone.
export const PatchyPanel = ({
  patchy,
  state,
  hasReadToday,
  onClose,
}: PatchyPanelProps): ReactElement => {
  const { moods } = getPatchyConfig();
  const context = usePatchyContext();
  const contextLine = getPatchyContextLine(context);
  const bone = usePatchyBone();
  // Today's bone is still waiting: he looks up hopefully, unless he's busy
  // reacting, reading or suggesting something.
  const isHopeful =
    bone.hasFreeBone && !patchy.emote && patchy.face !== 'reading';

  return (
    <div className="flex flex-col gap-3 px-4 pb-4 pt-1">
      <div className="flex flex-col items-center gap-3 rounded-16 bg-surface-float px-3 pb-3 pt-6">
        <span className="flex size-20 items-center justify-center">
          <span className="scale-[2.5]">
            <PatchyRailIcon
              face={isHopeful ? 'hopeful' : patchy.face}
              motion={isHopeful ? null : patchy.motion}
              motionKey={patchy.motionKey}
              emote={patchy.emote}
              emoteCount={patchy.emoteCount}
              emoteKey={patchy.emoteKey}
              state={state}
              hasReadToday={hasReadToday}
              showStreak={false}
            />
          </span>
        </span>
        <div className="flex flex-col items-center text-center">
          <Typography type={TypographyType.Body} bold>
            Patchy is {moods[patchy.mood].label}
          </Typography>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Secondary}
          >
            {contextLine ?? moods[patchy.mood].copy}
          </Typography>
        </div>
      </div>
      <PatchyBoneCard {...bone} />
      <PatchyMenu context={context} onNavigate={onClose} />
    </div>
  );
};

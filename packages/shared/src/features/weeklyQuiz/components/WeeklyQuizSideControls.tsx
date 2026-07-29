import type { ReactElement } from 'react';
import React from 'react';
import {
  VolumeIcon,
  VolumeLowIcon,
  VolumeOffIcon,
  MiniCloseIcon,
} from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { WeeklyQuizAudioLevel } from '../hooks/useWeeklyQuizAudio';
import styles from '../WeeklyQuiz.module.css';

interface WeeklyQuizSideControlsProps {
  level: WeeklyQuizAudioLevel;
  onCycleSound: () => void;
  onClose: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const levelIcon: Record<WeeklyQuizAudioLevel, typeof VolumeIcon> = {
  [WeeklyQuizAudioLevel.Normal]: VolumeIcon,
  [WeeklyQuizAudioLevel.Less]: VolumeLowIcon,
  [WeeklyQuizAudioLevel.Muted]: VolumeOffIcon,
};

const levelLabel: Record<WeeklyQuizAudioLevel, string> = {
  [WeeklyQuizAudioLevel.Normal]: 'Sound on',
  [WeeklyQuizAudioLevel.Less]: 'Sound low',
  [WeeklyQuizAudioLevel.Muted]: 'Sound off',
};

// The mute + close controls, stacked vertically. Rendered as a sibling of the
// quiz card (not inside it) so they sit just outside its right edge, each with
// the card's white border + gradient.
export const WeeklyQuizSideControls = ({
  level,
  onCycleSound,
  onClose,
}: WeeklyQuizSideControlsProps): ReactElement => {
  const SoundIcon = levelIcon[level];

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        className={`${styles.sideControl} h-11 w-11`}
        aria-label="Close"
        title="Close"
        onClick={onClose}
      >
        <MiniCloseIcon size={IconSize.Small} />
      </button>
      <button
        type="button"
        className={`${styles.sideControl} h-11 w-11`}
        aria-label={levelLabel[level]}
        title={levelLabel[level]}
        onClick={onCycleSound}
      >
        <SoundIcon size={IconSize.Small} />
      </button>
    </div>
  );
};

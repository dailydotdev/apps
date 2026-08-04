import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
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
  // 'stack' (default): a vertical column, sized to sit just outside the card's
  // right edge on desktop. 'inline': a compact horizontal row for the mobile
  // full-bleed header, where the controls live inside the surface.
  layout?: 'stack' | 'inline';
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

// The mute + close controls. In the default 'stack' layout they render as a
// vertical column sitting just outside the card's right edge on desktop, each
// with the card's white border + gradient. In the 'inline' layout they render
// as a compact horizontal row for the mobile full-bleed header, where they live
// inside the surface (above the mascot).
export const WeeklyQuizSideControls = ({
  level,
  onCycleSound,
  onClose,
  layout = 'stack',
}: WeeklyQuizSideControlsProps): ReactElement => {
  const SoundIcon = levelIcon[level];
  const inline = layout === 'inline';
  const iconSize = inline ? IconSize.XSmall : IconSize.Small;
  const buttonClass = classNames(
    styles.sideControl,
    inline ? 'h-9 w-9' : 'h-11 w-11',
  );

  const soundButton = (
    <button
      type="button"
      className={buttonClass}
      aria-label={levelLabel[level]}
      title={levelLabel[level]}
      onClick={onCycleSound}
    >
      <SoundIcon size={iconSize} />
    </button>
  );
  const closeButton = (
    <button
      type="button"
      className={buttonClass}
      aria-label="Close"
      title="Close"
      onClick={onClose}
    >
      <MiniCloseIcon size={iconSize} />
    </button>
  );

  // Desktop column leads with close (top); the mobile row keeps close on the
  // far right, the conventional spot for a dismiss control.
  return (
    <div className={classNames('flex gap-2', inline ? 'flex-row' : 'flex-col')}>
      {inline ? (
        <>
          {soundButton}
          {closeButton}
        </>
      ) : (
        <>
          {closeButton}
          {soundButton}
        </>
      )}
    </div>
  );
};

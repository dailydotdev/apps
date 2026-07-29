import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyType,
} from '../../../components/typography/Typography';
import { VIcon, MiniCloseIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import type { WeeklyQuizOption } from '../types';
import styles from '../WeeklyQuiz.module.css';

interface WeeklyQuizAnswerOptionProps {
  option: WeeklyQuizOption;
  index: number;
  isSelected: boolean;
  isAnswered: boolean;
  onSelect: (optionId: string) => void;
}

const letters = ['A', 'B', 'C', 'D'];

// A single answer tile. Glassy and poppy before answering; once answered the
// correct option glows green (and pops) and a wrong pick glows red (and
// shakes), with the others dimmed.
export const WeeklyQuizAnswerOption = ({
  option,
  index,
  isSelected,
  isAnswered,
  onSelect,
}: WeeklyQuizAnswerOptionProps): ReactElement => {
  const showCorrect = isAnswered && option.isCorrect;
  const showIncorrect = isAnswered && isSelected && !option.isCorrect;
  const dimmed = isAnswered && !option.isCorrect && !isSelected;

  return (
    <button
      type="button"
      disabled={isAnswered}
      // Select on pointer-down so the very first press always counts — waiting
      // for a full click drops the press if anything shifts between down and up.
      // onClick stays for keyboard (Enter/Space); onSelect is idempotent.
      onPointerDown={() => onSelect(option.id)}
      onClick={() => onSelect(option.id)}
      aria-pressed={isSelected}
      className={classNames(
        'group flex w-full items-center gap-3 rounded-16 p-4 text-left text-white',
        styles.tile,
        showCorrect && classNames('animate-reward-pop', styles.tileCorrect),
        showIncorrect && classNames('animate-nudge-shake', styles.tileWrong),
        dimmed && styles.tileDimmed,
      )}
    >
      <span
        className={classNames(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-10 font-bold typo-callout',
          showCorrect && 'bg-accent-avocado-default text-white',
          showIncorrect && 'bg-accent-ketchup-default text-white',
          !showCorrect && !showIncorrect && 'bg-white/20 text-white',
        )}
        aria-hidden
      >
        {showCorrect ? <VIcon size={IconSize.Small} /> : null}
        {showIncorrect ? <MiniCloseIcon size={IconSize.Small} /> : null}
        {!showCorrect && !showIncorrect ? letters[index] ?? index + 1 : null}
      </span>
      <Typography type={TypographyType.Callout} className="min-w-0 flex-1">
        {option.label}
      </Typography>
    </button>
  );
};

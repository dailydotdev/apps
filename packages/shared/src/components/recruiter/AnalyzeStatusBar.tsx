import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { Loader } from '../Loader';
import { VIcon } from '../icons';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';

const LOADING_STEPS = [
  'Analyzing your job description',
  'Mapping skills, requirements, and intent',
  'Scanning the daily.dev network',
  'Ranking engineers most likely to engage',
];

const COMPLETE_MESSAGE = 'Your hiring edge is ready';

type AnalyzeStatusBarProps = {
  loadingStep: number;
  className?: string;
};

export const AnalyzeStatusBar = ({
  loadingStep,
  className,
}: AnalyzeStatusBarProps): ReactElement => {
  const isComplete = loadingStep >= LOADING_STEPS.length;
  const currentStepIndex = Math.min(loadingStep, LOADING_STEPS.length - 1);
  const message = isComplete
    ? COMPLETE_MESSAGE
    : LOADING_STEPS[currentStepIndex];

  return (
    <div
      className={classNames(
        'flex items-center justify-center gap-2 border-b border-border-subtlest-tertiary bg-brand-float px-4 py-2',
        className,
      )}
    >
      {isComplete ? (
        <div className="size-5 rounded-8 text-brand-default">
          <VIcon />
        </div>
      ) : (
        <Loader className="size-5" />
      )}
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Brand}
        bold
      >
        {message}
      </Typography>
    </div>
  );
};

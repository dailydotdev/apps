import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { VIcon } from '../icons';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { GenericLoaderSpinner } from '../utilities/loaders';
import { IconSize } from '../Icon';

const LOADING_STEPS = [
  'Analyzing your job description (this may take a minute)',
  'Extracting skills and requirements',
  'Finding matches in our community...',
];

const COMPLETE_MESSAGE = 'Your analysis is ready';

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
        'flex items-center justify-center gap-2 border-b border-border-subtlest-tertiary bg-brand-float px-4 py-3',
        className,
      )}
    >
      {isComplete ? (
        <VIcon className="size-5 text-status-success" />
      ) : (
        <GenericLoaderSpinner size={IconSize.XSmall} />
      )}
      <Typography type={TypographyType.Footnote} color={TypographyColor.Brand}>
        {message}
      </Typography>
    </div>
  );
};

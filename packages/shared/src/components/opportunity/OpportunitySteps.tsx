import classNames from 'classnames';
import type { ReactNode, ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import type { ButtonProps } from '../buttons/Button';
import { Button, ButtonVariant } from '../buttons/Button';
import { useOpportunityEditContext } from './OpportunityEditContext';
import ProgressCircle from '../ProgressCircle';

export type OpportunityStepsProps = {
  className?: string;
  step: number;
  totalSteps: number;
  ctaText: ReactNode;
  ctaButtonProps?: ButtonProps<'button'>;
};

export const OpportunitySteps = ({
  className,
  step,
  totalSteps,
  ctaText,
  ctaButtonProps,
}: OpportunityStepsProps): ReactElement => {
  const { canEdit } = useOpportunityEditContext();

  if (!canEdit) {
    return null;
  }

  return (
    <div
      className={classNames('hidden items-center gap-4 laptop:flex', className)}
    >
      <div className="flex items-center">
        <ProgressCircle
          stroke={2}
          size={20}
          progress={(Math.max(0, step - 1) / totalSteps) * 100}
        />
        <Typography
          className="px-2"
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
        >
          Step {step} of {totalSteps}
        </Typography>
      </div>
      <Button variant={ButtonVariant.Primary} {...ctaButtonProps}>
        {ctaText}
      </Button>
    </div>
  );
};

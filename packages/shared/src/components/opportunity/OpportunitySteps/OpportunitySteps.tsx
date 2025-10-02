import classNames from 'classnames';
import type { ReactNode, ReactElement } from 'react';
import React from 'react';
import type z from 'zod';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import type { ButtonProps } from '../../buttons/Button';
import { Button, ButtonVariant } from '../../buttons/Button';
import { useOpportunityEditContext } from '../OpportunityEditContext';
import ProgressCircle from '../../ProgressCircle';
import { getPercentage } from '../../../lib/func';
import { usePrompt } from '../../../hooks/usePrompt';
import { labels } from '../../../lib/labels';

export type OpportunityStepsProps = {
  className?: string;
  step: number;
  totalSteps: number;
  ctaText: ReactNode;
  ctaButtonProps?: ButtonProps<'button'>;
  schema?: z.ZodType;
};

export const OpportunitySteps = ({
  className,
  step,
  totalSteps,
  ctaText,
  ctaButtonProps,
  schema,
}: OpportunityStepsProps): ReactElement => {
  const { showPrompt } = usePrompt();
  const { canEdit, onValidateOpportunity } = useOpportunityEditContext();

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
          progress={getPercentage(totalSteps, step)}
        />
        <Typography
          className="px-2"
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
        >
          Step {step} of {totalSteps}
        </Typography>
      </div>
      <Button
        variant={ButtonVariant.Primary}
        {...ctaButtonProps}
        onClick={async (event) => {
          if (schema) {
            const result = onValidateOpportunity({ schema });

            if (result.error) {
              await showPrompt({
                title: labels.opportunity.requiredMissingNotice.title,
                description: (
                  <div className="flex flex-col gap-4">
                    <span>
                      {labels.opportunity.requiredMissingNotice.description}
                    </span>
                    <ul className="text-text-tertiary">
                      {result.error.issues.map((issue) => {
                        const path = issue.path.join('.');

                        return <li key={path}>• {path}</li>;
                      })}
                    </ul>
                  </div>
                ),
                okButton: {
                  className: '!w-full',
                  title: labels.opportunity.requiredMissingNotice.okButton,
                },
                cancelButton: null,
              });

              return;
            }
          }

          ctaButtonProps?.onClick?.(event);
        }}
      >
        {ctaText}
      </Button>
    </div>
  );
};

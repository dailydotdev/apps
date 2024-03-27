import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { ChecklistCardComponent } from '../cards/Card';
import { ChecklistStep } from './ChecklistStep';
import { ChecklistCardProps } from '../../lib/checklist';
import { useChecklist } from '../../hooks/useChecklist';
import { RankConfetti } from '../../svg/RankConfetti';

const ChecklistCard = ({
  className,
  title,
  description,
  steps,
}: ChecklistCardProps): ReactElement => {
  const { isDone, openStep, onToggleStep, activeStep } = useChecklist({
    steps,
  });

  return (
    <ChecklistCardComponent className={className}>
      <div className="relative overflow-hidden rounded-t-12 bg-gradient-to-t from-raw-cabbage-90 to-raw-cabbage-50 p-4">
        {isDone && (
          <RankConfetti className="absolute bottom-0 left-0 right-0 top-0 opacity-40" />
        )}
        <p className="mb-1 font-bold text-white typo-body">{title}</p>
        <p className="text-white typo-callout">{description}</p>
        <div className="mt-6 flex gap-2">
          {steps.map((step) => {
            return (
              <div
                key={step.action.type}
                className={classNames(
                  'h-3 w-12 rounded-6 bg-white',
                  !step.action.completedAt && 'opacity-24',
                )}
                data-testid={
                  step.action.completedAt
                    ? 'checklist-card-progress'
                    : undefined
                }
              />
            );
          })}
        </div>
      </div>
      <div className="flex flex-col gap-2 p-4">
        {steps.map((step) => {
          const StepComponent = step.component || ChecklistStep;

          return (
            <StepComponent
              key={step.action.type}
              step={step}
              isOpen={openStep === step.action.type}
              isActive={activeStep === step.action.type}
              onToggle={onToggleStep}
              className={{
                checkmark: isDone && 'text-brand-default',
              }}
            />
          );
        })}
      </div>
    </ChecklistCardComponent>
  );
};

export { ChecklistCard };

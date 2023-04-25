import React, { ReactElement, useState } from 'react';
import classNames from 'classnames';
import { Card } from './cards/Card';
import MiniCloseIcon from './icons/MiniClose';
import { IconSize } from './Icon';
import { ChecklistStep } from './ChecklistStep';
import { ChecklistAction, ChecklistCardProps } from '../lib/checklist';

const ChecklistCard = ({
  className,
  steps,
}: ChecklistCardProps): ReactElement => {
  const [activeStep, setActiveStep] = useState<string>(undefined);

  const onToggleStep = (action: ChecklistAction) => {
    setActiveStep((currentActiveStep) => {
      if (currentActiveStep === action.id) {
        return undefined;
      }

      return action.id;
    });
  };

  return (
    <div className={className}>
      <Card className="rounded-14 border-cabbage-40 hover:!border-cabbage-40 w-[340px] h-[458px]">
        <div className="p-4 -m-2 rounded-t-14 bg-theme-bg-cabbage-opacity-24">
          <p className="mb-1 font-bold typo-body text-theme-label-primary">
            Test
          </p>
          <p className="text-salt-90 typo-callout">Description</p>
          <MiniCloseIcon
            className="absolute top-4 right-4 text-salt-90"
            size={IconSize.Small}
          />
          <div className="flex gap-2 mt-6">
            {steps.map((step) => {
              return (
                <div
                  key={step.action.id}
                  className={classNames(
                    'w-12 h-2 bg-white rounded-6',
                    !step.action.dateCompleted && 'opacity-24',
                  )}
                />
              );
            })}
          </div>
        </div>
        <div className="flex flex-col gap-4 p-4 mt-2">
          {steps.map((step) => {
            const StepComponent = step.component || ChecklistStep;

            return (
              <StepComponent
                key={step.action.id}
                step={step}
                checked={activeStep === step.action.id}
                onToggle={onToggleStep}
              />
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export { ChecklistCard };

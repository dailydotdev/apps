import React, { ReactElement, useMemo, useState } from 'react';
import classNames from 'classnames';
import { Card } from '../cards/Card';
import MiniCloseIcon from '../icons/MiniClose';
import { IconSize } from '../Icon';
import { ChecklistStep } from './ChecklistStep';
import { ChecklistAction, ChecklistCardProps } from '../../lib/checklist';

const ChecklistCard = ({
  className,
  title,
  description,
  steps,
  onRequestClose,
}: ChecklistCardProps): ReactElement => {
  const activeStep = useMemo(
    () => steps.find((item) => !item.action.dateCompleted)?.action.type,
    [steps],
  );
  const [checkedStep, setCheckedStep] = useState<string>(activeStep);
  const isDone = useMemo(
    () => steps.every((item) => !!item.action.dateCompleted),
    [steps],
  );

  const onToggleStep = (action: ChecklistAction) => {
    setCheckedStep((currentCheckedStep) => {
      if (currentCheckedStep === action.type) {
        return undefined;
      }

      return action.type;
    });
  };

  return (
    <div className={className}>
      <Card className="p-0 rounded-14 border-cabbage-40 hover:!border-cabbage-40 w-[340px] h-[458px]">
        <div className="p-4 rounded-t-14 bg-theme-bg-cabbage-opacity-24">
          <p className="mb-1 font-bold typo-body text-theme-label-primary">
            {title}
          </p>
          <p className="text-salt-90 typo-callout">{description}</p>
          {typeof onRequestClose === 'function' && (
            <button
              className="absolute top-4 right-4 text-salt-90"
              type="button"
              onClick={onRequestClose}
            >
              <MiniCloseIcon size={IconSize.Small} />
            </button>
          )}
          <div className="flex gap-2 mt-6">
            {steps.map((step) => {
              return (
                <div
                  key={step.action.type}
                  className={classNames(
                    'w-12 h-2 bg-white rounded-6',
                    !step.action.dateCompleted && 'opacity-24',
                  )}
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
                checked={checkedStep === step.action.type}
                active={activeStep === step.action.type}
                onToggle={onToggleStep}
                className={{
                  checkmark: isDone && 'text-cabbage-40',
                }}
              />
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export { ChecklistCard };

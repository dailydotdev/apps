import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { Card } from '../cards/Card';
import { ChecklistStep } from './ChecklistStep';
import { ChecklistCardProps } from '../../lib/checklist';
import { useChecklist } from '../../hooks/useChecklist';
import { ButtonSize } from '../buttons/Button';
import CloseButton from '../CloseButton';
import { RankConfetti } from '../../svg/RankConfetti';

const ChecklistCard = ({
  className,
  title,
  description,
  steps,
  onRequestClose,
}: ChecklistCardProps): ReactElement => {
  const { isDone, openStep, onToggleStep, activeStep } = useChecklist({
    steps,
  });

  return (
    <div className={className}>
      <Card className="rounded-14 !p-0 !border-theme-color-cabbage hover:!border-theme-color-cabbage w-[340px]">
        <div className="overflow-hidden relative p-4 bg-gradient-to-t from-cabbage-90 to-cabbage-50 rounded-t-12">
          {isDone && (
            <RankConfetti className="absolute top-0 right-0 bottom-0 left-0 opacity-40" />
          )}
          <p className="mb-1 font-bold text-white typo-body">{title}</p>
          <p className="text-white typo-callout">{description}</p>
          {typeof onRequestClose === 'function' && (
            <CloseButton
              buttonSize={ButtonSize.Small}
              className="top-3 right-3 text-white border-white !absolute btn-secondary"
              onClick={onRequestClose}
            />
          )}
          <div className="flex gap-2 mt-6">
            {steps.map((step) => {
              return (
                <div
                  key={step.action.type}
                  className={classNames(
                    'w-12 h-3 bg-white rounded-6',
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
                  checkmark: isDone && 'text-theme-color-cabbage',
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

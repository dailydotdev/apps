import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { ChecklistCardComponent } from '../cards/Card';
import { ChecklistStep } from './ChecklistStep';
import {
  ChecklistCardProps,
  ChecklistCardVariant,
  ChecklistVariantClassNameMap,
} from '../../lib/checklist';
import { useChecklist } from '../../hooks/useChecklist';
import { RankConfetti } from '../../svg/RankConfetti';

const headerClassNameMap: ChecklistVariantClassNameMap = {
  [ChecklistCardVariant.Default]: 'p-4 rounded-t-12',
  [ChecklistCardVariant.Small]: 'p-2 rounded-t-8',
};

const headerClassNameClosedMap: ChecklistVariantClassNameMap = {
  [ChecklistCardVariant.Default]: 'p-4 rounded-12',
  [ChecklistCardVariant.Small]: 'p-2 rounded-8',
};

const titleSizeToClassNameMap: ChecklistVariantClassNameMap = {
  [ChecklistCardVariant.Default]: 'typo-body',
  [ChecklistCardVariant.Small]: 'typo-footnote',
};

const descriptionSizeToClassNameMap: ChecklistVariantClassNameMap = {
  [ChecklistCardVariant.Default]: 'typo-callout',
  [ChecklistCardVariant.Small]: 'typo-caption1',
};

const stepsContainerClassNameMap: ChecklistVariantClassNameMap = {
  [ChecklistCardVariant.Default]: 'p-4',
  [ChecklistCardVariant.Small]: 'p-2',
};

const ChecklistCard = ({
  className,
  title,
  description,
  steps,
  variant = ChecklistCardVariant.Default,
  isOpen = true,
}: ChecklistCardProps): ReactElement => {
  const { isDone, openStep, onToggleStep, activeStep } = useChecklist({
    steps,
  });

  return (
    <ChecklistCardComponent className={className}>
      <div
        className={classNames(
          'relative overflow-hidden bg-gradient-to-t from-raw-cabbage-90 to-raw-cabbage-50',
          isOpen
            ? headerClassNameMap[variant]
            : headerClassNameClosedMap[variant],
        )}
      >
        {isDone && (
          <RankConfetti className="absolute bottom-0 left-0 right-0 top-0 opacity-40" />
        )}
        <p
          className={classNames(
            'mb-1 font-bold text-white',
            titleSizeToClassNameMap[variant],
          )}
        >
          {title}
        </p>
        <p
          className={classNames(
            'text-white',
            descriptionSizeToClassNameMap[variant],
          )}
        >
          {description}
        </p>
        {variant !== ChecklistCardVariant.Small && (
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
        )}
      </div>
      {isOpen && (
        <div
          className={classNames(
            'flex flex-col gap-2',
            stepsContainerClassNameMap[variant],
          )}
        >
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
                variant={variant}
              />
            );
          })}
        </div>
      )}
    </ChecklistCardComponent>
  );
};

export { ChecklistCard };

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
import { ChecklistConfetti } from './ChecklistConfetti';

const containerClassNameMap: ChecklistVariantClassNameMap = {
  [ChecklistCardVariant.Default]: 'rounded-14',
  [ChecklistCardVariant.Small]: 'rounded-10',
};

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

const stepsContainerClassNameMap: ChecklistVariantClassNameMap = {
  [ChecklistCardVariant.Default]: 'p-4',
  [ChecklistCardVariant.Small]: 'p-2',
};

const progressClassNameMap: ChecklistVariantClassNameMap = {
  [ChecklistCardVariant.Default]: 'mt-6 gap-2',
  [ChecklistCardVariant.Small]: 'absolute left-0 right-0 top-0 z-3',
};

const progressItemClassNameMap: ChecklistVariantClassNameMap = {
  [ChecklistCardVariant.Default]: 'h-3 rounded-6 bg-white',
  [ChecklistCardVariant.Small]: 'h-0.5 bg-white',
};

const ChecklistCard = ({
  className,
  title,
  content,
  steps,
  variant = ChecklistCardVariant.Default,
  isOpen = true,
  showProgressBar = true,
}: ChecklistCardProps): ReactElement => {
  const { isDone, openStep, onToggleStep, activeStep } = useChecklist({
    steps,
  });

  return (
    <ChecklistCardComponent
      className={classNames(className, containerClassNameMap[variant])}
    >
      <div
        className={classNames(
          'relative overflow-hidden bg-gradient-to-t from-raw-cabbage-90 to-raw-cabbage-50',
          isOpen
            ? headerClassNameMap[variant]
            : headerClassNameClosedMap[variant],
        )}
      >
        {isDone && <ChecklistConfetti variant="checklist" />}
        <p
          className={classNames(
            'relative mb-1 font-bold text-white',
            titleSizeToClassNameMap[variant],
          )}
        >
          {title}
        </p>
        <div className="relative">{content}</div>
        {showProgressBar && (
          <div className={classNames('flex', progressClassNameMap[variant])}>
            {steps.map((step) => {
              return (
                <div
                  key={step.action.type}
                  className={classNames(
                    'flex-1',
                    !step.action.completedAt && 'opacity-24',
                    progressItemClassNameMap[variant],
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

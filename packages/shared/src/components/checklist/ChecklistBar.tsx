import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { ChecklistBarProps } from '../../lib/checklist';
import { useChecklist } from '../../hooks/useChecklist';
import { RankConfetti } from '../../svg/RankConfetti';

export const ChecklistBar = ({
  className,
  title,
  steps,
}: ChecklistBarProps): ReactElement => {
  const { isDone, completedSteps, nextStep } = useChecklist({
    steps,
  });

  return (
    <div className={classNames(className, 'w-full')}>
      <div
        className={classNames(
          'relative flex flex-wrap gap-2 overflow-hidden bg-gradient-to-l from-raw-cabbage-90 to-raw-cabbage-50 px-2 pb-3.5 pt-3 tablet:gap-3 tablet:px-5',
        )}
      >
        <div className="absolute bottom-0 left-0 right-0 flex">
          {steps.map((step) => {
            return (
              <div
                key={step.action.type}
                className={classNames(
                  'h-0.5 flex-1 bg-white',
                  !step.action.completedAt && 'opacity-24',
                )}
                data-testid={
                  step.action.completedAt ? 'checklist-bar-progress' : undefined
                }
              />
            );
          })}
        </div>
        {isDone && (
          <RankConfetti className="absolute bottom-0 left-0 right-0 top-0 opacity-40" />
        )}
        <p className={classNames('font-bold text-white typo-footnote')}>
          {title}
        </p>
        <p className="text-white typo-caption1">
          {`${completedSteps.length}/${steps.length}${
            nextStep ? ` 👉 ${nextStep?.title}` : ''
          }`}
        </p>
      </div>
    </div>
  );
};

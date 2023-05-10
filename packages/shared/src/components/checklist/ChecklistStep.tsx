import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { IconSize } from '../Icon';
import ArrowIcon from '../icons/Arrow';
import { ChecklistStepProps } from '../../lib/checklist';
import ChecklistAIcon from '../icons/ChecklistA';

const ChecklistStep = ({
  className = {},
  step,
  isOpen = false,
  isActive = false,
  onToggle,
  children,
}: ChecklistStepProps): ReactElement => {
  const isCompleted = !!step.action.completedAt;

  return (
    <div className={className.container}>
      <button
        type="button"
        className="flex justify-between items-center w-full"
        data-testid="checklist-step"
        onClick={(event) => {
          event.preventDefault();

          onToggle(step.action);
        }}
      >
        <div className="flex flex-1 gap-1 items-center flex-start">
          <div
            className={classNames(
              'w-10 h-10 flex justify-center items-center -ml-2 text-theme-label-tertiary',
              isCompleted && 'text-theme-label-quaternary',
            )}
            id={step.action.type}
          >
            <div
              className={classNames(
                isActive && 'p-1 rounded-full bg-theme-bg-cabbage-opacity-24',
              )}
              data-testid={`checklist-step-${isActive ? 'active' : 'inactive'}`}
            >
              <ChecklistAIcon
                className={classNames(
                  isActive && 'text-theme-color-cabbage',
                  className.checkmark,
                )}
                data-testid={`checklist-step-${
                  isCompleted ? 'completed' : 'incomplete'
                }`}
                size={IconSize.Small}
                secondary={!isCompleted}
              />
            </div>
          </div>
          <p
            className={classNames(
              'typo-callout flex-1 text-left',
              isActive ? 'font-bold text-theme-label-primary' : 'font-normal',
              isCompleted
                ? 'text-theme-label-quaternary'
                : 'text-theme-label-tertiary',
              className.title,
            )}
          >
            {step.title}
          </p>
        </div>
        <ArrowIcon
          className={classNames(
            isActive ? 'text-theme-label-primary' : 'text-theme-label-tertiary',
            !isOpen && 'rotate-180',
            isCompleted && 'opacity-32',
          )}
          data-testid={`checklist-step-${isOpen ? 'open' : 'closed'}`}
          size={IconSize.Small}
        />
      </button>
      {isOpen && (
        <div className="my-2 ml-9">
          <p
            className={classNames(
              'text-theme-label-tertiary typo-callout',
              className.description,
            )}
          >
            {step.description}
          </p>
          {!!children && <div className="mt-4">{children}</div>}
        </div>
      )}
    </div>
  );
};

export { ChecklistStep };

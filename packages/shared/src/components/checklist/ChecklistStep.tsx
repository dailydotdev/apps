import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { IconSize } from '../Icon';
import { ArrowIcon, ChecklistAIcon } from '../icons';
import { ChecklistStepProps } from '../../lib/checklist';

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
        className="flex w-full items-center justify-between"
        data-testid="checklist-step"
        onClick={(event) => {
          event.preventDefault();

          onToggle(step.action);
        }}
      >
        <div className="flex-start flex flex-1 items-center gap-1">
          <div
            className={classNames(
              '-ml-2 flex h-10 w-10 items-center justify-center text-theme-label-tertiary',
              isCompleted && 'text-theme-label-quaternary',
            )}
            id={step.action.type}
          >
            <div
              className={classNames(
                isActive && 'rounded-full bg-brand-active p-1',
              )}
              data-testid={`checklist-step-${isActive ? 'active' : 'inactive'}`}
            >
              <ChecklistAIcon
                className={classNames(
                  isActive && 'text-brand-default',
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
              'flex-1 text-left typo-callout',
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

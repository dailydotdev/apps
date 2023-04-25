import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { IconSize } from './Icon';
import { Checkbox } from './fields/Checkbox';
import ArrowIcon from './icons/Arrow';
import { ChecklistStepProps } from '../lib/checklist';

const ChecklistStep = ({
  className,
  step,
  checked = false,
  onToggle,
}: ChecklistStepProps): ReactElement => {
  const isStepCompleted = !!step.action.dateCompleted;
  const isStepOpen = !isStepCompleted && checked;

  return (
    <div className={className}>
      <button
        type="button"
        disabled={isStepCompleted}
        className="flex justify-between items-center w-full"
        onClick={(event) => {
          event.preventDefault();

          onToggle(step.action);
        }}
      >
        <div className="flex items-center flex-start">
          <Checkbox
            checked={isStepCompleted}
            className="text-theme-label-primary"
            disabled={isStepCompleted}
            name={`checklist-action-${step.action}`}
          >
            <p
              className={classNames(
                'typo-callout',
                isStepOpen ? 'font-bold' : 'font-normal',
              )}
            >
              {step.title}
            </p>
          </Checkbox>
        </div>
        <ArrowIcon
          className={classNames(
            !isStepOpen && 'rotate-180 text-salt-90',
            isStepCompleted && 'opacity-32',
          )}
          size={IconSize.Small}
        />
      </button>
      {isStepOpen && (
        <div className="mt-2 ml-9">
          <p className="text-salt-90 typo-callout">{step.description}</p>
        </div>
      )}
    </div>
  );
};

export { ChecklistStep };

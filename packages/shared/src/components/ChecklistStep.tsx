import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { IconSize } from './Icon';
import ArrowIcon from './icons/Arrow';
import { ChecklistStepProps } from '../lib/checklist';
import { QuaternaryButton } from './buttons/QuaternaryButton';
import ChecklistAIcon from './icons/ChecklistA';

const ChecklistStep = ({
  className,
  step,
  checked = false,
  active = false,
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
          <QuaternaryButton
            className={classNames(
              '-ml-2 text-salt-90',
              isStepCompleted && 'text-pepper-10',
            )}
            id={step.action.type}
            disabled={isStepCompleted}
            icon={
              <ChecklistAIcon
                className={classNames(active && 'text-cabbage-40')}
                size={IconSize.Small}
                secondary={!isStepCompleted}
              />
            }
          >
            <p
              className={classNames(
                'typo-callout',
                active ? 'font-bold text-theme-label-primary' : 'font-normal',
                isStepCompleted && 'text-pepper-10',
              )}
            >
              {step.title}
            </p>
          </QuaternaryButton>
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
        <div className="my-2 ml-9">
          <p className="text-salt-90 typo-callout">{step.description}</p>
        </div>
      )}
    </div>
  );
};

export { ChecklistStep };

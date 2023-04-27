import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { IconSize } from '../Icon';
import ArrowIcon from '../icons/Arrow';
import { ChecklistStepProps } from '../../lib/checklist';
import { QuaternaryButton } from '../buttons/QuaternaryButton';
import ChecklistAIcon from '../icons/ChecklistA';

const ChecklistStep = ({
  className = {},
  step,
  checked = false,
  active = false,
  onToggle,
}: ChecklistStepProps): ReactElement => {
  const isCompleted = !!step.action.dateCompleted;
  const isOpen = !isCompleted && checked;

  return (
    <div className={className.root}>
      <button
        type="button"
        disabled={isCompleted}
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
              isCompleted && 'text-pepper-10',
            )}
            id={step.action.type}
            disabled={isCompleted}
            icon={
              <div
                className={classNames(
                  active && 'p-1 rounded-full bg-theme-bg-cabbage-opacity-24',
                )}
              >
                <ChecklistAIcon
                  className={classNames(
                    active && 'text-cabbage-40',
                    className.checkmark,
                  )}
                  size={IconSize.Small}
                  secondary={!isCompleted}
                />
              </div>
            }
          >
            <p
              className={classNames(
                'typo-callout',
                active ? 'font-bold text-theme-label-primary' : 'font-normal',
                isCompleted && 'text-pepper-10',
                className.title,
              )}
            >
              {step.title}
            </p>
          </QuaternaryButton>
        </div>
        <ArrowIcon
          className={classNames(
            !isOpen && 'rotate-180 text-salt-90',
            isCompleted && 'opacity-32',
          )}
          size={IconSize.Small}
        />
      </button>
      {isOpen && (
        <div className="my-2 ml-9">
          <p
            className={classNames(
              'text-salt-90 typo-callout',
              className.description,
            )}
          >
            {step.description}
          </p>
        </div>
      )}
    </div>
  );
};

export { ChecklistStep };

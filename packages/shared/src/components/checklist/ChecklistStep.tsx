import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { IconSize } from '../Icon';
import { ArrowIcon, ChecklistAIcon } from '../icons';
import {
  ChecklistCardVariant,
  ChecklistStepProps,
  ChecklistVariantClassNameMap,
} from '../../lib/checklist';

const iconToClassNameMap: ChecklistVariantClassNameMap = {
  [ChecklistCardVariant.Default]: 'w-10 h-10',
  [ChecklistCardVariant.Small]: 'w-10 h-6',
};

const arrowSizeMap: ChecklistVariantClassNameMap<IconSize> = {
  [ChecklistCardVariant.Default]: IconSize.Small,
  [ChecklistCardVariant.Small]: IconSize.XSmall,
};

const titleSizeToClassNameMap: ChecklistVariantClassNameMap = {
  [ChecklistCardVariant.Default]: 'typo-callout',
  [ChecklistCardVariant.Small]: 'typo-footnote',
};

const descriptionSizeToClassNameMap: ChecklistVariantClassNameMap = {
  [ChecklistCardVariant.Default]: 'typo-callout',
  [ChecklistCardVariant.Small]: 'typo-footnote',
};

const ChecklistStep = ({
  className = {},
  step,
  isOpen = false,
  isActive = false,
  onToggle,
  children,
  variant,
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
              '-ml-2 flex items-center justify-center text-text-tertiary',
              iconToClassNameMap[variant],
              isCompleted && 'text-text-quaternary',
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
              'flex-1 text-left',
              isActive ? 'font-bold text-text-primary' : 'font-normal',
              isCompleted ? 'text-text-quaternary' : 'text-text-tertiary',
              titleSizeToClassNameMap[variant],
              className.title,
            )}
          >
            {step.title}
          </p>
        </div>
        <ArrowIcon
          className={classNames(
            isActive ? 'text-text-primary' : 'text-text-tertiary',
            !isOpen && 'rotate-180',
            isCompleted && 'opacity-32',
          )}
          data-testid={`checklist-step-${isOpen ? 'open' : 'closed'}`}
          size={arrowSizeMap[variant]}
        />
      </button>
      {isOpen && (
        <div className="my-2 ml-9">
          <p
            className={classNames(
              'text-text-tertiary',
              descriptionSizeToClassNameMap[variant],
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

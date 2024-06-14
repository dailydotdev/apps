import React, { ReactElement, useContext, useEffect, useRef } from 'react';
import classNames from 'classnames';
import { ChecklistCard } from './ChecklistCard';
import LogContext from '../../contexts/LogContext';
import { LogEvent, TargetId, TargetType } from '../../lib/log';
import { useOnboardingChecklist } from '../../hooks';
import {
  ChecklistCardProps,
  ChecklistCardVariant,
  ChecklistVariantClassNameMap,
} from '../../lib/checklist';

export type OnboardingChecklistCardProps = Pick<
  ChecklistCardProps,
  'className' | 'isOpen' | 'variant'
>;

const descriptionSizeToClassNameMap: ChecklistVariantClassNameMap = {
  [ChecklistCardVariant.Default]: 'typo-callout',
  [ChecklistCardVariant.Small]: 'typo-caption1',
};

export const OnboardingChecklistCard = ({
  className,
  isOpen = true,
  variant = ChecklistCardVariant.Default,
}: OnboardingChecklistCardProps): ReactElement => {
  const { logEvent } = useContext(LogContext);
  const { steps, completedSteps, nextStep } = useOnboardingChecklist();
  const trackedRef = useRef(false);

  useEffect(() => {
    if (trackedRef.current === isOpen) {
      return;
    }

    trackedRef.current = isOpen;

    if (!isOpen) {
      return;
    }

    logEvent({
      event_name: LogEvent.Impression,
      target_type: TargetType.OnboardingChecklist,
      target_id: TargetId.General,
    });
  }, [isOpen, logEvent]);

  if (!steps.length) {
    return null;
  }

  return (
    <ChecklistCard
      className={classNames(className, 'max-w-full', !isOpen && '!border-0')}
      title="Get started like a pro"
      content={
        <p
          className={classNames(
            'text-white',
            descriptionSizeToClassNameMap[variant],
          )}
        >
          {`${completedSteps.length}/${steps.length}${
            nextStep ? ` 👉 ${nextStep?.title}` : ''
          }`}
        </p>
      }
      steps={steps}
      variant={variant}
      isOpen={isOpen}
    />
  );
};

export default OnboardingChecklistCard;

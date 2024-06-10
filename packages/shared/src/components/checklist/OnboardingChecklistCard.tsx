import React, { ReactElement, useContext, useEffect } from 'react';
import classNames from 'classnames';
import { ChecklistCard } from './ChecklistCard';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { AnalyticsEvent, TargetType } from '../../lib/analytics';
import { useOnboardingChecklist } from '../../hooks';
import { ChecklistCardVariant } from '../../lib/checklist';

export type OnboardingChecklistCardProps = {
  className?: string;
  isOpen: boolean;
};

export const OnboardingChecklistCard = ({
  className,
  isOpen,
}: OnboardingChecklistCardProps): ReactElement => {
  const { trackEvent } = useContext(AnalyticsContext);
  const { steps, completedSteps, nextStep } = useOnboardingChecklist();

  useEffect(() => {
    trackEvent({
      event_name: AnalyticsEvent.Impression,
      target_type: TargetType.OnboardingChecklist,
      extra: JSON.stringify({
        // TODO AS-356 send proper extra
      }),
    });
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!steps.length) {
    return null;
  }

  return (
    <ChecklistCard
      className={classNames(className, 'max-w-full', !isOpen && '!border-0')}
      title="Get started like a pro"
      description={`${completedSteps.length}/${steps.length} 👉 ${nextStep?.title}`}
      steps={steps}
      variant={ChecklistCardVariant.Small}
      isOpen={isOpen}
    />
  );
};

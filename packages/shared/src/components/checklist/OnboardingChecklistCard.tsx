import React, { ReactElement, useContext, useEffect } from 'react';
import classNames from 'classnames';
import { ChecklistCard } from './ChecklistCard';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { AnalyticsEvent, TargetId, TargetType } from '../../lib/analytics';
import { useOnboardingChecklist } from '../../hooks';
import { ChecklistCardProps, ChecklistCardVariant } from '../../lib/checklist';
import { feature } from '../../lib/featureManagement';
import { withExperiment } from '../withExperiment';

export type OnboardingChecklistCardProps = Pick<
  ChecklistCardProps,
  'className' | 'isOpen' | 'variant'
>;

export const OnboardingChecklistCardComponent = ({
  className,
  isOpen = true,
  variant = ChecklistCardVariant.Default,
}: OnboardingChecklistCardProps): ReactElement => {
  const { trackEvent } = useContext(AnalyticsContext);
  const { steps, completedSteps, nextStep } = useOnboardingChecklist();

  useEffect(() => {
    trackEvent({
      event_name: AnalyticsEvent.Impression,
      target_type: TargetType.OnboardingChecklist,
      target_id: TargetId.General,
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
      description={`${completedSteps.length}/${steps.length}${
        nextStep ? ` 👉 ${nextStep?.title}` : ''
      }`}
      steps={steps}
      variant={variant}
      isOpen={isOpen}
    />
  );
};

export const OnboardingChecklistCard = withExperiment(
  OnboardingChecklistCardComponent,
  {
    feature: feature.onboardingChecklist,
    value: true,
  },
);

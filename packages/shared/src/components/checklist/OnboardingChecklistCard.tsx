import React, { ReactElement, useContext, useEffect, useMemo } from 'react';
import classNames from 'classnames';
import { ChecklistCard } from './ChecklistCard';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { AnalyticsEvent, TargetType } from '../../lib/analytics';
import { ActionType } from '../../graphql/actions';
import { useActions } from '../../hooks';
import { ChecklistCardVariant, createChecklistStep } from '../../lib/checklist';
import { useAuthContext } from '../../contexts/AuthContext';
import { useChecklist } from '../../hooks/useChecklist';

export type OnboardingChecklistCardProps = {
  className?: string;
  isOpen: boolean;
};

export const OnboardingChecklistCard = ({
  className,
  isOpen,
}: OnboardingChecklistCardProps): ReactElement => {
  const { isLoggedIn } = useAuthContext();
  const { trackEvent } = useContext(AnalyticsContext);
  const { actions, isActionsFetched } = useActions();
  const checklistSteps = useMemo(() => {
    return [
      createChecklistStep({
        type: ActionType.CreateSquad,
        step: {
          title: 'Create a Squad',
          description:
            'Create your first Squad and start sharing posts with other members.',
        },
        actions,
      }),
      createChecklistStep({
        type: ActionType.JoinSquad,
        step: {
          title: 'Join a Squad',
          description:
            'Join your first Squad and start sharing posts with other members.',
        },
        actions,
      }),
    ];
  }, [actions]);

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

  const { steps, completedSteps } = useChecklist({ steps: checklistSteps });

  if (!isLoggedIn || !isActionsFetched || !steps.length) {
    return null;
  }

  const firstStep = steps[0];

  return (
    <ChecklistCard
      className={classNames(className, 'max-w-full', !isOpen && '!border-0')}
      title="Get started like a pro"
      description={`${completedSteps.length}/${steps.length} 👉 ${firstStep?.title}`}
      steps={steps}
      variant={ChecklistCardVariant.Small}
      isOpen={isOpen}
    />
  );
};

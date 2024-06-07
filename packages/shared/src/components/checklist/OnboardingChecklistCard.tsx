import React, { ReactElement, useContext, useEffect, useMemo } from 'react';
import classNames from 'classnames';
import { ChecklistCard } from './ChecklistCard';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { AnalyticsEvent, TargetType } from '../../lib/analytics';
import { ActionType } from '../../graphql/actions';
import { useActions } from '../../hooks';
import { ChecklistCardVariant, createChecklistStep } from '../../lib/checklist';
import { useAuthContext } from '../../contexts/AuthContext';

export type OnboardingChecklistCardProps = {
  className?: string;
};

export const OnboardingChecklistCard = ({
  className,
}: OnboardingChecklistCardProps): ReactElement => {
  const { isLoggedIn } = useAuthContext();
  const { trackEvent } = useContext(AnalyticsContext);
  const { actions, isActionsFetched } = useActions();
  const steps = useMemo(() => {
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

  if (!isLoggedIn || !isActionsFetched) {
    return null;
  }

  return (
    <ChecklistCard
      className={classNames(className, 'max-w-full border-0')}
      title="Get started like a pro"
      description={`${5} simple steps to daily.dev!`}
      steps={steps}
      variant={ChecklistCardVariant.Small}
    />
  );
};

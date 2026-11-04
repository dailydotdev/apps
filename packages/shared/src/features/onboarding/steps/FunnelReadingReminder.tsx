import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { FunnelStepReadingReminder } from '../types/funnel';
import { FunnelStepTransitionType } from '../types/funnel';
import { ReadingReminder } from '../../../components/onboarding';
import { useReadingReminder } from '../../../components/onboarding/useReadingReminder';
import { FeedPatchy } from '../../../components/onboarding/FeedPatchy/FeedPatchy';
import { ReminderPushOnly } from '../../../components/onboarding/ReminderPushOnly/ReminderPushOnly';
import { withIsActiveGuard } from '../shared/withActiveGuard';
import { useViewSize, ViewSize } from '../../../hooks';
import { usePushNotificationContext } from '../../../contexts/PushNotificationContext';
import { withShouldSkipStepGuard } from '../shared/withShouldSkipStepGuard';
import { FunnelStepCtaWrapper, funnelStepRail } from '../shared';
import { useIsOnboardingFunnel } from '../shared/FunnelStepDots';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import {
  featureOnboardingCommitment,
  featureOnboardingReminderPushOnly,
} from '../../../lib/featureManagement';

function ReadingReminderStep({
  parameters: { headline },
  onTransition,
}: FunnelStepReadingReminder): ReactElement {
  const isOnboarding = useIsOnboardingFunnel();
  const state = useReadingReminder({
    onClickNext: () =>
      onTransition({ type: FunnelStepTransitionType.Complete }),
  });

  if (!isOnboarding) {
    return (
      <div className="flex w-full flex-1 flex-col items-center justify-center overflow-hidden p-6 pt-10 tablet:max-w-96">
        <ReadingReminder headline={headline} state={state} />
      </div>
    );
  }

  return (
    <FunnelStepCtaWrapper
      isGlass
      cta={{ label: 'Submit' }}
      loading={state.loading}
      onClick={state.onSubmit}
      skip={{ cta: `I'll do it later`, onClick: state.onSkip }}
      containerClassName="flex w-full flex-1 flex-col items-center overflow-hidden"
    >
      <div
        className={classNames(
          funnelStepRail,
          'flex flex-col items-center gap-6 py-6 pt-3',
        )}
      >
        <ReadingReminder headline={headline} state={state} isOnboarding />
      </div>
    </FunnelStepCtaWrapper>
  );
}

// Only decides what the step shows. Whether it shows at all stays the
// guard's call below, so the flag is evaluated only for people who reach it.
function FunnelReadingReminderComponent(
  props: FunnelStepReadingReminder,
): ReactElement | null {
  const { onTransition } = props;
  const isOnboarding = useIsOnboardingFunnel();
  const onComplete = () =>
    onTransition({ type: FunnelStepTransitionType.Complete });
  const { value: isPushOnly, isLoading: isPushOnlyLoading } =
    useConditionalFeature({
      feature: featureOnboardingReminderPushOnly,
      shouldEvaluate: isOnboarding,
    });
  // Only readers outside the push-only ask are bucketed into Feed Patchy, so
  // neither experiment counts the other's readers.
  const { value: isCommitment, isLoading } = useConditionalFeature({
    feature: featureOnboardingCommitment,
    shouldEvaluate: isOnboarding && !isPushOnlyLoading && !isPushOnly,
  });

  if (!isOnboarding) {
    return <ReadingReminderStep {...props} />;
  }

  // Held until the flags settle, so only one arm's impression is logged.
  if (isPushOnlyLoading) {
    return null;
  }

  if (isPushOnly) {
    return <ReminderPushOnly onComplete={onComplete} />;
  }

  if (isLoading) {
    return null;
  }

  if (isCommitment) {
    return (
      <FeedPatchy
        onComplete={() =>
          onTransition({ type: FunnelStepTransitionType.Complete })
        }
      />
    );
  }

  return <ReadingReminderStep {...props} />;
}

export const FunnelReadingReminder = withShouldSkipStepGuard(
  withIsActiveGuard(FunnelReadingReminderComponent),
  () => {
    const { isPushSupported, isInitialized } = usePushNotificationContext();
    const isMobile = useViewSize(ViewSize.MobileXL);
    const isOnboarding = useIsOnboardingFunnel();
    const shouldSkip =
      (!isMobile && !isOnboarding) || (isInitialized && !isPushSupported);

    return { shouldSkip };
  },
);

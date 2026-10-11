import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { FunnelStepReadingReminder } from '../types/funnel';
import { FunnelStepTransitionType } from '../types/funnel';
import { ReadingReminder } from '../../../components/onboarding';
import { useReadingReminder } from '../../../components/onboarding/useReadingReminder';
import { FeedPatchy } from '../../../components/onboarding/FeedPatchy/FeedPatchy';
import { withIsActiveGuard } from '../shared/withActiveGuard';
import { useViewSize, ViewSize } from '../../../hooks';
import { usePushNotificationContext } from '../../../contexts/PushNotificationContext';
import { useAuthContext } from '../../../contexts/AuthContext';
import { withShouldSkipStepGuard } from '../shared/withShouldSkipStepGuard';
import { FunnelStepCtaWrapper, funnelStepRail } from '../shared';
import { useIsOnboardingFunnel } from '../shared/FunnelStepDots';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import {
  featureOnboardingCommitment,
  featureOnboardingReminderDesktop,
} from '../../../lib/featureManagement';

// Evaluated once someone is signed in, so visitors who never get past the
// landing step stay out of the experiment.
const useCommitmentVariant = () => {
  const isOnboarding = useIsOnboardingFunnel();
  const { isLoggedIn } = useAuthContext();
  const shouldEvaluate = isOnboarding && isLoggedIn;
  const { value, isLoading } = useConditionalFeature({
    feature: featureOnboardingCommitment,
    shouldEvaluate,
  });

  return {
    isCommitment: shouldEvaluate && !isLoading && value,
    isLoading: shouldEvaluate && isLoading,
  };
};

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

function FunnelReadingReminderComponent(
  props: FunnelStepReadingReminder,
): ReactElement | null {
  const { onTransition } = props;
  const { isCommitment, isLoading } = useCommitmentVariant();

  // Held until the flag settles, so one arm's impression is ever logged.
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
    const { isCommitment } = useCommitmentVariant();
    const { value: showOnDesktop } = useConditionalFeature({
      feature: featureOnboardingReminderDesktop,
      shouldEvaluate: !isMobile && isOnboarding && !isCommitment,
    });

    // The commitment stands on its own, on desktop and without push too:
    // there it skips only the reminder half.
    if (isCommitment) {
      return { shouldSkip: false };
    }

    const shouldSkip =
      (!isMobile && !(isOnboarding && showOnDesktop)) ||
      (isInitialized && !isPushSupported);

    return { shouldSkip };
  },
);

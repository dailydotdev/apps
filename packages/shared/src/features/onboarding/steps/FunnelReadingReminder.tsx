import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { FunnelStepReadingReminder } from '../types/funnel';
import { FunnelStepTransitionType } from '../types/funnel';
import { ReadingReminder } from '../../../components/onboarding';
import { useReadingReminder } from '../../../components/onboarding/useReadingReminder';
import { withIsActiveGuard } from '../shared/withActiveGuard';
import { useViewSize, ViewSize } from '../../../hooks';
import { usePushNotificationContext } from '../../../contexts/PushNotificationContext';
import { withShouldSkipStepGuard } from '../shared/withShouldSkipStepGuard';
import { FunnelStepCtaWrapper, funnelStepRail } from '../shared';
import { useIsOnboardingFunnel } from '../shared/FunnelStepDots';

function FunnelReadingReminderComponent({
  parameters: { headline },
  onTransition,
}: FunnelStepReadingReminder): ReactElement | null {
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

export const FunnelReadingReminder = withShouldSkipStepGuard(
  withIsActiveGuard(FunnelReadingReminderComponent),
  () => {
    const { isPushSupported, isInitialized } = usePushNotificationContext();
    const isMobile = useViewSize(ViewSize.MobileXL);
    const shouldSkip = !isMobile || (isInitialized && !isPushSupported);

    return { shouldSkip };
  },
);

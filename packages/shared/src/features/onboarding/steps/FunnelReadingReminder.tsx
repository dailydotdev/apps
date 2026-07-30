import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { FunnelStepReadingReminder } from '../types/funnel';
import { FunnelStepTransitionType } from '../types/funnel';
import { ReadingReminder } from '../../../components/onboarding';
import { OnboardingReadingReminder } from '../../../components/onboarding/OnboardingReadingReminder';
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
  const onClickNext = () =>
    onTransition({ type: FunnelStepTransitionType.Complete });
  const state = useReadingReminder({ onClickNext });

  // The paid funnel's screen owns its own Submit / "I'll do it later" buttons,
  // so it needs no CTA wrapper — this is main's markup unchanged.
  if (!isOnboarding) {
    return (
      <div className="flex w-full flex-1 flex-col items-center justify-center overflow-hidden p-6 pt-10 tablet:max-w-96">
        <ReadingReminder headline={headline} onClickNext={onClickNext} />
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
        <OnboardingReadingReminder headline={headline} state={state} />
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

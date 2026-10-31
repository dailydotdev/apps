import React from 'react';
import type { ReactElement } from 'react';
import { ReminderPushOnly } from '@dailydotdev/shared/src/components/onboarding/ReminderPushOnly/ReminderPushOnly';
import { FunnelProgressContext } from '@dailydotdev/shared/src/features/onboarding/shared/FunnelStepDots';
import { FunnelStepBackground } from '@dailydotdev/shared/src/features/onboarding/shared/FunnelStepBackground';
import { Header } from '@dailydotdev/shared/src/features/onboarding/shared/Header';
import type { FunnelStep } from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import { FunnelStepType } from '@dailydotdev/shared/src/features/onboarding/types/funnel';

const step = {
  id: 'reading-reminder',
  type: FunnelStepType.ReadingReminder,
  parameters: {},
  transitions: [],
} as unknown as FunnelStep;

const chapters = [{ steps: 7 }];

const Page = (): ReactElement => (
  <section className="flex min-h-dvh flex-col">
    <FunnelStepBackground step={step} isOnboarding>
      <FunnelProgressContext.Provider
        value={{ chapters, position: { chapter: 0, step: 5 }, isOnboarding: true }}
      >
        <div className="mx-auto flex w-full flex-1 flex-col tablet:max-w-md laptopXL:max-w-lg">
          <Header
            chapters={chapters}
            currentChapter={0}
            currentStep={5}
            onBack={() => undefined}
            onSkip={() => undefined}
            showBackButton
            showSkipButton={false}
            showProgressBar
          />
          <ReminderPushOnly onComplete={() => undefined} />
        </div>
      </FunnelProgressContext.Provider>
    </FunnelStepBackground>
  </section>
);

export default Page;

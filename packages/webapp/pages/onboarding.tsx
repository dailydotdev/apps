import { FunnelRegistration } from '@dailydotdev/shared/src/features/onboarding/steps/FunnelRegistration';
import { FunnelStepType } from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import type { ReactElement } from 'react';
import React from 'react';

const OnboardingPage = (): ReactElement => {
  return (
    <FunnelRegistration
      transitions={[]}
      type={FunnelStepType.Signup}
      id="onboarding"
      parameters={{
        headline: 'Plus',
        image: 'https://picsum.photos/200/300',
        imageMobile: 'https://picsum.photos/200/300',
      }}
      onTransition={() => console.log('complete!')}
    />
  );
};

export default OnboardingPage;

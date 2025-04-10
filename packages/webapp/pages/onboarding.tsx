import type { ReactElement } from 'react';
import React from 'react';
import { FunnelRegistration } from '@dailydotdev/shared/src/features/onboarding/steps/FunnelRegistration';

const OnboardingPage = (): ReactElement => {
  return (
    <FunnelRegistration
      heading="Test"
      onTransition={() => console.log('success')}
      image="https://picsum.photos/200/300"
      imageMobile="https://picsum.photos/200/300"
    />
  );
};

export default OnboardingPage;

import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { privacyPolicy, termsOfService } from '../../lib/constants';
import { useFeature } from '../GrowthBookProvider';
import { featureOnboardingPapercuts } from '../../lib/featureManagement';

interface SignupDisclaimerProps {
  className?: string;
}

function SignupDisclaimer({ className }: SignupDisclaimerProps): ReactElement {
  const onboardingPapercuts = useFeature(featureOnboardingPapercuts);

  return (
    <p
      className={classNames(
        'w-full text-center typo-caption1',
        className,
        onboardingPapercuts ? 'text-text-secondary' : 'text-text-quaternary',
      )}
    >
      By signing up I accept the{' '}
      <a
        href={termsOfService}
        target="_blank"
        rel="noopener"
        className="font-bold underline"
      >
        Terms of Service
      </a>{' '}
      and the{' '}
      <a
        href={privacyPolicy}
        target="_blank"
        rel="noopener"
        className="font-bold underline"
      >
        Privacy Policy
      </a>
      .
    </p>
  );
}

export default SignupDisclaimer;

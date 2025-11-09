import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { privacyPolicy, termsOfService } from '../../lib/constants';

interface SignupDisclaimerProps {
  className?: string;
}

function SignupDisclaimer({ className }: SignupDisclaimerProps): ReactElement {
  return (
    <p
      className={classNames(
        'text-text-secondary typo-caption1 w-full text-center',
        className,
      )}
    >
      By continuing, you agree to the{' '}
      <a
        href={termsOfService}
        target="_blank"
        rel="noopener"
        className="underline hover:no-underline"
      >
        Terms of Service
      </a>{' '}
      and{' '}
      <a
        href={privacyPolicy}
        target="_blank"
        rel="noopener"
        className="underline hover:no-underline"
      >
        Privacy Policy
      </a>
      .
    </p>
  );
}

export default SignupDisclaimer;

import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { privacyPolicy, termsOfService } from '../../lib/constants';

interface SignupDisclaimerProps {
  className?: string;
}

function SignupDisclaimer({ className }: SignupDisclaimerProps): ReactElement {
  return (
    <p
      className={classNames(
        'w-full text-center text-text-quaternary typo-caption1',
        className,
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

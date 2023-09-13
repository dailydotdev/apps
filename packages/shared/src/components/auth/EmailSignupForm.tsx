import React, { ReactElement, useState } from 'react';
import classNames from 'classnames';
import { Button, ButtonSize } from '../buttons/Button';
import { TextField } from '../fields/TextField';
import ArrowIcon from '../icons/Arrow';
import MailIcon from '../icons/Mail';
import AuthForm from './AuthForm';
import { privacyPolicy, termsOfService } from '../../lib/constants';
import { IconSize } from '../Icon';

interface SignupDisclaimerProps {
  className?: string;
}
export function SignupDisclaimer({
  className = '',
}: SignupDisclaimerProps): ReactElement {
  return (
    <p
      className={classNames(
        'w-full text-center text-theme-label-quaternary typo-caption1',
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

interface EmailSignupFormProps {
  onSubmit: (e: React.FormEvent) => unknown;
  isReady: boolean;
  showDisclaimer?: boolean;
}

function EmailSignupForm({
  onSubmit,
  isReady,
  showDisclaimer = true,
}: EmailSignupFormProps): ReactElement {
  const [email, setEmail] = useState(null);

  return (
    <AuthForm className="gap-2" onSubmit={onSubmit}>
      <TextField
        leftIcon={<MailIcon size={IconSize.Small} />}
        inputId="email"
        label="Email"
        type="email"
        name="email"
        valueChanged={(value) => setEmail(value)}
        actionButton={
          <Button
            buttonSize={ButtonSize.Small}
            className="btn-primary"
            icon={<ArrowIcon className="rotate-90" />}
            type="submit"
            data-testid="email_signup_submit"
            disabled={!email || !isReady}
          />
        }
      />
      {showDisclaimer && <SignupDisclaimer />}
    </AuthForm>
  );
}

export default EmailSignupForm;

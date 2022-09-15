import React, { ReactElement, useState } from 'react';
import { Button } from '../buttons/Button';
import { TextField } from '../fields/TextField';
import ArrowIcon from '../icons/Arrow';
import MailIcon from '../icons/Mail';
import { AuthForm } from './common';
import { privacyPolicy, termsOfService } from '../../lib/constants';

interface EmailSignupFormProps {
  onSubmit: (e: React.FormEvent) => unknown;
  isV2?: boolean;
}

function EmailSignupForm({
  onSubmit,
  isV2,
}: EmailSignupFormProps): ReactElement {
  const [email, setEmail] = useState(null);

  return (
    <AuthForm className="gap-2" onSubmit={onSubmit} action="#">
      <TextField
        leftIcon={<MailIcon size="medium" />}
        inputId="email"
        label="Email"
        type="email"
        name="email"
        valueChanged={(value) => setEmail(value)}
        actionButton={
          !isV2 && (
            <Button
              buttonSize="small"
              className="btn-primary"
              icon={<ArrowIcon className="rotate-90" />}
              type="submit"
              data-testid="email_signup_submit"
              disabled={!email}
            />
          )
        }
      />
      {isV2 && (
        <Button className="mt-4 bg-theme-color-avocado btn-primary">
          Register
        </Button>
      )}
      <p className="text-center text-theme-label-quaternary typo-caption1">
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
    </AuthForm>
  );
}

export default EmailSignupForm;

import React, { ReactElement, useState } from 'react';
import { Button } from '../buttons/Button';
import { TextField } from '../fields/TextField';
import ArrowIcon from '../icons/Arrow';
import MailIcon from '../icons/Mail';
import AuthForm from './AuthForm';
import { privacyPolicy, termsOfService } from '../../lib/constants';

interface EmailSignupFormProps {
  onSubmit: (e: React.FormEvent) => unknown;
  isReady: boolean;
}

function EmailSignupForm({
  onSubmit,
  isReady,
}: EmailSignupFormProps): ReactElement {
  const [email, setEmail] = useState(null);

  return (
    <AuthForm className="gap-2" onSubmit={onSubmit}>
      <TextField
        leftIcon={<MailIcon size="medium" />}
        inputId="email"
        label="Email"
        type="email"
        name="email"
        valueChanged={(value) => setEmail(value)}
        actionButton={
          <Button
            buttonSize="small"
            className="btn-primary"
            icon={<ArrowIcon className="rotate-90" />}
            type="submit"
            data-testid="email_signup_submit"
            disabled={!email || !isReady}
          />
        }
      />
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

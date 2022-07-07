import React, { ReactElement } from 'react';
import { Button } from '../buttons/Button';
import { TextField } from '../fields/TextField';
import ArrowIcon from '../icons/Arrow';
import MailIcon from '../icons/Mail';
import { AuthForm } from './common';

interface EmailSignupFormProps {
  onSubmit: (e: React.FormEvent) => unknown;
  isV2?: boolean;
}

function EmailSignupForm({
  onSubmit,
  isV2,
}: EmailSignupFormProps): ReactElement {
  return (
    <AuthForm className="gap-2" onSubmit={onSubmit} action="#">
      <TextField
        leftIcon={<MailIcon />}
        inputId="email"
        label="Email"
        type="email"
        name="email"
        actionButton={
          !isV2 && (
            <Button
              buttonSize="small"
              className="btn-tertiary"
              icon={<ArrowIcon className="rotate-90" />}
              type="submit"
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
        By signing in I accept the Terms of Service and the Privacy Policy.
      </p>
    </AuthForm>
  );
}

export default EmailSignupForm;

import React, { ReactElement } from 'react';
import { Button } from '../buttons/Button';
import { TextField } from '../fields/TextField';
import ArrowIcon from '../icons/Arrow';
import MailIcon from '../icons/Mail';
import { AuthForm } from './common';

interface EmailSignupFormProps {
  onSubmit: (e: React.FormEvent) => unknown;
}

function EmailSignupForm({ onSubmit }: EmailSignupFormProps): ReactElement {
  return (
    <AuthForm onSubmit={onSubmit} action="#">
      <TextField
        leftIcon={<MailIcon />}
        inputId="email"
        label="Email"
        type="email"
        actionButton={
          <Button
            buttonSize="small"
            className="btn-tertiary"
            icon={<ArrowIcon className="rotate-90" />}
            type="submit"
          />
        }
      />
      <p className="text-center text-theme-label-quaternary typo-caption1">
        By signing in I accept the Terms of Service and the Privacy Policy.
      </p>
    </AuthForm>
  );
}

export default EmailSignupForm;

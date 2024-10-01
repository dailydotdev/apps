import React, { ReactElement, useId, useState } from 'react';
import SignupDisclaimer from './SignupDisclaimer';
import AuthForm from './AuthForm';
import { TextField } from '../fields/TextField';
import { MailIcon, ArrowIcon } from '../icons';
import { IconSize } from '../Icon';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';

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
  const inputId = useId();
  const isSubmitDisabled = !email || !isReady;

  return (
    <AuthForm
      aria-label="Signup using email"
      className="gap-2"
      onSubmit={onSubmit}
    >
      <TextField
        actionButton={
          <Button
            aria-label="Submit and sign me up, accepting terms and conditions"
            size={ButtonSize.Small}
            variant={ButtonVariant.Primary}
            icon={
              <ArrowIcon
                aria-hidden
                className="rotate-90"
                role="presentation"
              />
            }
            type="submit"
            data-testid="email_signup_submit"
            disabled={isSubmitDisabled}
          />
        }
        aria-label="Enter your email"
        aria-disabled={isSubmitDisabled}
        inputId={inputId}
        label="Email"
        leftIcon={
          <MailIcon aria-hidden role="presentation" size={IconSize.Small} />
        }
        name="email"
        required
        type="email"
        valueChanged={(value) => setEmail(value)}
      />
      {showDisclaimer && <SignupDisclaimer />}
    </AuthForm>
  );
}

export default EmailSignupForm;

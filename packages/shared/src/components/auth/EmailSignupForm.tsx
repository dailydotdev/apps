import React, { ReactElement, useState } from 'react';
import { Button, ButtonSize } from '../buttons/Button';
import { TextField } from '../fields/TextField';
import ArrowIcon from '../icons/Arrow';
import MailIcon from '../icons/Mail';
import AuthForm from './AuthForm';
import { IconSize } from '../Icon';
import SignupDisclaimer from './SignupDisclaimer';

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

import React, { ReactElement, useState } from 'react';

import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { TextField } from '../fields/TextField';
import { IconSize } from '../Icon';
import { ArrowIcon, MailIcon } from '../icons';
import AuthForm from './AuthForm';
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
            size={ButtonSize.Small}
            variant={ButtonVariant.Primary}
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

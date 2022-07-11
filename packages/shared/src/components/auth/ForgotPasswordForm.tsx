import classNames from 'classnames';
import React, { ReactElement, useState } from 'react';
import { Button } from '../buttons/Button';
import { TextField } from '../fields/TextField';
import MailIcon from '../icons/Mail';
import VIcon from '../icons/V';
import { CloseModalFunc } from '../modals/common';
import AuthModalHeader from './AuthModalHeader';
import { AuthModalText } from './common';

interface ForgotPasswordFormProps {
  email?: string;
  onBack?: CloseModalFunc;
  onClose?: CloseModalFunc;
}

function ForgotPasswordForm({
  email,
  onBack,
  onClose,
}: ForgotPasswordFormProps): ReactElement {
  const [emailSent, setEmailSent] = useState(false);
  const onSendEmail = () => setEmailSent(true);

  return (
    <>
      <AuthModalHeader
        title="Forgot password"
        onBack={onBack}
        onClose={onClose}
      />
      <div className="flex flex-col items-end py-8 px-14">
        <AuthModalText className="text-center">
          Enter the email address you registered with and we will send you a
          password reset link.
        </AuthModalText>
        <TextField
          className="mt-6 w-full"
          name="email"
          type="email"
          inputId="email"
          label="Email"
          defaultValue={email}
          leftIcon={<MailIcon />}
          rightIcon={
            emailSent && <VIcon className="text-theme-color-avocado" />
          }
        />
        <Button
          className={classNames(
            'mt-6',
            emailSent ? 'btn-primary' : 'bg-theme-color-cabbage',
          )}
          onClick={onSendEmail}
          disabled={emailSent}
        >
          Send email
        </Button>
      </div>
    </>
  );
}

export default ForgotPasswordForm;

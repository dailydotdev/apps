import React, { ReactElement, useState } from 'react';
import { Button } from '../buttons/Button';
import { TextField } from '../fields/TextField';
import MailIcon from '../icons/Mail';
import VIcon from '../icons/V';
import AuthModalHeader from './AuthModalHeader';
import { AuthModalText } from './common';

interface ForgotPasswordProps {
  email?: string;
}

function ForgotPassword({ email }: ForgotPasswordProps): ReactElement {
  const [emailSent, setEmailSent] = useState(false);
  const onSendEmail = () => {
    setEmailSent(true);
  };

  return (
    <div className="flex flex-col">
      <AuthModalHeader title="Forgot password" />
      <div className="flex flex-col items-end py-8 px-14">
        <AuthModalText className="text-center">
          Enter the email address you registered with and we will send you a
          password reset link.
        </AuthModalText>
        <TextField
          className="mt-6"
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
        <Button className="mt-6" onClick={onSendEmail}>
          Send email
        </Button>
      </div>
    </div>
  );
}

export default ForgotPassword;

import classNames from 'classnames';
import React, { FormEvent, ReactElement, useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import {
  AccountRecoveryParameters,
  getErrorMessage,
  initializeRecovery,
  sendEmailRecovery,
} from '../../lib/auth';
import { formToJson } from '../../lib/form';
import { disabledRefetch } from '../../lib/func';
import { Button } from '../buttons/Button';
import { TextField } from '../fields/TextField';
import MailIcon from '../icons/Mail';
import VIcon from '../icons/V';
import { CloseModalFunc } from '../modals/common';
import AuthModalHeader from './AuthModalHeader';
import { AuthForm, AuthModalText } from './common';

interface ForgotPasswordFormProps {
  initialEmail?: string;
  onBack?: CloseModalFunc;
  onClose?: CloseModalFunc;
}

function ForgotPasswordForm({
  initialEmail,
  onBack,
  onClose,
}: ForgotPasswordFormProps): ReactElement {
  const [hint, setHint] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const { data: recovery } = useQuery('recovery', initializeRecovery, {
    ...disabledRefetch,
  });

  const { mutateAsync: sendEmail } = useMutation(sendEmailRecovery, {
    onSuccess: ({ error }) => {
      if (error) {
        const requestError = getErrorMessage(error.ui.messages);
        const formError = getErrorMessage(error.ui.nodes?.[1]?.messages);
        const message = requestError || formError;
        return setHint(message);
      }

      return setEmailSent(true);
    },
  });

  const onSendEmail = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { email } = formToJson(e.currentTarget);
    const { action, nodes } = recovery.ui;
    const params: AccountRecoveryParameters = {
      csrf_token: nodes[0].attributes.value,
      email,
    };

    return sendEmail({ action, params });
  };

  return (
    <>
      <AuthModalHeader
        title="Forgot password"
        onBack={onBack}
        onClose={onClose}
      />
      <AuthForm
        className="flex flex-col items-end py-8 px-14"
        onSubmit={onSendEmail}
      >
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
          defaultValue={initialEmail}
          hint={hint}
          valid={!hint}
          onChange={() => hint && setHint('')}
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
          type="submit"
          disabled={emailSent}
        >
          Send email
        </Button>
      </AuthForm>
    </>
  );
}

export default ForgotPasswordForm;

import classNames from 'classnames';
import React, { FormEvent, ReactElement, useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import {
  AccountRecoveryParameters,
  getErrorMessage,
  getNodeByKey,
  getNodeValue,
  ValidateReceoveryParams,
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
import TokenInput from './TokenField';
import useTimer from '../../hooks/useTimer';
import {
  AuthFlow,
  initializeKratosFlow,
  submitKratosFlow,
} from '../../lib/kratos';

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
  const [sentCount, setSentCount] = useState(0);
  const [emailSent, setEmailSent] = useState(false);
  const { timer, setTimer, runTimer } = useTimer(() => setEmailSent(false), 0);
  const { data: recovery } = useQuery(
    ['recovery', sentCount],
    () => initializeKratosFlow(AuthFlow.Recovery),
    {
      ...disabledRefetch,
    },
  );

  const { mutateAsync: sendEmail, isLoading } = useMutation(
    (params: ValidateReceoveryParams) => submitKratosFlow(params),
    {
      onSuccess: ({ error }) => {
        if (error) {
          const requestError = getErrorMessage(error.ui.messages);
          const emailError = getNodeByKey('email', error.ui.nodes);
          const formError = getErrorMessage(emailError?.messages);
          const message = requestError || formError;
          return setHint(message);
        }

        setTimer(5);
        runTimer();
        setSentCount((value) => value + 1);
        return setEmailSent(true);
      },
    },
  );

  const onSendEmail = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { email } = formToJson(e.currentTarget);
    const { action, nodes } = recovery.ui;
    const csrfToken = getNodeByKey('csrf_token', nodes);
    const params: AccountRecoveryParameters = {
      csrf_token: csrfToken.attributes.value,
      email,
      method: 'link',
    };

    await sendEmail({ action, params });
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
        data-testid="recovery_form"
      >
        <TokenInput token={getNodeValue('csrf_token', recovery?.ui?.nodes)} />
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
            emailSent && (
              <VIcon
                className="text-theme-color-avocado"
                data-testid="email_sent_icon"
              />
            )
          }
        />
        <Button
          className={classNames(
            'mt-6',
            emailSent ? 'btn-primary' : 'bg-theme-color-cabbage',
          )}
          type="submit"
          disabled={emailSent || isLoading}
        >
          {timer === 0 ? 'Send email' : `${timer}s`}
        </Button>
      </AuthForm>
    </>
  );
}

export default ForgotPasswordForm;

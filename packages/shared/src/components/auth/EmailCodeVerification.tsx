import React, { ReactElement, useEffect, useState } from 'react';
import { formToJson } from '../../lib/form';
import { Button } from '../buttons/Button';
import { TextField } from '../fields/TextField';
import { AuthFormProps } from './common';
import { AuthFlow } from '../../lib/kratos';
import useAccountEmailFlow from '../../hooks/useAccountEmailFlow';
import AuthForm from './AuthForm';
import KeyIcon from '../icons/Key';
import MailIcon from '../icons/Mail';
import VIcon from '../icons/V';

interface EmailCodeVerificationProps extends AuthFormProps {
  email: string;
  onSubmit?: () => void;
}
function EmailCodeVerification({
  email,
  onSubmit,
}: EmailCodeVerificationProps): ReactElement {
  const [flowId, setFlowId] = useState<string>();
  const [hint, setHint] = useState('');
  const { sendEmail, verifyCode, resendTimer, isLoading } = useAccountEmailFlow(
    {
      flow: AuthFlow.Verification,
      flowId,
      onError: setHint,
      onSuccess: (_, id) => {
        setFlowId(id);
      },
      onVerifyCodeSuccess: () => {
        onSubmit();
      },
    },
  );

  const onCodeVerification = async (e) => {
    e.preventDefault();
    // Verify required analytics
    // trackEvent({
    //   event_name: AuthEventNames.SubmitForgotPassword,
    // });
    setHint('');
    const { code } = formToJson<{ code: string }>(e.currentTarget);
    await verifyCode(code);
  };

  const onSendCode = () => {};

  useEffect(() => {
    if (!email || flowId) {
      return;
    }

    sendEmail(email);
  }, [sendEmail, email, flowId]);

  return (
    <AuthForm
      className="flex flex-col items-end py-8 px-14"
      onSubmit={onCodeVerification}
      data-testid="email_verification_form"
    >
      <TextField
        saveHintSpace
        className={{ container: 'w-full' }}
        leftIcon={<MailIcon />}
        name="traits.email"
        inputId="email"
        label="Email"
        type="email"
        value={email}
        readOnly
        rightIcon={<VIcon className="text-theme-color-avocado" />}
      />
      <TextField
        className={{ container: 'mt-6 w-full' }}
        name="code"
        type="code"
        inputId="code"
        label="Code"
        hint={hint}
        valid={!hint}
        onChange={() => hint && setHint('')}
        leftIcon={<KeyIcon />}
        actionButton={
          <Button className="btn-primary" onClick={onSendCode}>
            {resendTimer === 0 ? 'Resend' : `Resend code ${resendTimer}s`}
          </Button>
        }
      />
      <Button className="mt-6 btn-primary" type="submit" loading={isLoading}>
        Verify
      </Button>
    </AuthForm>
  );
}

export default EmailCodeVerification;

import React, { ReactElement, useContext, useEffect, useState } from 'react';
import classNames from 'classnames';
import { Button } from '../buttons/Button';
import { TextField } from '../fields/TextField';
import { AuthFormProps } from './common';
import { AuthFlow } from '../../lib/kratos';
import useAccountEmailFlow from '../../hooks/useAccountEmailFlow';
import AuthForm from './AuthForm';
import { KeyIcon, MailIcon, VIcon } from '../icons';
import { AuthEventNames } from '../../lib/auth';
import AnalyticsContext from '../../contexts/AnalyticsContext';

interface EmailCodeVerificationProps extends AuthFormProps {
  code?: string;
  email: string;
  flowId: string;
  onSubmit?: () => void;
  className?: string;
}
function EmailCodeVerification({
  code: codeProp,
  email: emailProp,
  flowId,
  onSubmit,
  className,
}: EmailCodeVerificationProps): ReactElement {
  const { trackEvent } = useContext(AnalyticsContext);
  const [hint, setHint] = useState('');
  const [code, setCode] = useState(codeProp);
  const [email, setEmail] = useState(emailProp);
  const { sendEmail, verifyCode, resendTimer, isLoading, autoResend } =
    useAccountEmailFlow({
      flow: AuthFlow.Verification,
      flowId,
      onError: setHint,
      onVerifyCodeSuccess: () => {
        onSubmit();
      },
    });

  useEffect(() => {
    if (autoResend && !hint) {
      setHint('Please click resend code to get a new code.');
    }
  }, [autoResend, hint]);

  const onCodeVerification = async (e) => {
    e.preventDefault();
    trackEvent({
      event_name: AuthEventNames.VerifyEmail,
    });
    setHint('');
    await verifyCode({ code });
  };

  const onSendCode = () => {
    sendEmail(email);
  };

  return (
    <AuthForm
      className={classNames('flex flex-col items-end px-14 py-8', className)}
      onSubmit={onCodeVerification}
      data-testid="email_verification_form"
    >
      <TextField
        saveHintSpace
        className={{ container: 'w-full' }}
        leftIcon={<MailIcon />}
        name="email"
        inputId="email"
        label="Email"
        type="email"
        value={email}
        readOnly={!!flowId}
        valueChanged={setEmail}
        rightIcon={<VIcon className="text-theme-color-avocado" />}
      />
      <TextField
        className={{ container: 'w-full' }}
        name="code"
        type="code"
        inputId="code"
        label="Code"
        hint={hint}
        defaultValue={code}
        valid={!hint}
        valueChanged={setCode}
        onChange={() => hint && setHint('')}
        leftIcon={<KeyIcon />}
        actionButton={
          <Button className="btn-primary" type="button" onClick={onSendCode}>
            {resendTimer === 0 ? 'Resend' : `Resend code ${resendTimer}s`}
          </Button>
        }
      />
      <Button
        className="btn-primary mt-6 w-full"
        type="submit"
        loading={isLoading}
        disabled={autoResend}
      >
        Verify
      </Button>
    </AuthForm>
  );
}

export default EmailCodeVerification;

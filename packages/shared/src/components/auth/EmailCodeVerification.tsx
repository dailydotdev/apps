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
import LogContext from '../../contexts/LogContext';
import Alert, { AlertParagraph, AlertType } from '../widgets/Alert';
import { LogEvent, TargetType } from '../../lib/log';

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
  const { logEvent } = useContext(LogContext);
  const [hint, setHint] = useState('');
  const [alert, setAlert] = useState({ firstAlert: true, alert: false });
  const [code, setCode] = useState(codeProp);
  const [email, setEmail] = useState(emailProp);
  const { sendEmail, verifyCode, resendTimer, isLoading, autoResend } =
    useAccountEmailFlow({
      flow: AuthFlow.Verification,
      flowId,
      onError: setHint,
      onVerifyCodeSuccess: () => {
        logEvent({
          event_name: AuthEventNames.VerifiedSuccessfully,
        });
        onSubmit();
      },
    });

  useEffect(() => {
    if (autoResend && !alert.alert && alert.firstAlert === true) {
      setAlert({ firstAlert: false, alert: true });
    }
  }, [autoResend, alert]);

  const onCodeVerification = async (e) => {
    e.preventDefault();
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.VerifyEmail,
    });
    setHint('');
    setAlert({ firstAlert: false, alert: false });
    await verifyCode({ code });
  };

  const onSendCode = () => {
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.ResendVerificationCode,
    });
    setAlert({ firstAlert: false, alert: false });
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
        rightIcon={<VIcon className="text-accent-avocado-default" />}
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
          <Button
            className="btn-primary"
            type="button"
            onClick={onSendCode}
            disabled={resendTimer > 0}
          >
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
      {alert.alert && (
        <Alert className="mt-6" type={AlertType.Error} flexDirection="flex-row">
          <AlertParagraph className="!mt-0 flex-1">
            Your session expired, please click the resend button above to get a
            new code.
          </AlertParagraph>
        </Alert>
      )}
    </AuthForm>
  );
}

export default EmailCodeVerification;

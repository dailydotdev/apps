import type { ReactElement } from 'react';
import React, { useContext, useEffect, useState } from 'react';
import classNames from 'classnames';
import { Button } from '../buttons/Button';
import { TextField } from '../fields/TextField';
import type { AuthFormProps } from './common';
import { AuthFlow } from '../../lib/kratos';
import useAccountEmailFlow from '../../hooks/useAccountEmailFlow';
import AuthForm from './AuthForm';
import { KeyIcon, MailIcon, VIcon } from '../icons';
import { AuthEventNames } from '../../lib/auth';
import LogContext from '../../contexts/LogContext';
import Alert, { AlertParagraph, AlertType } from '../widgets/Alert';
import { LogEvent, TargetType } from '../../lib/log';
import { useFeature } from '../GrowthBookProvider';
import { featureOnboardingPapercuts } from '../../lib/featureManagement';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { CodeField } from '../fields/CodeField';

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
  const onboardingPapercuts = useFeature(featureOnboardingPapercuts);
  const { logEvent } = useContext(LogContext);
  const [hint, setHint] = useState('');
  const [alert, setAlert] = useState({ firstAlert: true, alert: false });
  const [code, setCode] = useState(codeProp);
  const [email, setEmail] = useState(emailProp);
  const { sendEmail, verifyCode, resendTimer, autoResend, isVerifyingCode } =
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

  const onCodeSubmit = async (newCode: string) => {
    if (newCode.length === 6) {
      setCode(newCode);
      await verifyCode({ code: newCode });
    }
  };

  const onCodeChange = async () => {
    if (hint?.length > 0) {
      setHint('');
    }
  };

  return (
    <AuthForm
      className={classNames('flex flex-col items-end px-14 py-8', className)}
      onSubmit={onCodeVerification}
      data-testid="email_verification_form"
    >
      {!onboardingPapercuts && (
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
      )}
      {onboardingPapercuts && (
        <div className="flex w-full flex-col items-center gap-4">
          <Typography
            type={TypographyType.Body}
            color={TypographyColor.Tertiary}
          >
            A verification code has been sent to:
          </Typography>
          <Typography type={TypographyType.Body}>{email}</Typography>
        </div>
      )}
      {!onboardingPapercuts && (
        <TextField
          autoFocus
          className={{ container: 'w-full' }}
          defaultValue={code}
          hint={hint}
          inputId="code"
          label="Code"
          leftIcon={<KeyIcon aria-hidden role="presentation" />}
          name="code"
          onChange={() => hint && setHint('')}
          type="code"
          valid={!hint}
          valueChanged={setCode}
          actionButton={
            <Button
              className="btn-primary"
              type="button"
              onClick={onSendCode}
              disabled={resendTimer > 0}
            >
              {resendTimer === 0 ? 'Resend' : `Resend code: ${resendTimer}s`}
            </Button>
          }
        />
      )}
      {onboardingPapercuts && (
        <div className="my-10 flex w-full flex-col items-center gap-4">
          <input
            type="text"
            id="email"
            name="email"
            value={email}
            hidden
            readOnly
          />
          <CodeField
            onSubmit={onCodeSubmit}
            onChange={onCodeChange}
            disabled={isVerifyingCode}
          />
          {hint && (
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.StatusError}
              className="px-4 text-center"
            >
              {hint}
            </Typography>
          )}
          <span className="text-text-tertiary">
            Didn&#39;t get a verification code?{' '}
            <button
              type="button"
              disabled={resendTimer > 0}
              onClick={onSendCode}
              className={
                resendTimer === 0 ? 'text-text-link' : 'text-text-disabled'
              }
            >
              Resend code
              {resendTimer > 0 && ` ${resendTimer}s`}
            </button>
          </span>
        </div>
      )}
      <Button
        className={classNames('btn-primary w-full', {
          'mt-6': !onboardingPapercuts,
        })}
        type="submit"
        loading={isVerifyingCode}
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

import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { Button, ButtonVariant } from '../buttons/Button';
import type { AuthFormProps } from './common';
import { AuthFlow } from '../../lib/kratos';
import useAccountEmailFlow from '../../hooks/useAccountEmailFlow';
import AuthForm from './AuthForm';
import { AuthEventNames } from '../../lib/auth';
import { useLogContext } from '../../contexts/LogContext';
import Alert, { AlertParagraph, AlertType } from '../widgets/Alert';
import { LogEvent, TargetType } from '../../lib/log';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { CodeField } from '../fields/CodeField';
import { useAuthData } from '../../contexts/AuthDataContext';

interface EmailCodeVerificationProps extends AuthFormProps {
  code?: string;
  flowId: string;
  onSubmit?: () => void;
  className?: string;
  onVerifyCode?: (code: string) => Promise<void>;
  onResendCode?: () => Promise<void>;
}

function EmailCodeVerification({
  code: codeProp,
  flowId,
  onSubmit,
  className,
  onVerifyCode,
  onResendCode,
}: EmailCodeVerificationProps): ReactElement {
  const { email } = useAuthData();
  const { logEvent } = useLogContext();
  const [hint, setHint] = useState('');
  const [alert, setAlert] = useState({ firstAlert: true, alert: false });
  const [code, setCode] = useState(codeProp);
  const [isCustomVerifying, setIsCustomVerifying] = useState(false);
  const verifyingRef = useRef(false);

  const {
    sendEmail,
    verifyCode,
    resendTimer,
    resetResendTimer,
    autoResend,
    isVerifyingCode,
  } = useAccountEmailFlow({
    flow: AuthFlow.Verification,
    flowId: onVerifyCode ? 'skip' : flowId,
    timerOnLoad: 60,
    onError: setHint,
    onVerifyCodeSuccess: () => {
      logEvent({
        event_name: AuthEventNames.VerifiedSuccessfully,
      });
      onSubmit();
    },
  });

  const isVerifying = onVerifyCode ? isCustomVerifying : isVerifyingCode;

  useEffect(() => {
    if (
      !onVerifyCode &&
      autoResend &&
      !alert.alert &&
      alert.firstAlert === true
    ) {
      setAlert({ firstAlert: false, alert: true });
    }
  }, [autoResend, alert, onVerifyCode]);

  const handleVerify = async (verifyCodeValue: string) => {
    if (onVerifyCode) {
      if (verifyingRef.current) {
        return;
      }
      verifyingRef.current = true;
      setIsCustomVerifying(true);
      try {
        await onVerifyCode(verifyCodeValue);
        logEvent({
          event_name: AuthEventNames.VerifiedSuccessfully,
        });
        onSubmit();
      } catch (err) {
        verifyingRef.current = false;
        setHint(err instanceof Error ? err.message : 'Verification failed');
      } finally {
        setIsCustomVerifying(false);
      }
    } else {
      await verifyCode({ code: verifyCodeValue });
    }
  };

  const onCodeVerification = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.VerifyEmail,
    });
    setHint('');
    setAlert({ firstAlert: false, alert: false });
    await handleVerify(code);
  };

  const onSendCode = async () => {
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.ResendVerificationCode,
    });
    setAlert({ firstAlert: false, alert: false });
    if (onResendCode) {
      await onResendCode();
      resetResendTimer();
    } else {
      sendEmail(email);
    }
  };

  const onCodeSubmit = async (newCode: string) => {
    if (newCode.length === 6) {
      setCode(newCode);
      await handleVerify(newCode);
    }
  };

  const onCodeChange = async () => {
    if (hint?.length > 0) {
      setHint('');
    }
  };

  return (
    <AuthForm
      className={classNames(
        'flex flex-col items-end py-8 mobileL:px-8 tablet:px-14',
        className,
      )}
      onSubmit={onCodeVerification}
      data-testid="email_verification_form"
    >
      <div className="flex w-full flex-col items-center gap-4">
        <Typography
          type={TypographyType.Body}
          color={TypographyColor.Tertiary}
          center
        >
          A verification code has been sent to:
        </Typography>
        <Typography type={TypographyType.Body}>{email}</Typography>
      </div>
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
          disabled={isVerifying}
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
      <Button
        className="w-full"
        type="submit"
        variant={ButtonVariant.Primary}
        loading={isVerifying}
        disabled={onVerifyCode ? false : autoResend}
      >
        Verify
      </Button>
      {!onVerifyCode && alert.alert && (
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

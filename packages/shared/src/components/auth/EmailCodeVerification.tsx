import type { ReactElement } from 'react';
import React, { useRef, useState } from 'react';
import classNames from 'classnames';
import { Button, ButtonVariant } from '../buttons/Button';
import type { AuthFormProps } from './common';
import AuthForm from './AuthForm';
import { AuthEventNames } from '../../lib/auth';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent, TargetType } from '../../lib/log';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { CodeField } from '../fields/CodeField';
import { useAuthData } from '../../contexts/AuthDataContext';
import useTimer from '../../hooks/useTimer';

interface EmailCodeVerificationProps extends AuthFormProps {
  code?: string;
  onSubmit?: () => void;
  className?: string;
  onVerifyCode?: (code: string) => Promise<void>;
  onResendCode?: () => Promise<void>;
}

const noop = (): void => undefined;

function EmailCodeVerification({
  code: codeProp,
  onSubmit,
  className,
  onVerifyCode,
  onResendCode,
}: EmailCodeVerificationProps): ReactElement {
  const { email } = useAuthData();
  const { logEvent } = useLogContext();
  const [hint, setHint] = useState('');
  const [code, setCode] = useState(codeProp ?? '');
  const [isVerifying, setIsVerifying] = useState(false);
  const verifyingRef = useRef(false);
  const { timer, setTimer, runTimer } = useTimer(noop, 60);
  const resendTimer = timer ?? 0;

  const resetResendTimer = () => {
    setTimer(60);
    runTimer();
  };

  const handleVerify = async (verifyCodeValue: string) => {
    if (!onVerifyCode || verifyingRef.current) {
      return;
    }
    verifyingRef.current = true;
    setIsVerifying(true);
    try {
      await onVerifyCode(verifyCodeValue);
      logEvent({
        event_name: AuthEventNames.VerifiedSuccessfully,
      });
      onSubmit?.();
    } catch (err) {
      verifyingRef.current = false;
      setHint(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const onCodeVerification = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.VerifyEmail,
    });
    setHint('');
    if (!code) {
      setHint('Enter the 6-digit code');
      return;
    }

    await handleVerify(code);
  };

  const onSendCode = async () => {
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.ResendVerificationCode,
    });
    if (onResendCode) {
      await onResendCode();
      resetResendTimer();
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
      >
        Verify
      </Button>
    </AuthForm>
  );
}

export default EmailCodeVerification;

import {
  Button,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import type { PasswordFieldProps } from '@dailydotdev/shared/src/components/fields/PasswordField';
import { PasswordField } from '@dailydotdev/shared/src/components/fields/PasswordField';
import type { TextFieldProps } from '@dailydotdev/shared/src/components/fields/TextField';
import { TextField } from '@dailydotdev/shared/src/components/fields/TextField';
import classNames from 'classnames';
import type { Dispatch, ReactElement, SetStateAction } from 'react';
import React, { useState } from 'react';
import useTimer from '@dailydotdev/shared/src/hooks/useTimer';
import { AuthEventNames } from '@dailydotdev/shared/src/lib/auth';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { LogEvent, TargetType } from '@dailydotdev/shared/src/lib/log';
import { CommonTextField } from './common';

export interface EmailFormProps {
  onSubmit: (email: string) => void;
  onVerifySuccess: () => Promise<void>;
  onVerifyCode?: (code: string) => Promise<void>;
  className?: string;
  verificationId?: string;
  emailProps?: Partial<TextFieldProps>;
  passwordProps?: Partial<PasswordFieldProps>;
  hint?: string;
  setHint?: Dispatch<SetStateAction<string | undefined>>;
}

function EmailForm({
  onSubmit,
  onVerifySuccess,
  onVerifyCode,
  className,
  hint,
  setHint,
  emailProps = {},
  passwordProps,
}: EmailFormProps): ReactElement {
  const { logEvent } = useLogContext();
  const [code, setCode] = useState<string>();
  const [email, setEmail] = useState<string>();
  const [codeHint, setCodeHint] = useState<string>();
  const { timer: nextTimer, setTimer, runTimer } = useTimer(() => undefined, 0);
  const timer = nextTimer ?? 0;

  const onCodeVerification = async () => {
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.VerifyEmail,
    });
    setCodeHint('');
    if (onVerifyCode) {
      if (!code) {
        setCodeHint('Enter the 6-digit code');
        return;
      }

      try {
        await onVerifyCode(code);
        logEvent({
          event_name: AuthEventNames.VerifiedSuccessfully,
        });
        await onVerifySuccess();
      } catch (error) {
        setCodeHint(
          error instanceof Error ? error.message : 'Verification failed',
        );
      }
    }
  };

  const onSubmitEmail = () => {
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.ResendVerificationCode,
    });
    if (!email) {
      return;
    }

    onSubmit(email);
    setTimer(60);
    runTimer();
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const submitType = (e.nativeEvent as SubmitEvent).submitter?.getAttribute(
      'name',
    );
    if (submitType === 'getCode') {
      onSubmitEmail();
    } else {
      onCodeVerification();
    }
  };

  return (
    <form
      className={classNames('flex flex-col gap-3', className)}
      onSubmit={handleSubmit}
    >
      <CommonTextField
        type="email"
        inputId="new_email"
        name="traits.email"
        hint={hint}
        valid={!hint}
        label={emailProps?.label || 'Email'}
        value={email}
        valueChanged={setEmail}
        onChange={() => setHint?.(undefined)}
      />
      {passwordProps && (
        <PasswordField
          className={{ container: 'mt-6' }}
          inputId="password"
          name="password"
          type="password"
          {...passwordProps}
          label={passwordProps?.label || 'Password'}
        />
      )}
      <TextField
        className={{ container: 'w-full', baseField: '!pr-1' }}
        name="code"
        type="code"
        inputId="code"
        label="Enter 6-digit code"
        placeholder="Enter 6-digit code"
        hint={codeHint}
        defaultValue={code}
        valid={!codeHint}
        valueChanged={setCode}
        onChange={() => codeHint && setCodeHint('')}
        actionButton={
          <Button
            variant={ButtonVariant.Primary}
            name="getCode"
            className="w-[10.875rem]"
            disabled={!email || timer > 0}
          >
            {timer === 0 ? 'Send code' : `Resend code: ${timer}s`}
          </Button>
        }
      />
      <Button
        data-testid="change_email_btn"
        className="mt-3 w-fit"
        name="changeEmail"
        disabled={!code}
        variant={ButtonVariant.Primary}
      >
        Change email
      </Button>
    </form>
  );
}

export default EmailForm;

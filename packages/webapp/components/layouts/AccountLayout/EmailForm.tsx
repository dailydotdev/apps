import {
  Button,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  PasswordField,
  PasswordFieldProps,
} from '@dailydotdev/shared/src/components/fields/PasswordField';
import {
  TextField,
  TextFieldProps,
} from '@dailydotdev/shared/src/components/fields/TextField';
import classNames from 'classnames';
import React, {
  Dispatch,
  ReactElement,
  SetStateAction,
  useContext,
  useState,
} from 'react';
import useAccountEmailFlow from '@dailydotdev/shared/src/hooks/useAccountEmailFlow';
import { AuthFlow } from '@dailydotdev/shared/src/lib/kratos';
import useTimer from '@dailydotdev/shared/src/hooks/useTimer';
import { AuthEventNames } from '@dailydotdev/shared/src/lib/auth';
import LogContext from '@dailydotdev/shared/src/contexts/LogContext';
import { LogEvent, TargetType } from '@dailydotdev/shared/src/lib/log';
import { CommonTextField } from './common';

export interface EmailFormProps {
  onSubmit: (email: string) => void;
  onVerifySuccess: () => Promise<void>;
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
  className,
  hint,
  setHint,
  emailProps = {},
  passwordProps,
  verificationId,
}: EmailFormProps): ReactElement {
  const { logEvent } = useContext(LogContext);
  const [code, setCode] = useState<string>();
  const [email, setEmail] = useState<string>();
  const { timer, setTimer, runTimer } = useTimer(null, 0);
  const { verifyCode } = useAccountEmailFlow({
    flow: AuthFlow.Verification,
    flowId: verificationId,
    onError: setHint,
    onVerifyCodeSuccess: () => {
      logEvent({
        event_name: AuthEventNames.VerifiedSuccessfully,
      });
      onVerifySuccess();
    },
  });

  const onCodeVerification = async () => {
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.VerifyEmail,
    });
    setHint('');
    await verifyCode({ code, altFlowId: verificationId });
  };

  const onSubmitEmail = () => {
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.ResendVerificationCode,
    });
    onSubmit(email);
    setTimer(60);
    runTimer();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitType = e.nativeEvent.submitter.name;
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
        onChange={() => setHint(null)}
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
        hint={hint}
        defaultValue={code}
        valid={!hint}
        valueChanged={setCode}
        onChange={() => hint && setHint('')}
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

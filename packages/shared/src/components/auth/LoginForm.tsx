import classNames from 'classnames';
import type { Dispatch, FormEvent, ReactElement, SetStateAction } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import type { TurnstileInstance } from '@marsidev/react-turnstile';
import { Turnstile } from '@marsidev/react-turnstile';
import type { LoginPasswordParameters } from '../../lib/auth';
import { AuthEventNames } from '../../lib/auth';
import { Origin } from '../../lib/log';
import { formToJson } from '../../lib/form';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { ClickableText } from '../buttons/ClickableText';
import { PasswordField } from '../fields/PasswordField';
import { TextField } from '../fields/TextField';
import { MailIcon } from '../icons';
import AuthForm from './AuthForm';
import { AuthActionBar } from './AuthActionBar';
import { IconSize } from '../Icon';
import Alert, { AlertParagraph, AlertType } from '../widgets/Alert';
import { labels } from '../../lib';
import { useLogContext } from '../../contexts/LogContext';
import {
  getTurnstileWaitExtra,
  TURNSTILE_WAIT_LOG_THRESHOLD_MS,
  waitForTurnstileToken,
} from '../../lib/turnstile';

export interface LoginFormProps {
  onForgotPassword?: (email: string) => unknown;
  onPasswordLogin?: (params: LoginFormParams) => void;
  email?: string;
  loginHint: LoginHintState;
  loginButton?: string;
  loginButtonVariant?: ButtonVariant;
  aboveFooter?: boolean;
  className?: string;
  isLoading?: boolean;
  isReady: boolean;
  autoFocus?: boolean;
  onSignup: () => void;
}

export type LoginHintState = [
  string | null,
  Dispatch<SetStateAction<string | null>>,
];

export type LoginFormParams = Pick<
  LoginPasswordParameters,
  'identifier' | 'password'
> & {
  turnstileToken?: string;
};

type LoginFieldErrors = Partial<Record<'identifier' | 'password', string>>;

const getFieldErrors = (
  form: HTMLFormElement,
  { identifier, password }: LoginFormParams,
): LoginFieldErrors => {
  const email = form.elements.namedItem('identifier') as HTMLInputElement;
  const errors: LoginFieldErrors = {};

  if (!identifier) {
    errors.identifier = 'Enter your email';
  } else if (!email.validity.valid) {
    errors.identifier = 'Enter a valid email address';
  }

  if (!password) {
    errors.password = 'Enter your password';
  }

  return errors;
};

function LoginForm({
  onForgotPassword,
  onPasswordLogin,
  email,
  loginHint: [hint, setHint],
  loginButton = 'Log in',
  loginButtonVariant = ButtonVariant.Primary,
  aboveFooter,
  className,
  isLoading,
  isReady,
  autoFocus = true,
  onSignup,
}: LoginFormProps): ReactElement {
  const { logEvent } = useLogContext();
  const turnstileRef = useRef<TurnstileInstance>(null);
  const [turnstileLoaded, setTurnstileLoaded] = useState(false);
  const [turnstileError, setTurnstileError] = useState(false);
  const [isVerifyingTurnstile, setIsVerifyingTurnstile] = useState(false);
  const isTurnstileInteractiveRef = useRef(false);
  const [hasEngaged, setHasEngaged] = useState(false);
  const onEngage = () => setHasEngaged(true);
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_KEY ?? '';

  useEffect(() => {
    if (hint) {
      turnstileRef.current?.reset();
    }
  }, [hint]);

  const onLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!onPasswordLogin || isVerifyingTurnstile) {
      return;
    }

    const form = formToJson<LoginFormParams>(e.currentTarget);
    const errors = getFieldErrors(e.currentTarget, form);
    setFieldErrors(errors);
    const invalidField = Object.keys(errors)[0];
    if (invalidField) {
      document.getElementById(invalidField)?.focus();
      return;
    }

    if (turnstileSiteKey) {
      setIsVerifyingTurnstile(true);
      const startedAt = Date.now();
      const turnstileToken = await waitForTurnstileToken(turnstileRef.current, {
        shouldStop: () => isTurnstileInteractiveRef.current,
      });
      setIsVerifyingTurnstile(false);
      const waitExtra = getTurnstileWaitExtra({
        form: 'login',
        startedAt,
        token: turnstileToken,
        isInteractive: isTurnstileInteractiveRef.current,
      });
      if (waitExtra.waited_ms >= TURNSTILE_WAIT_LOG_THRESHOLD_MS) {
        logEvent({
          event_name: AuthEventNames.TurnstileTokenWait,
          extra: JSON.stringify(waitExtra),
        });
      }

      if (!turnstileToken) {
        logEvent({
          event_name: AuthEventNames.LoginError,
          extra: JSON.stringify({
            provider: 'password',
            error: 'Turnstile not valid',
            origin: Origin.LoginTurnstile,
            waited_ms: waitExtra.waited_ms,
            outcome: waitExtra.outcome,
          }),
        });
        setTurnstileError(true);
        return;
      }

      form.turnstileToken = turnstileToken;
    }

    setTurnstileError(false);
    onPasswordLogin(form);
  };
  const [shouldFocus, setShouldFocus] = useState(autoFocus);
  const [innerEmail, setInnerEmail] = useState(email || '');

  return (
    <AuthForm
      aria-label="Login using email and password"
      className={classNames('gap-1', className)}
      noValidate
      onSubmit={onLogin}
      onPointerDownCapture={onEngage}
      onKeyDownCapture={onEngage}
      onInputCapture={onEngage}
      data-testid="login_form"
      ref={(form) => {
        if (!form) {
          return;
        }

        const id = email ? 'password' : 'identifier';
        const element = document.getElementById(id);
        if (shouldFocus && !!element) {
          element?.focus();
          setShouldFocus(false);
        }
      }}
    >
      <TextField
        leftIcon={
          <MailIcon role="presentation" aria-hidden size={IconSize.Small} />
        }
        inputId="identifier"
        name="identifier"
        label="Email"
        type="email"
        autoComplete="username"
        value={email}
        data-testid="login_email"
        onChange={(e) => {
          setInnerEmail(e.target.value);
          setFieldErrors(({ password }) => ({ password }));
          if (hint) {
            setHint(null);
          }
        }}
        hint={fieldErrors.identifier}
        valid={!fieldErrors.identifier}
        saveHintSpace
        required
      />
      <PasswordField
        data-testid="login_password"
        inputId="password"
        name="password"
        label="Password"
        autoComplete="current-password"
        required
        showStrength={false}
        hint={fieldErrors.password}
        saveHintSpace
        onChange={() => {
          setFieldErrors(({ identifier }) => ({ identifier }));
          if (hint) {
            setHint(null);
          }
        }}
      />
      {onForgotPassword && (
        <ClickableText
          type="button"
          className="btn-primary self-end underline"
          onClick={() => onForgotPassword(innerEmail)}
        >
          Forgot password?
        </ClickableText>
      )}
      {turnstileSiteKey && (
        <Turnstile
          ref={turnstileRef}
          siteKey={turnstileSiteKey}
          options={{ theme: 'dark', appearance: 'interaction-only' }}
          className={classNames(
            'mx-auto',
            !hasEngaged && 'invisible h-0 overflow-hidden',
          )}
          onWidgetLoad={() => setTurnstileLoaded(true)}
          onBeforeInteractive={() => {
            isTurnstileInteractiveRef.current = true;
          }}
          onAfterInteractive={() => {
            isTurnstileInteractiveRef.current = false;
          }}
        />
      )}
      {turnstileError && (
        <Alert
          className="mt-3"
          type={AlertType.Error}
          title="Please complete the security check."
        />
      )}
      {hint && (
        <Alert className="mt-3" type={AlertType.Error} flexDirection="flex-row">
          <AlertParagraph className="!mt-0 flex-1">
            {hint === labels.auth.error.invalidEmailOrPassword ? (
              <>
                The email or password you entered doesn&apos;t match our
                records. Please try again or{' '}
                <ClickableText
                  onClick={onSignup}
                  className="font-bold !text-text-primary underline hover:no-underline"
                >
                  create a new account.
                </ClickableText>
              </>
            ) : (
              'Something went wrong on our end. Please try again.'
            )}
          </AlertParagraph>
        </Alert>
      )}
      {loginButtonVariant === ButtonVariant.Primary ? (
        <AuthActionBar
          aboveFooter={aboveFooter}
          type="submit"
          loading={!isReady || isVerifyingTurnstile}
          disabled={isLoading || (!!turnstileSiteKey && !turnstileLoaded)}
        >
          {loginButton}
        </AuthActionBar>
      ) : (
        <Button
          className="mt-3 w-full"
          size={ButtonSize.Large}
          variant={loginButtonVariant}
          type="submit"
          loading={!isReady || isVerifyingTurnstile}
          disabled={isLoading || (!!turnstileSiteKey && !turnstileLoaded)}
        >
          {loginButton}
        </Button>
      )}
    </AuthForm>
  );
}

export default LoginForm;

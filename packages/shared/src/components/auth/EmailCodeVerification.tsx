import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import ConditionalWrapper from '../ConditionalWrapper';
import {
  FunnelGlassBar,
  funnelGlassBarCta,
} from '../../features/onboarding/shared/FunnelGlassBar';
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
  isOnboardingFunnel?: boolean;
}

const noop = (): void => undefined;

const CODE_LENGTH = 6;

function EmailCodeVerification({
  code: codeProp,
  onSubmit,
  className,
  onVerifyCode,
  onResendCode,
  isOnboardingFunnel,
}: EmailCodeVerificationProps): ReactElement {
  const { email } = useAuthData();
  const { logEvent } = useLogContext();
  const [hint, setHint] = useState('');
  const linkedCode = (codeProp ?? '').replace(/\D/g, '').slice(0, CODE_LENGTH);
  const [code, setCode] = useState(linkedCode);
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

  useEffect(() => {
    if (linkedCode.length !== CODE_LENGTH) {
      return;
    }

    handleVerify(linkedCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linkedCode]);

  // Opening the keyboard makes WebKit scroll the focused code row toward the
  // centre of the shrunken viewport, dragging the heading off the top - and
  // `position: sticky` cannot counter it, because the global body overflow
  // guard detaches body from the document scroller. When the row already fits
  // above the keyboard the reveal scroll adds nothing, so undo it - but only
  // in the moments after focus or a keyboard resize, so a reader scrolling by
  // hand is never fought.
  useEffect(() => {
    let resetUntil = 0;
    const isCodeInput = (el: Element | null) =>
      el?.getAttribute('autocomplete') === 'one-time-code';
    const arm = () => {
      resetUntil = Date.now() + 900;
    };

    const onFocusIn = (e: FocusEvent) => {
      if (isCodeInput(e.target as Element)) {
        arm();
      }
    };
    const onViewportResize = () => {
      if (isCodeInput(document.activeElement)) {
        arm();
      }
    };
    const onScroll = () => {
      if (Date.now() > resetUntil || window.scrollY <= 0) {
        return;
      }

      const input = document.activeElement as HTMLElement | null;

      if (!input || !isCodeInput(input)) {
        return;
      }

      const viewportHeight =
        window.visualViewport?.height ?? window.innerHeight;
      const { bottom } = input.getBoundingClientRect();

      if (bottom + window.scrollY <= viewportHeight) {
        window.scrollTo(0, 0);
      }
    };

    document.addEventListener('focusin', onFocusIn);
    window.visualViewport?.addEventListener('resize', onViewportResize);
    window.addEventListener('scroll', onScroll);

    return () => {
      document.removeEventListener('focusin', onFocusIn);
      window.visualViewport?.removeEventListener('resize', onViewportResize);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const onCodeVerification = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.VerifyEmail,
    });
    setHint('');
    if (code.length !== CODE_LENGTH) {
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
    if (newCode.length === CODE_LENGTH) {
      setCode(newCode);
      await handleVerify(newCode);
    }
  };

  const onCodeChange = (newCode: string) => {
    setCode(newCode);

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
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
          center
        >
          Don&apos;t see it? Also check your spam or junk folder.
        </Typography>
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
          defaultValue={linkedCode}
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
      {/* Same glass bar as the funnel steps and account details, so the last
          screen before the funnel opens is not the one bare button in the flow. */}
      <ConditionalWrapper
        condition={!!isOnboardingFunnel}
        wrapper={(component) => <FunnelGlassBar>{component}</FunnelGlassBar>}
      >
        <Button
          className={isOnboardingFunnel ? funnelGlassBarCta : 'w-full'}
          type="submit"
          size={isOnboardingFunnel ? ButtonSize.Medium : undefined}
          variant={ButtonVariant.Primary}
          loading={isVerifying}
        >
          Verify
        </Button>
      </ConditionalWrapper>
    </AuthForm>
  );
}

export default EmailCodeVerification;

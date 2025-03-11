import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import classNames from 'classnames';
import { checkKratosEmail } from '../../lib/kratos';
import type { AuthFormProps } from './common';
import { getFormEmail, providerMap } from './common';
import OrDivider from './OrDivider';
import { useLogContext } from '../../contexts/LogContext';
import type { AuthTriggersType } from '../../lib/auth';
import { AuthEventNames } from '../../lib/auth';
import type { ButtonProps } from '../buttons/Button';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import AuthForm from './AuthForm';
import { TextField } from '../fields/TextField';
import { MailIcon } from '../icons';
import { IconSize } from '../Icon';
import Alert, { AlertParagraph, AlertType } from '../widgets/Alert';
import { isIOSNative } from '../../lib/func';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { cookiePolicy, termsOfService } from '../../lib/constants';
import { ClickableText } from '../buttons/ClickableText';

interface ClassName {
  onboardingSignup?: string;
  onboardingForm?: string;
  onboardingDivider?: string;
}

interface OnboardingRegistrationFormProps extends AuthFormProps {
  onContinueWithEmail?: () => void;
  onExistingEmail?: (email: string) => unknown;
  onSignup?: (email: string) => unknown;
  onProviderClick?: (provider: string, login?: boolean) => unknown;
  targetId?: string;
  isLoginFlow?: boolean;
  logInTitle?: string;
  signUpTitle?: string;
  trigger: AuthTriggersType;
  isReady: boolean;
  className?: ClassName;
  onboardingSignupButton?: ButtonProps<'button'>;
}

const isWebView = () => {
  const { userAgent } = navigator;

  // Define patterns for detecting in-app browsers and devices
  const inAppBrowserPatterns = [
    /FBAN|FBAV/i, // Facebook
    /Instagram/i, // Instagram
    /Twitter/i, // Twitter
    /Line/i, // LINE Messenger
    /LinkedIn/i, // LinkedIn
    /Snapchat/i, // Snapchat
    /WhatsApp/i, // WhatsApp
    /WeChat/i, // WeChat
    /Messenger/i, // Facebook Messenger
    /QQ/i, // QQ Browser
    /Reddit/i, // Reddit
    /Puffin/i, // Puffin Browser
    /TikTok/i, // TikTok
    /musical.ly/i, // TikTok (older)
    /YouTube/i, // YouTube
    /Pinterest/i, // Pinterest
    /Discord/i, // Discord
    /Telegram/i, // Telegram
    /Viber/i, // Viber
    /Slack/i, // Slack
    /Signal/i, // Signal,
    /KakaoTalk/i, // KakaoTalk (Popular in South Korea)
    /Baidu/i, // Baidu (Popular in China)
  ];

  // Advanced in-app detection (WebView or missing Safari)
  const advancedInAppDetection = () => {
    const rules = [
      'WebView', // Generic WebView detection
      '(iPhone|iPod|iPad)(?!.*Safari/)', // iOS WebView without Safari
      'Android.*(wv)', // Android WebView
      '(AppleWebKit)(?!.*Safari)', // iOS Safari WebView (missing Safari in UA)
    ];
    const regex = new RegExp(`(${rules.join('|')})`, 'ig');
    return !!userAgent.match(regex);
  };

  const isInAppBrowser = inAppBrowserPatterns.some((pattern) =>
    pattern.test(userAgent),
  );

  return isInAppBrowser || advancedInAppDetection();
};

const getSignupProviders = () => {
  if (isIOSNative()) {
    return [providerMap.google, providerMap.apple];
  }
  if (isWebView()) {
    return [providerMap.github];
  }
  return [providerMap.google, providerMap.github];
};

export interface UseCheckExistingEmail {
  email: {
    value: string;
    alreadyExists: boolean;
    isCheckPending: boolean;
  };
  onEmailSignup: (e: React.FormEvent) => Promise<{
    emailExists: boolean;
    emailValue: string;
  } | null>;
}

export const useCheckExistingEmail = ({
  onSignup,
  targetId,
  trigger,
}: Pick<
  OnboardingRegistrationFormProps,
  'onSignup' | 'trigger' | 'targetId'
>): UseCheckExistingEmail => {
  const [shouldLogin, setShouldLogin] = useState(false);
  const [registerEmail, setRegisterEmail] = useState<string>(null);
  const { logEvent } = useLogContext();
  const { mutateAsync: checkEmail, isPending: isCheckPending } = useMutation({
    mutationFn: (emailParam: string) => checkKratosEmail(emailParam),
    onSuccess: (res, emailValue) => {
      const emailExists = !!res?.result;

      setShouldLogin(emailExists);
      logEvent({
        event_name: emailExists
          ? AuthEventNames.OpenLogin
          : AuthEventNames.OpenSignup,
        extra: JSON.stringify({ trigger }),
        target_id: targetId,
      });

      if (emailExists) {
        setRegisterEmail(emailValue);
        return null;
      }

      return onSignup(emailValue);
    },
  });

  const onEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailValue = getFormEmail(e);
    if (isCheckPending || !emailValue) {
      return null;
    }

    logEvent({
      event_name: 'click',
      target_type: AuthEventNames.SignUpProvider,
      target_id: 'email',
      extra: JSON.stringify({ trigger }),
    });

    const res = await checkEmail(emailValue);
    const emailExists = !!res?.result;
    return { emailExists, emailValue };
  };

  return {
    email: {
      alreadyExists: shouldLogin,
      isCheckPending,
      value: registerEmail,
    },
    onEmailSignup,
  };
};

export const OnboardingRegistrationForm = ({
  onSignup,
  onExistingEmail,
  onProviderClick,
  targetId,
  isReady,
  trigger,
  className,
  onboardingSignupButton,
}: OnboardingRegistrationFormProps): ReactElement => {
  const { email, onEmailSignup } = useCheckExistingEmail({
    onSignup,
    targetId,
    trigger,
  });
  const onboardingSignupButtonProps = {
    size: ButtonSize.Large,
    variant: ButtonVariant.Primary,
    ...onboardingSignupButton,
  };

  const onSocialClick = (provider: string) => {
    onProviderClick?.(provider, email.alreadyExists);
  };

  return (
    <>
      <AuthForm
        className={classNames('mb-8 gap-8', className?.onboardingForm)}
        onSubmit={onEmailSignup}
        aria-label={email.alreadyExists ? 'Login form' : 'Signup form'}
      >
        <TextField
          leftIcon={
            <MailIcon aria-hidden role="presentation" size={IconSize.Small} />
          }
          required
          inputId="email"
          label="Email"
          type="email"
          name="email"
          focused
          pressed
          className={{ container: 'bg-overlay-active-salt' }}
        />

        {email.alreadyExists && (
          <>
            <Alert type={AlertType.Error} flexDirection="flex-row">
              <AlertParagraph className="!mt-0 flex-1">
                Email is taken. Existing user?{' '}
                <button
                  type="button"
                  onClick={() => {
                    onExistingEmail(email.value);
                  }}
                  className="font-bold underline"
                >
                  Log in.
                </button>
              </AlertParagraph>
            </Alert>
          </>
        )}

        <Button
          className="w-full"
          loading={!isReady || email.isCheckPending}
          type="submit"
          variant={ButtonVariant.Primary}
        >
          Sign up - Free forever ➔
        </Button>
      </AuthForm>
      <OrDivider
        className={{
          container: classNames('mb-8', className?.onboardingDivider),
          text: 'text-text-tertiary',
        }}
        label="Or sign up with"
        aria-hidden
      />
      <div
        aria-label="Social login buttons"
        className={classNames(
          'flex flex-col gap-8 pb-8',
          className.onboardingSignup,
        )}
        role="list"
      >
        {getSignupProviders().map((provider) => (
          <Button
            aria-label={`${email.alreadyExists ? 'Login' : 'Signup'} using ${
              provider.label
            }`}
            icon={provider.icon}
            key={provider.value}
            loading={!isReady}
            onClick={() => onSocialClick(provider.value)}
            {...onboardingSignupButtonProps}
          >
            {provider.label}
          </Button>
        ))}
      </div>
    </>
  );
};

export const TermAndPrivacy = (): ReactElement => (
  <Typography color={TypographyColor.Tertiary} type={TypographyType.Footnote}>
    By continuing, you agree to the{' '}
    <Typography
      className="underline hover:no-underline"
      color={TypographyColor.Tertiary}
      href={termsOfService}
      rel="noopener"
      tag={TypographyTag.Link}
      target="_blank"
    >
      Terms of Service
    </Typography>{' '}
    and{' '}
    <Typography
      className="underline hover:no-underline"
      color={TypographyColor.Tertiary}
      href={cookiePolicy}
      rel="noopener"
      tag={TypographyTag.Link}
      target="_blank"
    >
      Privacy Policy
    </Typography>
    .
  </Typography>
);

const AlreadySignedLogin = ({ onClickLogin }: { onClickLogin: () => void }) => (
  <Typography
    className="mt-6"
    color={TypographyColor.Secondary}
    type={TypographyType.Callout}
  >
    Already have an account?{' '}
    <ClickableText
      className="!inline-flex !text-inherit"
      defaultTypo={false}
      inverseUnderline
      onClick={onClickLogin}
      type="button"
    >
      Log in
    </ClickableText>
  </Typography>
);

export const OnboardingRegistrationFormExperiment = ({
  isReady,
  onContinueWithEmail,
  onExistingEmail,
  onProviderClick,
  targetId,
  trigger,
}: OnboardingRegistrationFormProps): ReactElement => {
  const { logEvent } = useLogContext();
  useEffect(() => {
    logEvent({
      event_name: AuthEventNames.OpenSignup,
      extra: JSON.stringify({ trigger }),
      target_id: targetId,
    });
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div aria-label="Login/Register options" className="flex flex-col gap-4">
      <ul aria-label="Social login buttons" className="flex flex-col gap-4">
        {getSignupProviders().map((provider) => (
          <li key={provider.value}>
            <Button
              aria-label={`Continue using ${provider.label}`}
              className="w-full"
              icon={provider.icon}
              loading={!isReady}
              onClick={() => onProviderClick?.(provider.value, false)}
              size={ButtonSize.Large}
              type="button"
              variant={ButtonVariant.Primary}
            >
              Continue with {provider.label}
            </Button>
          </li>
        ))}
      </ul>
      <OrDivider
        className={{
          text: 'text-text-tertiary typo-footnote',
        }}
        label="OR"
      />
      <div className="flex flex-col-reverse text-center">
        <AlreadySignedLogin onClickLogin={() => onExistingEmail?.('')} />
        <TermAndPrivacy />
        <Button
          aria-label="Signup using email"
          className="mb-8"
          onClick={onContinueWithEmail}
          size={ButtonSize.Large}
          variant={ButtonVariant.Secondary}
        >
          Continue with email
        </Button>
      </div>
    </div>
  );
};

export default OnboardingRegistrationForm;

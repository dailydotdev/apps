import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import classNames from 'classnames';
import type { AuthFormProps } from './common';
import { providerMap } from './common';
import OrDivider from './OrDivider';
import { useLogContext } from '../../contexts/LogContext';
import type { AuthTriggersType } from '../../lib/auth';
import { AuthEventNames, AuthTriggers } from '../../lib/auth';
import type { ButtonProps } from '../buttons/Button';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { isIOSNative } from '../../lib/func';

import { MemberAlready } from '../onboarding/MemberAlready';
import SignupDisclaimer from './SignupDisclaimer';
import { FunnelTargetId } from '../../features/onboarding/types/funnelEvents';

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
  isSocialAuthLoading?: boolean;
  className?: ClassName;
  onboardingSignupButton?: ButtonProps<'button'>;
  hideLoginLink?: boolean;
  compact?: boolean;
  splitSignupStyle?: boolean;
  preferGithub?: boolean;
}

export const isWebView = (): boolean => {
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

const getSignupProviders = (preferGithub: boolean) => {
  if (isIOSNative()) {
    return [providerMap.google, providerMap.apple];
  }
  if (isWebView()) {
    return [providerMap.github];
  }
  // Developer-first audiences convert better when GitHub leads the OAuth list.
  return preferGithub
    ? [providerMap.github, providerMap.google]
    : [providerMap.google, providerMap.github];
};

export const OnboardingRegistrationForm = ({
  isReady,
  isSocialAuthLoading,
  onContinueWithEmail,
  onExistingEmail,
  onProviderClick,
  targetId,
  trigger,
  onboardingSignupButton,
  hideLoginLink,
  compact,
  splitSignupStyle = false,
  preferGithub,
}: OnboardingRegistrationFormProps): ReactElement => {
  const { logEvent } = useLogContext();
  const isOnboardingTrigger = trigger === AuthTriggers.Onboarding;
  const signupProviders = getSignupProviders(
    preferGithub ?? isOnboardingTrigger,
  );

  const trackOpenSignup = () => {
    logEvent({
      event_name: 'click',
      target_type: AuthEventNames.SignUpProvider,
      target_id: 'email',
      extra: JSON.stringify({ trigger }),
    });
  };

  useEffect(() => {
    logEvent({
      event_name: AuthEventNames.OpenSignup,
      extra: JSON.stringify({ trigger }),
      target_id: targetId,
    });
    // Need to run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tertiarySignupButtonClass =
    '!w-full !border !border-border-subtlest-tertiary !text-white';

  const getEmailButtonClass = (): string => {
    if (compact) {
      return 'mb-4';
    }
    if (isOnboardingTrigger && !splitSignupStyle) {
      return 'mb-3';
    }
    return 'mb-8';
  };

  const emailButtonLabel = splitSignupStyle
    ? 'Create account'
    : 'Continue with email';

  const emailButton = (
    <Button
      aria-label={splitSignupStyle ? 'Create account' : 'Signup using email'}
      className={classNames(
        getEmailButtonClass(),
        (isOnboardingTrigger || splitSignupStyle) && tertiarySignupButtonClass,
      )}
      data-funnel-track={FunnelTargetId.SignupProvider}
      disabled={isSocialAuthLoading}
      onClick={() => {
        trackOpenSignup();
        onContinueWithEmail?.();
      }}
      size={onboardingSignupButton?.size ?? ButtonSize.Large}
      type="button"
      variant={
        isOnboardingTrigger || splitSignupStyle
          ? ButtonVariant.Tertiary
          : ButtonVariant.Float
      }
    >
      {emailButtonLabel}
    </Button>
  );

  const getMemberAlreadyContainerClass = (): string => {
    if (isOnboardingTrigger) {
      return 'mx-auto mt-5 text-center text-text-secondary typo-callout';
    }
    return 'mx-auto mt-6 text-center text-text-secondary typo-callout';
  };

  const memberAlready = !hideLoginLink && !splitSignupStyle && (
    <MemberAlready
      onLogin={() => onExistingEmail?.('')}
      className={{
        container: getMemberAlreadyContainerClass(),
        login: '!text-inherit',
      }}
    />
  );

  const splitSignInSection = splitSignupStyle && !hideLoginLink && (
    <div className="mt-2 flex w-full flex-col items-start gap-3">
      <p className="text-left text-text-secondary typo-callout">
        Already have an account?
      </p>
      <Button
        aria-label="Sign in"
        className={tertiarySignupButtonClass}
        onClick={() => onExistingEmail?.('')}
        size={onboardingSignupButton?.size ?? ButtonSize.Large}
        type="button"
        variant={ButtonVariant.Tertiary}
      >
        Sign in
      </Button>
    </div>
  );
  const disclaimer = (
    <SignupDisclaimer className="!text-text-tertiary tablet:!typo-footnote" />
  );

  return (
    <div aria-label="Login/Register options" className="flex flex-col gap-4">
      <ul aria-label="Social login buttons" className="flex flex-col gap-4">
        {signupProviders.map((provider) => (
          <li key={provider.value}>
            <Button
              aria-label={
                splitSignupStyle
                  ? `Sign up with ${provider.label}`
                  : `Continue with ${provider.label}`
              }
              className="w-full"
              data-funnel-track={FunnelTargetId.SignupProvider}
              disabled={!isReady || isSocialAuthLoading}
              icon={provider.icon}
              loading={!isReady || isSocialAuthLoading}
              onClick={() => onProviderClick?.(provider.value, false)}
              size={onboardingSignupButton?.size ?? ButtonSize.Large}
              type="button"
              variant={onboardingSignupButton?.variant ?? ButtonVariant.Primary}
            >
              {splitSignupStyle
                ? `Sign up with ${provider.label}`
                : `Continue with ${provider.label}`}
            </Button>
          </li>
        ))}
      </ul>
      <OrDivider
        className={{
          text: 'text-text-tertiary typo-footnote',
        }}
        label={isOnboardingTrigger ? 'or' : 'OR'}
      />
      {isOnboardingTrigger ? (
        <div
          className={classNames(
            'flex flex-col',
            splitSignupStyle ? 'items-start text-left' : 'text-center',
          )}
        >
          {emailButton}
          {splitSignInSection}
          {memberAlready}
        </div>
      ) : (
        <div className="flex flex-col-reverse text-center">
          {memberAlready}
          {disclaimer}
          {emailButton}
        </div>
      )}
    </div>
  );
};

export default OnboardingRegistrationForm;

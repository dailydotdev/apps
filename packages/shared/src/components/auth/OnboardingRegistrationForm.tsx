import type { ReactElement } from 'react';
import React, { cloneElement, useEffect } from 'react';
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
import { IconSize } from '../Icon';

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
  hideSignupDisclaimer?: boolean;
  compact?: boolean;
  splitSignupStyle?: boolean;
  preferGithub?: boolean;
  onAuthOpenLogged?: () => void;
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
  hideSignupDisclaimer,
  compact,
  splitSignupStyle = false,
  preferGithub,
  onAuthOpenLogged,
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

    onAuthOpenLogged?.();
    // Need to run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // text-primary, not white: this button sits on the page background, which is
  // light in light mode — white label on it is invisible
  const tertiarySignupButtonClass =
    '!w-full !border !border-border-subtlest-tertiary !text-text-primary';

  const getEmailButtonClass = (): string => {
    if (compact) {
      return 'mb-4';
    }
    // This margin, not the login link's own, is most of the gap between the CTA
    // and "Already have an account". onb-split-cta lets the signup hero close
    // it further on compact phones.
    if (splitSignupStyle) {
      return 'onb-split-cta mb-4';
    }
    if (isOnboardingTrigger) {
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
    // Stacked, the split layouts have no footer/disclaimer strip under them, so
    // this centres like the cards/desk walls. The form is bottom-anchored
    // there, so the tight gap is what pushes the buttons down the screen.
    // Once the columns appear it follows the left-aligned column edge again.
    // onb-split-login is a styling hook for the signup hero: it tightens this
    // row on compact phones. Inert anywhere the hero's CSS is not present.
    if (splitSignupStyle) {
      return 'onb-split-login mx-auto mt-4 text-center text-text-secondary typo-callout laptop:mx-0 laptop:mt-5 laptop:text-left';
    }
    if (isOnboardingTrigger) {
      return 'mx-auto mt-5 text-center text-text-secondary typo-callout';
    }
    return 'mx-auto mt-6 text-center text-text-secondary typo-callout';
  };

  const memberAlready = !hideLoginLink && (
    <MemberAlready
      onLogin={() => onExistingEmail?.('')}
      className={{
        container: getMemberAlreadyContainerClass(),
        login: '!text-inherit',
      }}
    />
  );

  const disclaimer = hideSignupDisclaimer ? null : (
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
              icon={
                // A Large button gives its icon IconSize.Large (32px); the
                // split layouts want the brand marks a notch smaller so they
                // sit closer to the label's weight. Next step down the scale
                // rather than an arbitrary size.
                splitSignupStyle
                  ? cloneElement(provider.icon, { size: IconSize.Medium })
                  : provider.icon
              }
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

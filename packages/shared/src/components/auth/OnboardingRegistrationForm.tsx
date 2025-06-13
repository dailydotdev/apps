import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import type { AuthFormProps } from './common';
import { providerMap } from './common';
import OrDivider from './OrDivider';
import { useLogContext } from '../../contexts/LogContext';
import type { AuthTriggersType } from '../../lib/auth';
import { AuthEventNames } from '../../lib/auth';
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
  className?: ClassName;
  onboardingSignupButton?: ButtonProps<'button'>;
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

const getSignupProviders = () => {
  if (isIOSNative()) {
    return [providerMap.google, providerMap.apple];
  }
  if (isWebView()) {
    return [providerMap.github];
  }
  return [providerMap.google, providerMap.github];
};

export const OnboardingRegistrationForm = ({
  isReady,
  onContinueWithEmail,
  onExistingEmail,
  onProviderClick,
  targetId,
  trigger,
}: OnboardingRegistrationFormProps): ReactElement => {
  const { logEvent } = useLogContext();

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

  return (
    <div aria-label="Login/Register options" className="flex flex-col gap-4">
      <ul aria-label="Social login buttons" className="flex flex-col gap-4">
        {getSignupProviders().map((provider) => (
          <li key={provider.value}>
            <Button
              aria-label={`Continue using ${provider.label}`}
              className="w-full"
              data-funnel-track={FunnelTargetId.SignupProvider}
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
        <MemberAlready
          onLogin={() => onExistingEmail?.('')}
          className={{
            container:
              'mx-auto mt-6 text-center text-text-secondary typo-callout',
            login: '!text-inherit',
          }}
        />
        <SignupDisclaimer className="!text-text-tertiary !typo-footnote" />
        <Button
          aria-label="Signup using email"
          className="mb-8"
          data-funnel-track={FunnelTargetId.SignupProvider}
          onClick={() => {
            trackOpenSignup();
            onContinueWithEmail?.();
          }}
          size={ButtonSize.Large}
          variant={ButtonVariant.Float}
        >
          Continue with email
        </Button>
      </div>
    </div>
  );
};

export default OnboardingRegistrationForm;

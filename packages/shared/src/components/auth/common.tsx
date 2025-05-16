import type { MutableRefObject } from 'react';
import React from 'react';
import { FacebookIcon, GoogleIcon, GitHubIcon, AppleIcon } from '../icons';
import classed from '../../lib/classed';
import type { IconType, ButtonProps } from '../buttons/Button';
import type { CloseAuthModalFunc } from '../../hooks/useAuthForms';
import type { AnonymousUser, LoggedUser } from '../../lib/user';
import type { AuthTriggersType } from '../../lib/auth';

export interface Provider {
  icon: IconType;
  label: string;
  value: string;
}

export const AFTER_AUTH_PARAM = 'after_auth';

export enum SocialProvider {
  // Twitter = 'twitter',
  Facebook = 'facebook',
  Google = 'google',
  GitHub = 'github',
  Apple = 'apple',
}

type ProviderMap = Record<SocialProvider, Provider>;

export const providerMap: ProviderMap = {
  // twitter: {
  //   icon: <TwitterIcon />,
  //   provider: 'Twitter',
  //   style: { backgroundColor: '#1D9BF0' },
  // },
  facebook: {
    icon: <FacebookIcon className="socialIcon" secondary />,
    label: 'Facebook',
    value: 'facebook',
  },
  google: {
    icon: <GoogleIcon className="socialIcon" secondary />,
    label: 'Google',
    value: 'google',
  },
  github: {
    icon: <GitHubIcon className="socialIcon" secondary />,
    label: 'GitHub',
    value: 'github',
  },
  apple: {
    icon: <AppleIcon className="socialIcon" secondary />,
    label: 'Apple',
    value: 'apple',
  },
};

export const providers: Provider[] = Object.values(providerMap);

export const AuthModalText = classed('p', 'typo-body text-text-secondary');

export interface AuthFormProps {
  simplified?: boolean;
}

export const getFormEmail = (e: React.FormEvent): string => {
  const form = e.currentTarget as HTMLFormElement;
  const input = Array.from(form.elements).find((el) =>
    ['email', 'traits.email'].includes(el.getAttribute('name')),
  ) as HTMLInputElement;

  return input?.value?.trim();
};

export enum AuthDisplay {
  Default = 'default',
  Registration = 'registration',
  SocialRegistration = 'social_registration',
  SignBack = 'sign_back',
  ForgotPassword = 'forgot_password',
  CodeVerification = 'code_verification',
  ChangePassword = 'change_password',
  OnboardingSignup = 'onboarding_signup',
  EmailVerification = 'email_verification',
}

export enum OnboardingActions {
  ChangePassword = 'changePassword',
  Login = 'login',
  Recover = 'recover',
  Signup = 'signup',
}

export const actionToAuthDisplay: Record<OnboardingActions, AuthDisplay> = {
  [OnboardingActions.ChangePassword]: AuthDisplay.ChangePassword,
  [OnboardingActions.Login]: AuthDisplay.Default,
  [OnboardingActions.Recover]: AuthDisplay.ForgotPassword,
  [OnboardingActions.Signup]: AuthDisplay.Default,
} as const;

export interface AuthProps {
  isAuthenticating: boolean;
  isLoginFlow: boolean;
  isLoading?: boolean;
  email?: string;
  defaultDisplay?: AuthDisplay;
}

interface ClassName {
  container?: string;
  onboardingSignup?: string;
  onboardingForm?: string;
  onboardingDivider?: string;
}

export interface AuthOptionsProps {
  onClose?: CloseAuthModalFunc;
  onAuthStateUpdate?: (props: Partial<AuthProps>) => void;
  onSuccessfulLogin?: () => unknown;
  onSuccessfulRegistration?: (user?: LoggedUser | AnonymousUser) => unknown;
  formRef: MutableRefObject<HTMLFormElement>;
  trigger: AuthTriggersType;
  defaultDisplay?: AuthDisplay;
  forceDefaultDisplay?: boolean;
  className?: ClassName;
  simplified?: boolean;
  isLoginFlow?: boolean;
  onDisplayChange?: (value: string) => void;
  initialEmail?: string;
  targetId?: string;
  ignoreMessages?: boolean;
  onboardingSignupButton?: ButtonProps<'button'>;
}

import React, {
  MutableRefObject,
  ReactElement,
  useEffect,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { useAuthContext } from '../../contexts/AuthContext';
import { Tab, TabContainer } from '../tabs/TabContainer';
import { RegistrationFormValues } from './RegistrationForm';
import {
  AuthEventNames,
  AuthTriggersType,
  getNodeValue,
  RegistrationError,
} from '../../lib/auth';
import useRegistration from '../../hooks/useRegistration';
import {
  AuthEvent,
  AuthFlow,
  KRATOS_ERROR,
  getKratosFlow,
  getKratosProviders,
} from '../../lib/kratos';
import { storageWrapper as storage } from '../../lib/storageWrapper';
import { providers } from './common';
import useLogin from '../../hooks/useLogin';
import useProfileForm from '../../hooks/useProfileForm';
import { CloseAuthModalFunc } from '../../hooks/useAuthForms';
import { useLogContext } from '../../contexts/LogContext';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { useToastNotification, useEventListener } from '../../hooks';
import { isTesting } from '../../lib/constants';
import {
  SignBackProvider,
  SIGNIN_METHOD_KEY,
  useSignBack,
} from '../../hooks/auth/useSignBack';
import { AnonymousUser, LoggedUser } from '../../lib/user';
import { labels } from '../../lib';
import { ButtonProps } from '../buttons/Button';
import usePersistentState from '../../hooks/usePersistentState';

const AuthDefault = dynamic(
  () => import(/* webpackChunkName: "authDefault" */ './AuthDefault'),
);

const SocialRegistrationForm = dynamic(() =>
  import(
    /* webpackChunkName: "socialRegistrationForm" */ './SocialRegistrationForm'
  ).then((mod) => mod.SocialRegistrationForm),
);

const RegistrationForm = dynamic(
  () => import(/* webpackChunkName: "registrationForm" */ './RegistrationForm'),
);

const OnboardingRegistrationForm = dynamic(
  () =>
    import(
      /* webpackChunkName: "onboardingRegistrationForm" */ './OnboardingRegistrationForm'
    ),
);

const AuthSignBack = dynamic(() =>
  import(/* webpackChunkName: "authSignBack" */ './AuthSignBack').then(
    (mod) => mod.AuthSignBack,
  ),
);

const ForgotPasswordForm = dynamic(
  () =>
    import(/* webpackChunkName: "forgotPasswordForm" */ './ForgotPasswordForm'),
);

const CodeVerificationForm = dynamic(
  () =>
    import(
      /* webpackChunkName: "codeVerificationForm" */ './CodeVerificationForm'
    ),
);

const ChangePasswordForm = dynamic(
  () =>
    import(/* webpackChunkName: "changePasswordForm" */ './ChangePasswordForm'),
);

const AuthHeader = dynamic(
  () => import(/* webpackChunkName: "authHeader" */ './AuthHeader'),
);

const EmailCodeVerification = dynamic(
  () =>
    import(
      /* webpackChunkName: "emailCodeVerification" */ './EmailCodeVerification'
    ),
);

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

const CHOSEN_PROVIDER_KEY = 'chosen_provider';

function AuthOptions({
  onClose,
  onAuthStateUpdate,
  onSuccessfulLogin,
  onSuccessfulRegistration,
  className = {},
  formRef,
  trigger,
  defaultDisplay = AuthDisplay.Default,
  forceDefaultDisplay,
  onDisplayChange,
  isLoginFlow,
  targetId,
  simplified = false,
  initialEmail = '',
  ignoreMessages = false,
  onboardingSignupButton,
}: AuthOptionsProps): ReactElement {
  const { displayToast } = useToastNotification();
  const { syncSettings } = useSettingsContext();
  const { logEvent } = useLogContext();
  const [isConnected, setIsConnected] = useState(false);
  const [registrationHints, setRegistrationHints] = useState<RegistrationError>(
    {},
  );
  const { refetchBoot, user } = useAuthContext();
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const [flow, setFlow] = useState('');
  const [activeDisplay, setActiveDisplay] = useState(() =>
    storage.getItem(SIGNIN_METHOD_KEY) && !forceDefaultDisplay
      ? AuthDisplay.SignBack
      : defaultDisplay,
  );

  const onSetActiveDisplay = (display: AuthDisplay) => {
    onDisplayChange?.(display);
    onAuthStateUpdate?.({ isLoading: false });
    setActiveDisplay(display);
  };

  const [isForgotPasswordReturn, setIsForgotPasswordReturn] = useState(false);
  const [handleLoginCheck, setHandleLoginCheck] = useState<boolean>(null);
  const [chosenProvider, setChosenProvider] = usePersistentState(
    CHOSEN_PROVIDER_KEY,
    null,
  );
  const [isRegistration, setIsRegistration] = useState(false);
  const windowPopup = useRef<Window>(null);
  const onLoginCheck = (shouldVerify?: boolean) => {
    if (shouldVerify) {
      onSetActiveDisplay(AuthDisplay.EmailVerification);
      return;
    }
    if (isRegistration) {
      return;
    }

    if (!user || handleLoginCheck === false) {
      return;
    }

    setHandleLoginCheck(handleLoginCheck === null);

    if (user.infoConfirmed) {
      logEvent({
        event_name: AuthEventNames.LoginSuccessfully,
      });
      onSuccessfulLogin?.();
    } else {
      onSetActiveDisplay(AuthDisplay.SocialRegistration);
    }
  };

  useEffect(() => {
    onLoginCheck();
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const { onUpdateSignBack: onSignBackLogin } = useSignBack();
  const {
    isReady: isRegistrationReady,
    registration,
    verificationFlowId,
    validateRegistration,
    onSocialRegistration,
  } = useRegistration({
    key: ['registration_form'],
    onInitializeVerification: () => {
      onSetActiveDisplay(AuthDisplay.EmailVerification);
    },
    onInvalidRegistration: setRegistrationHints,
    onRedirectFail: () => {
      windowPopup.current.close();
      windowPopup.current = null;
    },
    onRedirect: (redirect) => {
      windowPopup.current.location.href = redirect;
    },
  });

  const {
    isReady: isLoginReady,
    loginHint,
    onPasswordLogin,
    isPasswordLoginLoading,
  } = useLogin({
    onSuccessfulLogin: onLoginCheck,
    ...(!isTesting && { queryEnabled: !user && isRegistrationReady }),
    trigger,
    provider: chosenProvider,
    onLoginError: () => {
      return displayToast(labels.auth.error.generic);
    },
  });
  const onProfileSuccess = async (options: { redirect?: string } = {}) => {
    setIsRegistration(true);
    const { redirect } = options;
    const { data } = await refetchBoot();

    if (data.user) {
      const provider = chosenProvider || 'password';
      onSignBackLogin(data.user as LoggedUser, provider as SignBackProvider);
    }

    logEvent({
      event_name: AuthEventNames.SignupSuccessfully,
    });

    // if redirect is set move before modal close
    if (redirect) {
      await router.push(redirect);
    }

    onSuccessfulRegistration?.(data?.user);
    onClose?.(null, true);
  };
  const {
    updateUserProfile,
    hint,
    onUpdateHint,
    isLoading: isProfileUpdateLoading,
  } = useProfileForm({ onSuccess: onProfileSuccess });

  const isReady = isTesting ? true : isLoginReady && isRegistrationReady;
  const onProviderClick = async (provider: string, login = true) => {
    logEvent({
      event_name: 'click',
      target_type: login
        ? AuthEventNames?.LoginProvider
        : AuthEventNames.SignUpProvider,
      target_id: provider,
      extra: JSON.stringify({ trigger }),
    });
    windowPopup.current = window.open();
    setChosenProvider(provider);
    await onSocialRegistration(provider);
    onAuthStateUpdate?.({ isLoading: true });
  };

  const onForgotPasswordSubmit = (inputEmail: string, inputFlow: string) => {
    setEmail(inputEmail);
    setFlow(inputFlow);
    onSetActiveDisplay(AuthDisplay.CodeVerification);
  };

  useEventListener(globalThis, 'message', async (e) => {
    if (e.data?.eventKey !== AuthEvent.SocialRegistration || ignoreMessages) {
      return undefined;
    }

    if (e.data?.flow) {
      const connected = await getKratosFlow(AuthFlow.Registration, e.data.flow);

      logEvent({
        event_name: AuthEventNames.RegistrationError,
        extra: JSON.stringify({
          error: {
            flowId: connected?.id,
            messages: connected?.ui?.messages,
          },
          origin: 'window registration flow error',
        }),
      });

      if (
        [
          KRATOS_ERROR.NO_STRATEGY_TO_LOGIN,
          KRATOS_ERROR.NO_STRATEGY_TO_SIGNUP,
          KRATOS_ERROR.EXISTING_USER,
        ].includes(connected?.ui?.messages?.[0]?.id)
      ) {
        const registerUser = {
          name: getNodeValue('traits.name', connected.ui.nodes),
          email: getNodeValue('traits.email', connected.ui.nodes),
          image: getNodeValue('traits.image', connected.ui.nodes),
        };
        const { result } = await getKratosProviders(connected.id);
        setIsConnected(true);
        await onSignBackLogin(registerUser, result[0] as SignBackProvider);
        return onSetActiveDisplay(AuthDisplay.SignBack);
      }

      return displayToast(labels.auth.error.generic);
    }
    const bootResponse = await refetchBoot();
    if (!bootResponse.data.user || !('email' in bootResponse.data.user)) {
      logEvent({
        event_name: AuthEventNames.SubmitSignUpFormError,
        extra: JSON.stringify({
          error: 'Could not find email on social registration',
        }),
      });
      return displayToast(labels.auth.error.generic);
    }

    if (!e.data?.social_registration) {
      const { data: boot } = bootResponse;

      if (boot.user) {
        onSignBackLogin(
          boot.user as LoggedUser,
          chosenProvider as SignBackProvider,
        );
      }

      return onSuccessfulLogin?.();
    }

    return onSetActiveDisplay(AuthDisplay.SocialRegistration);
  });

  const onEmailRegistration = (emailAd: string) => {
    // before displaying registration, ensure the email doesn't exist
    onSetActiveDisplay(AuthDisplay.Registration);
    setEmail(emailAd);
  };

  const onSocialCompletion = async (params) => {
    await updateUserProfile({ ...params });
    await syncSettings();
  };

  const onRegister = (params: RegistrationFormValues) => {
    validateRegistration({
      ...params,
      method: 'password',
    });
  };

  const onForgotPassword = (withEmail?: string) => {
    logEvent({
      event_name: 'click',
      target_type: AuthEventNames.ForgotPassword,
    });
    setEmail(withEmail);
    onSetActiveDisplay(AuthDisplay.ForgotPassword);
  };

  const onForgotPasswordBack = () => {
    setIsForgotPasswordReturn(true);
    onSetActiveDisplay(defaultDisplay);
  };

  return (
    <div
      className={classNames(
        'z-1 flex w-full max-w-[26.25rem] flex-col overflow-y-auto rounded-16',
        !simplified && 'bg-accent-pepper-subtlest',
        defaultDisplay === AuthDisplay.OnboardingSignup
          ? 'min-h-[21.25rem]'
          : undefined,
        className?.container,
      )}
    >
      <TabContainer<AuthDisplay>
        controlledActive={forceDefaultDisplay ? defaultDisplay : activeDisplay}
        onActiveChange={(active) => onSetActiveDisplay(active)}
        showHeader={false}
        shouldFocusTabOnChange
      >
        <Tab label={AuthDisplay.Default}>
          <AuthDefault
            isLoading={isPasswordLoginLoading}
            isLoginFlow={isForgotPasswordReturn || isLoginFlow}
            isReady={isReady}
            loginHint={loginHint}
            onForgotPassword={onForgotPassword}
            onPasswordLogin={onPasswordLogin}
            onProviderClick={onProviderClick}
            onSignup={onEmailRegistration}
            providers={providers}
            simplified={simplified}
            trigger={trigger}
          />
        </Tab>
        <Tab label={AuthDisplay.SocialRegistration}>
          <SocialRegistrationForm
            formRef={formRef}
            provider={chosenProvider}
            onSignup={onSocialCompletion}
            hints={hint}
            isLoading={isProfileUpdateLoading}
            onUpdateHints={onUpdateHint}
            trigger={trigger}
            simplified={simplified}
          />
        </Tab>
        <Tab label={AuthDisplay.Registration}>
          <RegistrationForm
            onBack={
              defaultDisplay !== AuthDisplay.Registration
                ? () => onSetActiveDisplay(defaultDisplay)
                : undefined
            }
            formRef={formRef}
            simplified={simplified}
            email={email}
            onSignup={onRegister}
            hints={registrationHints}
            onUpdateHints={setRegistrationHints}
            trigger={trigger}
            token={
              registration &&
              getNodeValue('csrf_token', registration?.ui?.nodes)
            }
          />
        </Tab>
        <Tab label={AuthDisplay.OnboardingSignup}>
          <OnboardingRegistrationForm
            onSignup={(signupEmail) => {
              onAuthStateUpdate({
                isAuthenticating: true,
                email: signupEmail,
                defaultDisplay: AuthDisplay.Registration,
              });
            }}
            onExistingEmail={(existingEmail) => {
              onAuthStateUpdate({
                isAuthenticating: true,
                isLoginFlow: true,
                email: existingEmail,
              });
            }}
            onProviderClick={onProviderClick}
            trigger={trigger}
            isReady={isReady}
            simplified={simplified}
            targetId={targetId}
            className={className}
            onboardingSignupButton={onboardingSignupButton}
          />
        </Tab>
        <Tab label={AuthDisplay.SignBack}>
          <AuthSignBack
            onRegister={() => {
              if (isLoginFlow) {
                onAuthStateUpdate?.({ isLoginFlow: false });
              }
              setIsConnected(false);
              onSetActiveDisplay(AuthDisplay.Default);
            }}
            isLoginFlow={isLoginFlow}
            isConnectedAccount={isConnected}
            onProviderClick={onProviderClick}
            simplified={simplified}
            onShowLoginOptions={() => {
              if (!isLoginFlow && onAuthStateUpdate) {
                onAuthStateUpdate({ isLoginFlow: true });
              }
              setIsConnected(false);
              setActiveDisplay(AuthDisplay.Default);
            }}
            loginFormProps={{
              isReady,
              loginHint,
              onPasswordLogin,
              onForgotPassword,
              isLoading: isPasswordLoginLoading,
              autoFocus: false,
              onSignup: onForgotPasswordBack,
              className: 'w-full',
            }}
          />
        </Tab>
        <Tab label={AuthDisplay.ForgotPassword}>
          <ForgotPasswordForm
            initialEmail={email}
            onBack={onForgotPasswordBack}
            onSubmit={onForgotPasswordSubmit}
            simplified={simplified}
          />
        </Tab>
        <Tab label={AuthDisplay.CodeVerification}>
          <CodeVerificationForm
            initialEmail={email}
            initialFlow={flow}
            onBack={onForgotPasswordBack}
            onSubmit={() => setActiveDisplay(AuthDisplay.ChangePassword)}
            simplified={simplified}
          />
        </Tab>
        <Tab label={AuthDisplay.ChangePassword}>
          <ChangePasswordForm
            onSubmit={() => onProfileSuccess({ redirect: '/' })}
            simplified={simplified}
          />
        </Tab>
        <Tab label={AuthDisplay.EmailVerification}>
          <AuthHeader simplified={simplified} title="Verify your email" />
          <EmailCodeVerification
            email={email}
            flowId={verificationFlowId}
            onSubmit={onProfileSuccess}
          />
        </Tab>
      </TabContainer>
    </div>
  );
}

export default AuthOptions;

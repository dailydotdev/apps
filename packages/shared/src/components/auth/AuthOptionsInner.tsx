import type { ReactElement } from 'react';
import React, { useMemo, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { useAtomValue } from 'jotai';
import { useAuthContext } from '../../contexts/AuthContext';
import { Tab, TabContainer } from '../tabs/TabContainer';
import type { RegistrationFormValues } from './RegistrationForm';
import type { RegistrationError } from '../../lib/auth';
import {
  isNativeAuthSupported,
  AuthEventNames,
  getNodeValue,
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
import type { AuthOptionsProps } from './common';
import { AuthDisplay, providers } from './common';
import useLogin from '../../hooks/useLogin';
import useProfileForm from '../../hooks/useProfileForm';
import { useLogContext } from '../../contexts/LogContext';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { useToastNotification, useEventListener } from '../../hooks';
import { broadcastChannel, isTesting } from '../../lib/constants';
import type { SignBackProvider } from '../../hooks/auth/useSignBack';
import { SIGNIN_METHOD_KEY, useSignBack } from '../../hooks/auth/useSignBack';
import type { LoggedUser } from '../../lib/user';
import { labels } from '../../lib';
import usePersistentState from '../../hooks/usePersistentState';
import { IconSize } from '../Icon';
import { MailIcon } from '../icons';
import { usePixelsContext } from '../../contexts/PixelsContext';
import { useAuthData } from '../../contexts/AuthDataContext';
import { authAtom } from '../../features/onboarding/store/onboarding.store';

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

const OnboardingRegistrationForm = dynamic(() =>
  import(
    /* webpackChunkName: "onboardingRegistrationForm" */ './OnboardingRegistrationForm'
  ).then((mod) => mod.OnboardingRegistrationForm),
);

const OnboardingRegistrationFormExperiment = dynamic(() =>
  import(
    /* webpackChunkName: "onboardingRegistrationFormExperiment" */ './OnboardingRegistrationForm'
  ).then((mod) => mod.OnboardingRegistrationFormExperiment),
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

const CHOSEN_PROVIDER_KEY = 'chosen_provider';

function AuthOptionsInner({
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
  ignoreMessages = false,
  onboardingSignupButton,
}: AuthOptionsProps): ReactElement {
  const { displayToast } = useToastNotification();
  const { syncSettings } = useSettingsContext();
  const { trackSignup } = usePixelsContext();
  const { logEvent } = useLogContext();
  const [isConnected, setIsConnected] = useState(false);
  const [registrationHints, setRegistrationHints] = useState<RegistrationError>(
    {},
  );
  const { refetchBoot, user, isFunnel } = useAuthContext();
  const router = useRouter();
  const isOnboardingOrFunnel =
    !!router?.pathname?.startsWith('/onboarding') || isFunnel;
  const { isAuthenticating = false } = useAtomValue(authAtom);
  const [flow, setFlow] = useState('');
  const [activeDisplay, setActiveDisplay] = useState(() =>
    storage.getItem(SIGNIN_METHOD_KEY) && !forceDefaultDisplay
      ? AuthDisplay.SignBack
      : defaultDisplay,
  );

  const { setEmail } = useAuthData();

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
    keepSession: isOnboardingOrFunnel,
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
    const loggedUser = data?.user as LoggedUser;
    trackSignup(loggedUser);

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
    // Only web auth requires a popup
    if (!isNativeAuthSupported(provider)) {
      windowPopup.current = window.open();
    }
    setChosenProvider(provider);
    await onSocialRegistration(provider);
    onAuthStateUpdate?.({ isLoading: true });
  };

  const onForgotPasswordSubmit = (inputEmail: string, inputFlow: string) => {
    setEmail(inputEmail);
    setFlow(inputFlow);
    onSetActiveDisplay(AuthDisplay.CodeVerification);
  };

  const onProviderMessage = async (e: MessageEvent) => {
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
        // Native auth doesn't return traits, so we must validate that it exists
        if (registerUser.email) {
          const { result } = await getKratosProviders(connected.id);
          setIsConnected(true);
          await onSignBackLogin(registerUser, result[0] as SignBackProvider);
          return onSetActiveDisplay(AuthDisplay.SignBack);
        }
        onSetActiveDisplay(AuthDisplay.SignBack);
        return displayToast(labels.auth.error.existingEmail);
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

    const { data: boot } = bootResponse;

    // If user is confirmed we can proceed with logging them in
    if ('infoConfirmed' in boot.user && boot.user.infoConfirmed) {
      onSignBackLogin(
        boot.user as LoggedUser,
        chosenProvider as SignBackProvider,
      );
      return onSuccessfulLogin?.();
    }

    return onSetActiveDisplay(AuthDisplay.SocialRegistration);
  };

  useEventListener(broadcastChannel, 'message', onProviderMessage);

  useEventListener(globalThis, 'message', onProviderMessage);

  const onEmailRegistration = (emailAd: string) => {
    // before displaying registration, ensure the email doesn't exist
    onSetActiveDisplay(AuthDisplay.Registration);
    setEmail(emailAd);
  };

  const onSocialCompletion = async (params) => {
    await updateUserProfile({ ...params });
    await syncSettings();
  };

  const onRegister = async (params: RegistrationFormValues) => {
    await validateRegistration({
      ...params,
      method: 'password',
    });
    await setChosenProvider('password');
    await onProfileSuccess();
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
    const target = [
      AuthDisplay.ForgotPassword,
      AuthDisplay.CodeVerification,
    ].includes(defaultDisplay)
      ? AuthDisplay.Default
      : defaultDisplay;
    onSetActiveDisplay(target);
  };

  const onEmailLogin: typeof onPasswordLogin = (params) => {
    setEmail(params.identifier);
    onPasswordLogin(params);
  };

  const RegistrationFormComponent = useMemo(() => {
    return isOnboardingOrFunnel && !isAuthenticating
      ? OnboardingRegistrationFormExperiment
      : OnboardingRegistrationForm;
  }, [isOnboardingOrFunnel, isAuthenticating]);

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
            onPasswordLogin={onEmailLogin}
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
            {...(user?.isPlus && {
              title: 'Complete your profile',
            })}
          />
        </Tab>
        <Tab label={AuthDisplay.Registration}>
          <RegistrationForm
            formRef={formRef}
            simplified={simplified}
            hints={registrationHints}
            onBack={
              defaultDisplay !== AuthDisplay.Registration
                ? () => onSetActiveDisplay(defaultDisplay)
                : undefined
            }
            onBackToIntro={() => {
              onAuthStateUpdate({
                isAuthenticating: undefined,
                defaultDisplay: AuthDisplay.OnboardingSignup,
              });
            }}
            onExistingEmailLoginClick={() => {
              onAuthStateUpdate({
                isLoginFlow: true,
              });
              setActiveDisplay(AuthDisplay.Default);
            }}
            onSignup={(params) => {
              setEmail(params['traits.email']);
              onRegister(params);
            }}
            onUpdateHints={setRegistrationHints}
            trigger={trigger}
            token={
              registration &&
              getNodeValue('csrf_token', registration?.ui?.nodes)
            }
            targetId={targetId}
          />
        </Tab>
        <Tab label={AuthDisplay.OnboardingSignup}>
          <RegistrationFormComponent
            onContinueWithEmail={() => {
              onAuthStateUpdate({
                isAuthenticating: true,
                defaultDisplay: AuthDisplay.Registration,
              });
            }}
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
            onBack={onForgotPasswordBack}
            onSubmit={onForgotPasswordSubmit}
            simplified={simplified}
          />
        </Tab>
        <Tab label={AuthDisplay.CodeVerification}>
          <CodeVerificationForm
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
          <MailIcon size={IconSize.XXLarge} className="mx-auto mb-2" />
          <AuthHeader simplified={simplified} title="Verify your email" />
          <EmailCodeVerification
            flowId={verificationFlowId}
            onSubmit={onProfileSuccess}
          />
        </Tab>
      </TabContainer>
    </div>
  );
}

export default AuthOptionsInner;

import type { ReactElement } from 'react';
import React, { useRef, useEffect, useState } from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { useAuthContext } from '../../contexts/AuthContext';
import { Tab, TabContainer } from '../tabs/TabContainer';
import type { RegistrationFormValues } from './RegistrationForm';
import type { RegistrationError } from '../../lib/auth';
import {
  iosNativeAuth,
  isNativeAuthSupported,
  AuthEventNames,
  AuthTriggers,
  AuthEvent,
} from '../../lib/auth';
import {
  getBetterAuthErrorMessage,
  betterAuthSignInWithIdToken,
  betterAuthOneTapCallback,
  betterAuthSendVerificationOTP,
  betterAuthVerifyEmailOTP,
  getBetterAuthSocialRedirectData,
} from '../../lib/betterAuth';
import {
  getSocialAuthCallbackError,
  GITHUB_EMAIL_NOT_VERIFIED_ERROR,
  hasSocialAuthBootUser,
  refetchSocialAuthBoot,
  SOCIAL_AUTH_RETRY_MESSAGE,
} from './socialAuth';
import { webappUrl, broadcastChannel, isTesting } from '../../lib/constants';
import { getUserDefaultTimezone } from '../../lib/timezones';
import { checkIsExtension, shouldUseSocialAuthPopup } from '../../lib/func';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import { featureAuthGoogleOneTap } from '../../lib/featureManagement';
import { useGoogleOneTap } from '../../hooks/auth/useGoogleOneTap';
import { generateNameFromEmail } from '../../lib/strings';
import { generateUsername, claimClaimableItem } from '../../graphql/users';
import useRegistration from '../../hooks/useRegistration';
import { storageWrapper as storage } from '../../lib/storageWrapper';
import type { AuthOptionsProps } from './common';
import { AuthDisplay, providers, SocialProvider } from './common';
import useLogin from '../../hooks/useLogin';
import type { UpdateProfileParameters } from '../../hooks/useProfileForm';
import useProfileForm from '../../hooks/useProfileForm';
import { useLogContext } from '../../contexts/LogContext';
import { useSettingsContext } from '../../contexts/SettingsContext';
import {
  useToastNotification,
  useEventListener,
  usePersistentState,
} from '../../hooks';
import type { SignBackProvider } from '../../hooks/auth/useSignBack';
import { SIGNIN_METHOD_KEY, useSignBack } from '../../hooks/auth/useSignBack';
import type { LoggedUser } from '../../lib/user';
import { Origin } from '../../lib/log';
import { labels } from '../../lib';
import { IconSize } from '../Icon';
import { MailIcon } from '../icons';
import { usePixelsContext } from '../../contexts/PixelsContext';
import { useAuthData } from '../../contexts/AuthDataContext';
import { getUserActions } from '../../graphql/actions';
import { redirectToApp } from '../../features/onboarding/lib/utils';
import {
  DATE_SINCE_ACTIONS_REQUIRED,
  onboardingCompletedActions,
} from '../../hooks/auth';

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
  hideLoginLink,
  compact,
  autoTriggerProvider,
  socialProviderScopes,
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
  const [activeDisplay, setActiveDisplay] = useState(() =>
    storage.getItem(SIGNIN_METHOD_KEY) && !forceDefaultDisplay
      ? AuthDisplay.SignBack
      : defaultDisplay,
  );

  const { email, setEmail } = useAuthData();

  const onSetActiveDisplay = (display: AuthDisplay) => {
    onDisplayChange?.(display);
    onAuthStateUpdate?.({ isLoading: false, defaultDisplay: display });
    setActiveDisplay(display);
  };

  const [isForgotPasswordReturn, setIsForgotPasswordReturn] = useState(false);
  const [handleLoginCheck, setHandleLoginCheck] = useState<boolean>(null);
  const socialErrorEventName = useRef(AuthEventNames.LoginError);
  const [chosenProvider, setChosenProvider] = usePersistentState(
    CHOSEN_PROVIDER_KEY,
    null,
  );
  const [activeSocialProvider, setActiveSocialProvider] = useState<
    string | null
  >(null);
  const userSocialProvider = user?.providers?.find((provider) =>
    Object.values(SocialProvider).includes(provider as SocialProvider),
  );
  const socialRegistrationProvider =
    activeSocialProvider || chosenProvider || userSocialProvider;
  const [isRegistration, setIsRegistration] = useState(false);
  const [isSocialAuthLoading, setIsSocialAuthLoading] = useState(false);
  const windowPopup = useRef<Window | null>(null);
  const popupCheckIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const authFlowCompletedRef = useRef(false);
  const authFlowSucceededRef = useRef(false);

  const clearPopupCheck = () => {
    if (popupCheckIntervalRef.current) {
      clearInterval(popupCheckIntervalRef.current);
      popupCheckIntervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearPopupCheck();
    };
  }, []);

  const checkForOnboardedUser = async (data: LoggedUser) => {
    onAuthStateUpdate({ isLoading: true });
    const isOnboardingPage = router?.pathname?.startsWith('/onboarding');

    if (isOnboardingPage) {
      if (
        data?.createdAt &&
        new Date(data.createdAt) < DATE_SINCE_ACTIONS_REQUIRED
      ) {
        await redirectToApp(router);
        return true;
      }

      const userActions = await getUserActions();
      const isUserOnboardingComplete = Object.values(
        onboardingCompletedActions,
      ).some((actions) =>
        actions.every((action) =>
          userActions.some((userAction) => userAction.type === action),
        ),
      );

      if (isUserOnboardingComplete) {
        await redirectToApp(router);
        return true;
      }
    }

    onAuthStateUpdate({ isLoading: false });
    return false;
  };

  const { onUpdateSignBack: onSignBackLogin } = useSignBack();
  const { isReady: isRegistrationReady, validateRegistration } =
    useRegistration({
      key: ['registration_form'],
      onInitializeVerification: () => {
        onSetActiveDisplay(AuthDisplay.EmailVerification);
      },
      onInvalidRegistration: setRegistrationHints,
      onRedirectFail: () => {
        windowPopup.current?.close();
        windowPopup.current = null;
      },
      onRedirect: (redirect) => {
        if (windowPopup.current) {
          windowPopup.current.location.href = redirect;
        } else {
          window.location.href = redirect;
        }
      },
      keepSession: isOnboardingOrFunnel,
    });

  const onProfileSuccess = async (
    options: { redirect?: string; setSignBack?: boolean } = {},
  ) => {
    setIsRegistration(true);
    const { redirect, setSignBack = true } = options;
    const { data } = await refetchBoot();

    const isLoggedUser = 'infoConfirmed' in data.user;
    if (!isLoggedUser) {
      return;
    }

    if (data.user && setSignBack) {
      const provider = socialRegistrationProvider || 'password';
      onSignBackLogin(data.user as LoggedUser, provider as SignBackProvider);
    }

    logEvent({
      event_name: AuthEventNames.SignupSuccessfully,
    });
    const loggedUser = data?.user as LoggedUser;
    trackSignup(loggedUser);

    // if redirect is set, move before modal close
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

  const autoCompleteProfile = async (
    userEmail: string,
    name?: string,
    marketing = false,
  ) => {
    try {
      const displayName = name || generateNameFromEmail(userEmail, 'User');

      const username = await generateUsername(displayName);

      updateUserProfile({
        name: displayName,
        username,
        acceptedMarketing: marketing,
      });
    } catch (error) {
      logEvent({
        event_name: AuthEventNames.SubmitSignUpFormError,
        extra: JSON.stringify({
          error: 'Failed to auto-complete profile',
          details: error instanceof Error ? error.message : 'Unknown error',
        }),
      });
      displayToast(labels.auth.error.generic);
    }
  };

  const onLoginCheck = async (shouldVerify?: boolean) => {
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

      // Check for claimable items on login (e.g., Plus subscription)
      claimClaimableItem().then((hasClaimed) => {
        if (hasClaimed) {
          refetchBoot();
        }
      });

      const isAlreadyOnboarded = await checkForOnboardedUser(user);
      if (!isAlreadyOnboarded) {
        onSuccessfulLogin?.();
      }
    } else if (trigger === AuthTriggers.RecruiterSelfServe) {
      await autoCompleteProfile(user.email, user.name, false);
    } else {
      onSetActiveDisplay(AuthDisplay.SocialRegistration);
    }
  };

  useEffect(() => {
    onLoginCheck();
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const {
    isReady: isLoginReady,
    loginHint,
    onPasswordLogin,
    isPasswordLoginLoading,
  } = useLogin({
    onSuccessfulLogin: onLoginCheck,
    trigger,
    provider: chosenProvider,
  });

  const isReady = isTesting ? true : isLoginReady && isRegistrationReady;

  const checkIsLoginMessage = (e: MessageEvent) => {
    return e.data.login === 'true' && e.data.eventKey === AuthEvent.Login;
  };

  const handleLoginMessage = async (
    e?: MessageEvent,
    providerOverride?: string,
  ) => {
    const authProvider = providerOverride || chosenProvider;
    setActiveSocialProvider(authProvider);
    authFlowCompletedRef.current = true;
    clearPopupCheck();
    const popup = windowPopup.current;
    windowPopup.current = null;
    if (popup && !popup.closed) {
      popup.close();
      // Retry after a short delay — some browsers defer the close when the
      // popup is still settling after a redirect chain.
      setTimeout(() => {
        if (!popup.closed) {
          popup.close();
        }
      }, 300);
    }

    const callbackError = getSocialAuthCallbackError(e?.data);
    const callbackData =
      typeof e?.data === 'object' ? JSON.stringify(e.data) : undefined;
    const socialErrorMessage =
      callbackError === GITHUB_EMAIL_NOT_VERIFIED_ERROR
        ? labels.auth.error.githubEmailNotVerified
        : SOCIAL_AUTH_RETRY_MESSAGE;

    let boot;
    try {
      boot = await refetchSocialAuthBoot(refetchBoot);
    } catch (error) {
      setIsSocialAuthLoading(false);
      onAuthStateUpdate?.({ isLoading: false });
      logEvent({
        event_name: socialErrorEventName.current,
        extra: JSON.stringify({
          provider: authProvider,
          error: getBetterAuthErrorMessage(
            error,
            'Failed to refresh Better Auth social auth state',
          ),
          callbackError,
          origin: 'betterauth social auth boot',
          data: callbackData,
        }),
      });
      if (!authFlowSucceededRef.current) {
        displayToast(socialErrorMessage);
      }
      return;
    }

    if (!hasSocialAuthBootUser(boot?.user)) {
      setIsSocialAuthLoading(false);
      onAuthStateUpdate?.({ isLoading: false });
      logEvent({
        event_name: socialErrorEventName.current,
        extra: JSON.stringify({
          provider: authProvider,
          error:
            callbackError ||
            'Could not find authenticated user after social authentication',
          origin: callbackError
            ? 'betterauth social auth callback'
            : 'betterauth social auth boot',
          data: callbackData,
        }),
      });
      if (!authFlowSucceededRef.current) {
        displayToast(socialErrorMessage);
      }
      return;
    }

    authFlowSucceededRef.current = true;

    // If user is confirmed we can proceed with logging them in
    if ('infoConfirmed' in boot.user && boot.user.infoConfirmed) {
      setIsSocialAuthLoading(false);
      await onSignBackLogin(boot.user, authProvider as SignBackProvider);
      const isAlreadyOnboarded = await checkForOnboardedUser(boot.user);
      if (!isAlreadyOnboarded) {
        onSuccessfulLogin?.();
      }
      return;
    }

    if (trigger === AuthTriggers.RecruiterSelfServe) {
      setIsSocialAuthLoading(false);
      const loggedUser = boot.user as LoggedUser;
      await autoCompleteProfile(loggedUser.email, loggedUser.name, false);
      return;
    }

    setIsSocialAuthLoading(false);
    await setChosenProvider(authProvider || 'password');
    onAuthStateUpdate({ defaultDisplay: AuthDisplay.SocialRegistration });
    onSetActiveDisplay(AuthDisplay.SocialRegistration);
  };

  const onProviderClick = async (provider: string, login = true) => {
    if (isSocialAuthLoading) {
      return;
    }
    const authErrorEventName = login
      ? AuthEventNames.LoginError
      : AuthEventNames.RegistrationError;

    logEvent({
      event_name: 'click',
      target_type: login
        ? AuthEventNames?.LoginProvider
        : AuthEventNames.SignUpProvider,
      target_id: provider,
      extra: JSON.stringify({ trigger }),
    });
    socialErrorEventName.current = authErrorEventName;
    authFlowSucceededRef.current = false;
    setActiveSocialProvider(provider);
    setIsSocialAuthLoading(true);

    const additionalData = { timezone: getUserDefaultTimezone() };

    if (isNativeAuthSupported(provider)) {
      const res = await iosNativeAuth(provider);
      if (!res) {
        setIsSocialAuthLoading(false);
        return;
      }
      const result = await betterAuthSignInWithIdToken({
        provider: provider.toLowerCase(),
        token: res.token,
        nonce: res.nonce,
        additionalData,
      });
      if (result.error) {
        logEvent({
          event_name: authErrorEventName,
          extra: JSON.stringify({
            provider,
            error: result.error,
            origin: 'betterauth native id token',
          }),
        });
        setIsSocialAuthLoading(false);
        displayToast(SOCIAL_AUTH_RETRY_MESSAGE);
        return;
      }
      await setChosenProvider(provider);
      await handleLoginMessage(undefined, provider);
      return;
    }
    const shouldUsePopup = shouldUseSocialAuthPopup();
    onAuthStateUpdate?.({ isLoading: true });
    if (shouldUsePopup) {
      windowPopup.current = window.open();
    }
    const callbackURL = `${webappUrl}callback?login=true`;
    const { url: socialUrl, error } = await getBetterAuthSocialRedirectData(
      provider.toLowerCase(),
      callbackURL,
      additionalData,
      socialProviderScopes,
    );
    if (!socialUrl) {
      logEvent({
        event_name: authErrorEventName,
        extra: JSON.stringify({
          provider,
          error: error || 'Failed to get social login URL',
          origin: 'betterauth social url',
        }),
      });
      windowPopup.current?.close();
      windowPopup.current = null;
      setIsSocialAuthLoading(false);
      displayToast(SOCIAL_AUTH_RETRY_MESSAGE);
      onAuthStateUpdate?.({ isLoading: false });
      return;
    }
    if (!windowPopup.current) {
      await setChosenProvider(provider);
      window.location.href = socialUrl;
      return;
    }
    windowPopup.current.location.href = socialUrl;
    await setChosenProvider(provider);
    onAuthStateUpdate?.({ isLoading: true });

    authFlowCompletedRef.current = false;
    clearPopupCheck();
    const popup = windowPopup.current;
    popupCheckIntervalRef.current = setInterval(() => {
      if (popup && !popup.closed) {
        return;
      }
      clearPopupCheck();
      windowPopup.current = null;
      if (authFlowCompletedRef.current) {
        return;
      }
      // Popup closed without delivering a completion message. The user may
      // still be authenticated (session cookies set even when postMessage is
      // missed/dropped); verify via boot before surfacing an error toast.
      handleLoginMessage();
    }, 500);
  };

  const handleOneTapCredential = async (idToken: string) => {
    if (isSocialAuthLoading) {
      return;
    }
    const isLogin = isLoginFlow ?? true;
    socialErrorEventName.current = isLogin
      ? AuthEventNames.LoginError
      : AuthEventNames.RegistrationError;
    authFlowSucceededRef.current = false;
    setIsSocialAuthLoading(true);
    logEvent({
      event_name: 'click',
      target_type: isLogin
        ? AuthEventNames.LoginProvider
        : AuthEventNames.SignUpProvider,
      target_id: 'google',
      extra: JSON.stringify({ trigger, origin: Origin.AuthOneTap }),
    });

    const result = await betterAuthOneTapCallback({
      idToken,
      timezone: getUserDefaultTimezone(),
    });

    if (result.error) {
      logEvent({
        event_name: socialErrorEventName.current,
        extra: JSON.stringify({
          provider: 'google',
          error: result.error,
          origin: Origin.AuthOneTap,
        }),
      });
      setIsSocialAuthLoading(false);
      displayToast(SOCIAL_AUTH_RETRY_MESSAGE);
      return;
    }

    await setChosenProvider('google');
    await handleLoginMessage();
  };

  const canUseOneTap =
    !user && !checkIsExtension() && !isNativeAuthSupported('google');
  const { value: isOneTapEnabled } = useConditionalFeature({
    feature: featureAuthGoogleOneTap,
    shouldEvaluate: canUseOneTap,
  });
  useGoogleOneTap({
    enabled: canUseOneTap && isOneTapEnabled,
    onCredential: handleOneTapCredential,
  });

  const onProviderClickRef = useRef(onProviderClick);
  onProviderClickRef.current = onProviderClick;
  const autoTriggerFiredProvider = useRef<string | null>(null);

  useEffect(() => {
    if (
      !autoTriggerProvider ||
      autoTriggerFiredProvider.current === autoTriggerProvider
    ) {
      return;
    }
    autoTriggerFiredProvider.current = autoTriggerProvider;
    onProviderClickRef.current(autoTriggerProvider, false);
  }, [autoTriggerProvider]);

  const onProviderMessage = async (e: MessageEvent) => {
    if (checkIsLoginMessage(e)) {
      return handleLoginMessage(e);
    }

    if (e.data?.eventKey !== AuthEvent.SocialRegistration || ignoreMessages) {
      return undefined;
    }

    return handleLoginMessage(e);
  };

  useEventListener(broadcastChannel, 'message', onProviderMessage);

  useEventListener(globalThis, 'message', onProviderMessage);

  const onEmailRegistration = (emailAd: string) => {
    // before displaying registration, ensure the email doesn't exist
    onSetActiveDisplay(AuthDisplay.Registration);
    setEmail(emailAd);
  };

  const onSocialCompletion = async (params: UpdateProfileParameters) => {
    updateUserProfile({ ...params });
    await syncSettings();
  };

  const onRegister = async (params: RegistrationFormValues) => {
    await validateRegistration({
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

  const onEmailLogin: typeof onPasswordLogin = (params) => {
    setEmail(params.identifier);
    onPasswordLogin(params);
  };

  return (
    <div
      className={classNames(
        'z-1 flex w-full max-w-[26.25rem] flex-col overflow-y-auto rounded-16',
        !simplified && 'bg-accent-pepper-subtlest',
        defaultDisplay === AuthDisplay.OnboardingSignup && !compact
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
            isSocialAuthLoading={isSocialAuthLoading}
            providers={providers}
            simplified={simplified}
            trigger={trigger}
          />
        </Tab>
        <Tab label={AuthDisplay.SocialRegistration}>
          <SocialRegistrationForm
            formRef={formRef}
            provider={socialRegistrationProvider}
            onSignup={onSocialCompletion}
            hints={hint}
            isLoading={isProfileUpdateLoading}
            onUpdateHints={onUpdateHint}
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
            onBackToIntro={
              // Only offer "back to intro" when an OnboardingSignup screen is
              // actually the entry point (e.g. /onboarding, auth banner).
              // The inline modal lands on Default and there's no intro to
              // return to.
              defaultDisplay === AuthDisplay.OnboardingSignup
                ? () => {
                    onAuthStateUpdate({
                      isAuthenticating: undefined,
                      defaultDisplay: AuthDisplay.OnboardingSignup,
                    });
                  }
                : undefined
            }
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
            token={undefined}
            targetId={targetId}
          />
        </Tab>
        <Tab label={AuthDisplay.OnboardingSignup}>
          <OnboardingRegistrationForm
            onContinueWithEmail={() => {
              onAuthStateUpdate?.({
                isAuthenticating: true,
                defaultDisplay: AuthDisplay.Registration,
              });
              setActiveDisplay(AuthDisplay.Registration);
            }}
            onSignup={(signupEmail) => {
              onAuthStateUpdate?.({
                isAuthenticating: true,
                email: signupEmail,
                defaultDisplay: AuthDisplay.Registration,
              });
              setEmail(signupEmail);
              setActiveDisplay(AuthDisplay.Registration);
            }}
            onExistingEmail={(existingEmail) => {
              onAuthStateUpdate?.({
                isAuthenticating: true,
                isLoginFlow: true,
                email: existingEmail,
              });
              setEmail(existingEmail);
              setActiveDisplay(AuthDisplay.Default);
            }}
            onProviderClick={onProviderClick}
            trigger={trigger}
            isReady={isReady}
            isSocialAuthLoading={isSocialAuthLoading}
            simplified={simplified}
            targetId={targetId}
            className={className}
            onboardingSignupButton={onboardingSignupButton}
            hideLoginLink={hideLoginLink}
            compact={compact}
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
            isProviderLoading={isSocialAuthLoading}
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
            simplified={simplified}
          />
        </Tab>
        <Tab label={AuthDisplay.CodeVerification}>
          <CodeVerificationForm
            onBack={onForgotPasswordBack}
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
            onSubmit={onProfileSuccess}
            onVerifyCode={async (code) => {
              const res = await betterAuthVerifyEmailOTP(email, code);
              if (res.error) {
                throw new Error(res.error);
              }
            }}
            onResendCode={async () => {
              await betterAuthSendVerificationOTP(email);
            }}
          />
        </Tab>
      </TabContainer>
    </div>
  );
}

export default AuthOptionsInner;

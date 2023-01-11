import React, {
  MutableRefObject,
  ReactElement,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import AuthContext from '../../contexts/AuthContext';
import TabContainer, { Tab } from '../tabs/TabContainer';
import AuthDefault from './AuthDefault';
import { AuthSignBack, SIGNIN_METHOD_KEY } from './AuthSignBack';
import ForgotPasswordForm from './ForgotPasswordForm';
import LoginForm from './LoginForm';
import { RegistrationForm, RegistrationFormValues } from './RegistrationForm';
import {
  AuthEventNames,
  AuthTriggers,
  AuthTriggersOrString,
  getNodeValue,
  RegistrationError,
} from '../../lib/auth';
import useWindowEvents from '../../hooks/useWindowEvents';
import useRegistration from '../../hooks/useRegistration';
import EmailVerificationSent from './EmailVerificationSent';
import AuthModalHeader from './AuthModalHeader';
import {
  AuthEvent,
  AuthFlow,
  getKratosFlow,
  SocialRegistrationFlow,
} from '../../lib/kratos';
import { storageWrapper as storage } from '../../lib/storageWrapper';
import { providers } from './common';
import useLogin from '../../hooks/useLogin';
import { SocialRegistrationForm } from './SocialRegistrationForm';
import useProfileForm from '../../hooks/useProfileForm';
import { CloseAuthModalFunc } from '../../hooks/useAuthForms';
import ConnectedUserModal, {
  ConnectedUser as RegistrationConnectedUser,
} from '../modals/ConnectedUser';
import EmailVerified from './EmailVerified';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import SettingsContext from '../../contexts/SettingsContext';
import { useToastNotification } from '../../hooks/useToastNotification';

export enum AuthDisplay {
  Default = 'default',
  Registration = 'registration',
  SocialRegistration = 'social_registration',
  SignBack = 'sign_back',
  ForgotPassword = 'forgot_password',
  EmailSent = 'email_sent',
  ConnectedUser = 'connected_user',
  VerifiedEmail = 'VerifiedEmail',
}

export interface AuthOptionsProps {
  onClose?: CloseAuthModalFunc;
  onSuccessfulLogin?: () => unknown;
  onSuccessfulRegistration?: () => unknown;
  formRef: MutableRefObject<HTMLFormElement>;
  trigger: AuthTriggersOrString;
  defaultDisplay?: AuthDisplay;
  className?: string;
  isLoginFlow?: boolean;
  onDisplayChange?: (value: string) => void;
}

function AuthOptions({
  onClose,
  onSuccessfulLogin,
  onSuccessfulRegistration,
  className,
  formRef,
  trigger,
  defaultDisplay = AuthDisplay.Default,
  onDisplayChange,
  isLoginFlow,
}: AuthOptionsProps): ReactElement {
  const { displayToast } = useToastNotification();
  const { syncSettings } = useContext(SettingsContext);
  const { trackEvent } = useContext(AnalyticsContext);
  const [registrationHints, setRegistrationHints] = useState<RegistrationError>(
    {},
  );
  const { refetchBoot, user, loginState } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [connectedUser, setConnectedUser] =
    useState<RegistrationConnectedUser>();
  const [activeDisplay, setActiveDisplay] = useState(() =>
    storage.getItem(SIGNIN_METHOD_KEY) ? AuthDisplay.SignBack : defaultDisplay,
  );
  const onSetActiveDisplay = (display: AuthDisplay) => {
    onDisplayChange?.(display);
    setActiveDisplay(display);
  };
  const isVerified = loginState?.trigger === AuthTriggers.Verification;
  const [isForgotPasswordReturn, setIsForgotPasswordReturn] = useState(false);
  const [handleLoginCheck, setHandleLoginCheck] = useState<boolean>(null);
  const [chosenProvider, setChosenProvider] = useState<string>(null);
  const [isRegistration, setIsRegistration] = useState(false);
  const onLoginCheck = () => {
    if (isRegistration) {
      return;
    }
    if (isVerified) {
      onSetActiveDisplay(AuthDisplay.VerifiedEmail);
      return;
    }

    if (!user || handleLoginCheck === false) {
      return;
    }

    setHandleLoginCheck(handleLoginCheck === null);

    if (user.infoConfirmed) {
      trackEvent({
        event_name: AuthEventNames.LoginSuccessfully,
      });
      onSuccessfulLogin?.();
    } else {
      onSetActiveDisplay(AuthDisplay.SocialRegistration);
    }
  };

  useEffect(() => {
    onLoginCheck();
  }, [user]);

  const {
    isReady: isLoginReady,
    loginHint,
    onPasswordLogin,
    isPasswordLoginLoading,
  } = useLogin({
    onSuccessfulLogin: onLoginCheck,
    queryEnabled: !user,
    trigger,
  });
  const onProfileSuccess = async () => {
    await refetchBoot();
    onSuccessfulRegistration?.();
    onClose(null, true);
  };
  const {
    updateUserProfile,
    hint,
    onUpdateHint,
    isLoading: isProfileUpdateLoading,
  } = useProfileForm({ onSuccess: onProfileSuccess });
  const windowPopup = useRef<Window>(null);

  const {
    isReady: isRegistrationReady,
    registration,
    validateRegistration,
    onSocialRegistration,
  } = useRegistration({
    key: 'registration_form',
    onValidRegistration: async () => {
      setIsRegistration(true);
      await refetchBoot();
      await syncSettings();
      onSetActiveDisplay(AuthDisplay.EmailSent);
      onSuccessfulRegistration?.();
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

  const isReady = isLoginReady && isRegistrationReady;
  const onProviderClick = (provider: string, login = true) => {
    trackEvent({
      event_name: 'click',
      target_type: login
        ? AuthEventNames?.LoginProvider
        : AuthEventNames.SignUpProvider,
      target_id: provider,
      extra: JSON.stringify({ trigger }),
    });
    windowPopup.current = window.open();
    setChosenProvider(provider);
    onSocialRegistration(provider);
  };

  useWindowEvents<SocialRegistrationFlow>(
    'message',
    AuthEvent.SocialRegistration,
    async (e) => {
      if (e.data?.flow) {
        const connected = await getKratosFlow(
          AuthFlow.Registration,
          e.data.flow,
        );

        trackEvent({
          event_name: AuthEventNames.RegistrationError,
          extra: JSON.stringify({
            error: {
              flowId: connected?.id,
              messages: connected?.ui?.messages,
            },
            origin: 'window registration flow error',
          }),
        });

        if ([4010002, 4010003].includes(connected?.ui?.messages?.[0]?.id)) {
          const registerUser = {
            provider: chosenProvider,
            name: getNodeValue('traits.name', connected.ui.nodes),
            email: getNodeValue('traits.email', connected.ui.nodes),
            image: getNodeValue('traits.image', connected.ui.nodes),
            flowId: connected.id,
          };
          setConnectedUser(registerUser);
          return onSetActiveDisplay(AuthDisplay.ConnectedUser);
        }

        return displayToast('An error occurred, please refresh the page.');
      }
      if (!e.data?.social_registration) {
        await refetchBoot();
        return onSuccessfulLogin?.();
      }

      return onSetActiveDisplay(AuthDisplay.SocialRegistration);
    },
  );

  const onEmailRegistration = (emailAd: string) => {
    // before displaying registration, ensure the email doesn't exists
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

  const onForgotPassword = () => {
    trackEvent({
      event_name: 'click',
      target_type: AuthEventNames.ForgotPassword,
    });
    onSetActiveDisplay(AuthDisplay.ForgotPassword);
  };

  const onForgotPasswordBack = () => {
    setIsForgotPasswordReturn(true);
    onSetActiveDisplay(defaultDisplay);
  };

  const onShowLogin = () => {
    onSetActiveDisplay(AuthDisplay.SignBack);
  };

  return (
    <div
      className={classNames(
        'flex overflow-y-auto z-1 flex-col w-full rounded-16 bg-theme-bg-tertiary max-w-[26.25rem]',
        className,
      )}
    >
      <TabContainer<AuthDisplay>
        onActiveChange={(active) => onSetActiveDisplay(active)}
        controlledActive={activeDisplay}
        showHeader={false}
      >
        <Tab label={AuthDisplay.Default}>
          <AuthDefault
            providers={providers}
            onSignup={onEmailRegistration}
            onProviderClick={onProviderClick}
            onForgotPassword={onForgotPassword}
            onPasswordLogin={onPasswordLogin}
            loginHint={loginHint}
            isLoading={isPasswordLoginLoading}
            isLoginFlow={isForgotPasswordReturn || isLoginFlow}
            trigger={trigger}
            isReady={isReady}
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
          />
        </Tab>
        <Tab label={AuthDisplay.Registration}>
          <RegistrationForm
            onBack={() => onSetActiveDisplay(defaultDisplay)}
            formRef={formRef}
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
        <Tab label={AuthDisplay.SignBack}>
          <AuthSignBack
            onRegister={() => onSetActiveDisplay(AuthDisplay.Default)}
            onProviderClick={onProviderClick}
          >
            <LoginForm
              className="mt-3"
              loginHint={loginHint}
              onPasswordLogin={onPasswordLogin}
              onForgotPassword={onForgotPassword}
              isLoading={isPasswordLoginLoading}
              autoFocus={false}
              isReady={isReady}
            />
          </AuthSignBack>
        </Tab>
        <Tab label={AuthDisplay.ForgotPassword}>
          <ForgotPasswordForm
            initialEmail={email}
            onBack={onForgotPasswordBack}
          />
        </Tab>
        <Tab label={AuthDisplay.EmailSent}>
          <AuthModalHeader title="Verify your email address" />
          <EmailVerificationSent email={email} />
        </Tab>
        <Tab label={AuthDisplay.VerifiedEmail}>
          <EmailVerified hasUser={!!user}>
            {!user && (
              <LoginForm
                isReady={isReady}
                className="mx-4 tablet:mx-12 mt-8"
                loginHint={loginHint}
                onPasswordLogin={onPasswordLogin}
                onForgotPassword={() =>
                  onSetActiveDisplay(AuthDisplay.ForgotPassword)
                }
                isLoading={isPasswordLoginLoading}
              />
            )}
          </EmailVerified>
        </Tab>
        <Tab label={AuthDisplay.ConnectedUser}>
          <AuthModalHeader title="Account already exists" />
          {connectedUser && (
            <ConnectedUserModal user={connectedUser} onLogin={onShowLogin} />
          )}
        </Tab>
      </TabContainer>
    </div>
  );
}

export default AuthOptions;

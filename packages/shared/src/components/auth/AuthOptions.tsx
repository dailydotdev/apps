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
import FeaturesContext from '../../contexts/FeaturesContext';
import { AuthVersion } from '../../lib/featureValues';
import TabContainer, { Tab } from '../tabs/TabContainer';
import AuthDefault from './AuthDefault';
import { AuthSignBack, SIGNIN_METHOD_KEY } from './AuthSignBack';
import ForgotPasswordForm from './ForgotPasswordForm';
import LoginForm from './LoginForm';
import { RegistrationForm, RegistrationFormValues } from './RegistrationForm';
import { getNodeValue, RegistrationError } from '../../lib/auth';
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
import { logout } from '../../lib/user';
import ConnectedUserModal, {
  ConnectedUser as RegistrationConnectedUser,
} from '../modals/ConnectedUser';
import { VERIFICATION_TRIGGER } from '../../hooks/useAuthVerificationRecovery';
import EmailVerified from './EmailVerified';

export enum Display {
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
  onShowOptionsOnly?: (value: boolean) => unknown;
  formRef: MutableRefObject<HTMLFormElement>;
  trigger: string;
  defaultDisplay?: Display;
  className?: string;
}

function AuthOptions({
  onClose,
  onSuccessfulLogin,
  className,
  formRef,
  onShowOptionsOnly,
  trigger,
  defaultDisplay = Display.Default,
}: AuthOptionsProps): ReactElement {
  const [registrationHints, setRegistrationHints] = useState<RegistrationError>(
    {},
  );
  console.log('trigger: ', trigger);
  const { refetchBoot, user, loginState } = useContext(AuthContext);
  const { authVersion } = useContext(FeaturesContext);
  const isV2 = authVersion === AuthVersion.V2;
  const [email, setEmail] = useState('');
  const [connectedUser, setConnectedUser] =
    useState<RegistrationConnectedUser>();
  const [activeDisplay, setActiveDisplay] = useState(() =>
    storage.getItem(SIGNIN_METHOD_KEY) ? Display.SignBack : defaultDisplay,
  );
  const isVerified = loginState?.trigger === VERIFICATION_TRIGGER;
  const [isForgotPasswordReturn, setIsForgotPasswordReturn] = useState(false);
  const [handleLoginCheck, setHandleLoginCheck] = useState<boolean>(null);
  const [chosenProvider, setChosenProvider] = useState<string>(null);
  const onLoginCheck = () => {
    if (isVerified) {
      onShowOptionsOnly(!!user);
      setActiveDisplay(Display.VerifiedEmail);
      return;
    }

    if (!user || handleLoginCheck === false) {
      return;
    }

    setHandleLoginCheck(handleLoginCheck === null);

    if (user.infoConfirmed) {
      onSuccessfulLogin();
    } else {
      setActiveDisplay(Display.SocialRegistration);
    }
  };

  useEffect(() => {
    onLoginCheck();
  }, [user]);

  const { loginHint, onPasswordLogin, isPasswordLoginLoading } = useLogin({
    onSuccessfulLogin: onLoginCheck,
  });
  const {
    updateUserProfile,
    hint,
    onUpdateHint,
    isLoading: isProfileUpdateLoading,
  } = useProfileForm();
  const windowPopup = useRef<Window>(null);

  const { registration, validateRegistration, onSocialRegistration } =
    useRegistration({
      key: 'registration_form',
      onValidRegistration: () => {
        refetchBoot();
        onShowOptionsOnly?.(true);
        setActiveDisplay(Display.EmailSent);
      },
      onInvalidRegistration: setRegistrationHints,
      onRedirect: (redirect) => {
        windowPopup.current.location.href = redirect;
      },
    });

  const onProviderClick = (provider: string) => {
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
        const registerUser = {
          provider: chosenProvider,
          name: getNodeValue('traits.name', connected.ui.nodes),
          email: getNodeValue('traits.email', connected.ui.nodes),
          image: getNodeValue('traits.image', connected.ui.nodes),
          flowId: connected.id,
        };
        onShowOptionsOnly?.(true);
        setConnectedUser(registerUser);
        return setActiveDisplay(Display.ConnectedUser);
      }
      if (!e.data?.social_registration) {
        await refetchBoot();
        return onSuccessfulLogin?.();
      }

      return setActiveDisplay(Display.SocialRegistration);
    },
  );

  const onEmailRegistration = (emailAd: string) => {
    // before displaying registration, ensure the email doesn't exists
    setActiveDisplay(Display.Registration);
    setEmail(emailAd);
  };

  const onSocialCompletion = async (params) => {
    await updateUserProfile({ ...params });
    refetchBoot();
    onClose(null, true);
  };

  const onRegister = (params: RegistrationFormValues) => {
    validateRegistration({
      ...params,
      method: 'password',
    });
  };

  const onSocialRegistrationClose = (e) => {
    logout();
    onClose(e, true);
  };

  const onForgotPasswordBack = () => {
    setIsForgotPasswordReturn(true);
    setActiveDisplay(defaultDisplay);
  };

  const onShowLogin = () => {
    onShowOptionsOnly(false);
    setActiveDisplay(Display.Default);
  };

  return (
    <div
      className={classNames(
        'flex overflow-y-auto z-1 flex-col w-full rounded-16 bg-theme-bg-tertiary',
        !isV2 && 'max-w-[25.75rem]',
        className,
      )}
    >
      <TabContainer<Display>
        onActiveChange={(active) => setActiveDisplay(active)}
        controlledActive={activeDisplay}
        showHeader={false}
      >
        <Tab label={Display.Default}>
          <AuthDefault
            providers={providers}
            onClose={onClose}
            onSignup={onEmailRegistration}
            onProviderClick={onProviderClick}
            onForgotPassword={() => setActiveDisplay(Display.ForgotPassword)}
            onPasswordLogin={onPasswordLogin}
            loginHint={loginHint}
            isV2={isV2}
            isLoading={isPasswordLoginLoading}
            isForgotPasswordReturn={isForgotPasswordReturn}
            trigger={trigger}
          />
        </Tab>
        <Tab label={Display.SocialRegistration}>
          <SocialRegistrationForm
            formRef={formRef}
            provider={chosenProvider}
            onClose={onSocialRegistrationClose}
            isV2={isV2}
            onSignup={onSocialCompletion}
            hints={hint}
            isLoading={isProfileUpdateLoading}
            onUpdateHints={onUpdateHint}
          />
        </Tab>
        <Tab label={Display.Registration}>
          <RegistrationForm
            onBack={() => setActiveDisplay(defaultDisplay)}
            formRef={formRef}
            email={email}
            onClose={onClose}
            isV2={isV2}
            onSignup={onRegister}
            hints={registrationHints}
            onUpdateHints={setRegistrationHints}
            token={
              registration &&
              getNodeValue('csrf_token', registration?.ui?.nodes)
            }
          />
        </Tab>
        <Tab label={Display.SignBack}>
          <AuthSignBack
            onRegister={() => setActiveDisplay(Display.Default)}
            onProviderClick={onProviderClick}
            onClose={onClose}
          >
            <LoginForm
              className="mt-3"
              loginHint={loginHint}
              onPasswordLogin={onPasswordLogin}
              onForgotPassword={() => setActiveDisplay(Display.ForgotPassword)}
              isLoading={isPasswordLoginLoading}
            />
          </AuthSignBack>
        </Tab>
        <Tab label={Display.ForgotPassword}>
          <ForgotPasswordForm
            initialEmail={email}
            onClose={onClose}
            onBack={onForgotPasswordBack}
          />
        </Tab>
        <Tab label={Display.EmailSent}>
          <AuthModalHeader
            title="Verify your email address"
            onClose={onClose}
          />
          <EmailVerificationSent email={email} />
        </Tab>
        <Tab label={Display.VerifiedEmail}>
          <EmailVerified hasUser={!!user} onClose={onClose}>
            {!user && (
              <LoginForm
                className="mx-4 tablet:mx-12 mt-8"
                loginHint={loginHint}
                onPasswordLogin={onPasswordLogin}
                onForgotPassword={() =>
                  setActiveDisplay(Display.ForgotPassword)
                }
                isLoading={isPasswordLoginLoading}
              />
            )}
          </EmailVerified>
        </Tab>
        <Tab label={Display.ConnectedUser}>
          <AuthModalHeader title="Account already exists" onClose={onClose} />
          {connectedUser && (
            <ConnectedUserModal user={connectedUser} onLogin={onShowLogin} />
          )}
        </Tab>
      </TabContainer>
    </div>
  );
}

export default AuthOptions;

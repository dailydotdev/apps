import React, {
  MutableRefObject,
  ReactElement,
  useContext,
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
import { AuthEvent, SocialRegistrationFlow } from '../../lib/kratos';
import { storageWrapper as storage } from '../../lib/storageWrapper';
import { providers } from './common';
import useLogin from '../../hooks/useLogin';
import { SocialRegistrationForm } from './SocialRegistrationForm';
import useProfileForm from '../../hooks/useProfileForm';
import { CloseAuthModalFunc } from '../../hooks/useAuthForms';
import { logout } from '../../lib/user';

export enum Display {
  Default = 'default',
  Registration = 'registration',
  SocialRegistration = 'social_registration',
  SignBack = 'sign_back',
  ForgotPassword = 'forgot_password',
  EmailSent = 'email_sent',
}

export interface AuthOptionsProps {
  onClose?: CloseAuthModalFunc;
  onSuccessfulLogin?: () => unknown;
  onVerificationSent?: () => unknown;
  formRef: MutableRefObject<HTMLFormElement>;
  defaultDisplay?: Display;
  className?: string;
}

function AuthOptions({
  onClose,
  onSuccessfulLogin,
  className,
  formRef,
  onVerificationSent,
  defaultDisplay = Display.Default,
}: AuthOptionsProps): ReactElement {
  const [registrationHints, setRegistrationHints] = useState<RegistrationError>(
    {},
  );
  const { refetchBoot, referral } = useContext(AuthContext);
  const { loginHint, onPasswordLogin, isPasswordLoginLoading } = useLogin({
    onSuccessfulLogin,
  });
  const { authVersion } = useContext(FeaturesContext);
  const isV2 = authVersion === AuthVersion.V2;
  const [email, setEmail] = useState('');
  const [activeDisplay, setActiveDisplay] = useState(() =>
    storage.getItem(SIGNIN_METHOD_KEY) ? Display.SignBack : defaultDisplay,
  );
  const [isForgotPasswordReturn, setIsForgotPasswordReturn] = useState(false);
  const [chosenProvider, setChosenProvider] = useState<string>(null);
  const {
    updateUserProfile,
    hint,
    onUpdateHint,
    isLoading: isProfileUpdateLoading,
  } = useProfileForm();

  const { registration, validateRegistration, onSocialRegistration } =
    useRegistration({
      key: 'registration_form',
      onValidRegistration: () => {
        refetchBoot();
        onVerificationSent?.();
        setActiveDisplay(Display.EmailSent);
      },
      onInvalidRegistration: setRegistrationHints,
      onRedirect: (redirect) => window.open(redirect),
    });

  const onProviderClick = (provider: string) => {
    setChosenProvider(provider);
    onSocialRegistration(provider);
  };

  useWindowEvents<SocialRegistrationFlow>(
    'message',
    AuthEvent.SocialRegistration,
    async (e) => {
      if (!e.data?.social_registration) {
        await refetchBoot();
        onSuccessfulLogin?.();
        return;
      }

      setActiveDisplay(Display.SocialRegistration);
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
      referral,
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
              registration && getNodeValue('csrf_token', registration.ui.nodes)
            }
          />
        </Tab>
        <Tab label={Display.SignBack}>
          <AuthSignBack
            onRegister={() => setActiveDisplay(Display.Default)}
            onProviderClick={onSocialRegistration}
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
      </TabContainer>
    </div>
  );
}

export default AuthOptions;

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
import { CloseModalFunc } from '../modals/common';
import TabContainer, { Tab } from '../tabs/TabContainer';
import AuthDefault from './AuthDefault';
import { AuthSignBack, SIGNIN_METHOD_KEY } from './AuthSignBack';
import ForgotPasswordForm from './ForgotPasswordForm';
import LoginForm from './LoginForm';
import {
  RegistrationForm,
  RegistrationFormValues,
  SocialProviderAccount,
} from './RegistrationForm';
import { getNodeValue, RegistrationError } from '../../lib/auth';
import useWindowEvents from '../../hooks/useWindowEvents';
import useRegistration from '../../hooks/useRegistration';
import EmailVerificationSent from './EmailVerificationSent';
import AuthModalHeader from './AuthModalHeader';
import { AuthFlow, getKratosFlow } from '../../lib/kratos';
import { fallbackImages } from '../../lib/config';
import { storageWrapper as storage } from '../../lib/storageWrapper';
import { providers } from './common';
import useLogin from '../../hooks/useLogin';

export enum Display {
  Default = 'default',
  Registration = 'registration',
  SignBack = 'sign_back',
  ForgotPassword = 'forgot_password',
  EmailSent = 'email_sent',
}

export interface AuthOptionsProps {
  onClose?: CloseModalFunc;
  onSuccessfulLogin?: () => unknown;
  onSelectedProvider?: (account: SocialProviderAccount) => void;
  formRef: MutableRefObject<HTMLFormElement>;
  socialAccount?: SocialProviderAccount;
  defaultDisplay?: Display;
  className?: string;
}

function AuthOptions({
  onClose,
  onSuccessfulLogin,
  onSelectedProvider,
  className,
  formRef,
  socialAccount,
  defaultDisplay = Display.Default,
}: AuthOptionsProps): ReactElement {
  const [registrationHints, setRegistrationHints] = useState<RegistrationError>(
    {},
  );
  const { refetchBoot, referral } = useContext(AuthContext);
  const {
    loginHint: [hint, setHint],
    onPasswordLogin,
  } = useLogin({ onSuccessfulLogin });
  const { authVersion } = useContext(FeaturesContext);
  const isV2 = authVersion === AuthVersion.V2;
  const [email, setEmail] = useState('');
  const [activeDisplay, setActiveDisplay] = useState(() =>
    storage.getItem(SIGNIN_METHOD_KEY) ? Display.SignBack : defaultDisplay,
  );
  const { registration, validateRegistration, onSocialRegistration } =
    useRegistration({
      key: 'registration_form',
      onValidRegistration: () => {
        refetchBoot();
        setActiveDisplay(Display.EmailSent);
      },
      onInvalidRegistration: setRegistrationHints,
      onRedirect: (redirect) => window.open(redirect),
    });

  useWindowEvents('message', async (e) => {
    if (e.data?.flow) {
      const flow = await getKratosFlow(AuthFlow.Registration, e.data.flow);
      const { nodes, action } = flow.ui;
      onSelectedProvider({
        action,
        provider: getNodeValue('provider', nodes),
        csrf_token: getNodeValue('csrf_token', nodes),
        email: getNodeValue('traits.email', nodes),
        name: getNodeValue('traits.name', nodes),
        username: getNodeValue('traits.username', nodes),
        image: getNodeValue('traits.image', nodes) || fallbackImages.avatar,
      });
      setActiveDisplay(Display.Registration);
    }
  });

  const onEmailRegistration = (emailAd: string) => {
    // before displaying registration, ensure the email doesn't exists
    setActiveDisplay(Display.Registration);
    setEmail(emailAd);
  };

  const onRegister = (params: RegistrationFormValues) => {
    validateRegistration({
      ...params,
      referral,
      provider: socialAccount?.provider,
      method: socialAccount ? 'oidc' : 'password',
    });
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
            onProviderClick={onSocialRegistration}
            onForgotPassword={() => setActiveDisplay(Display.ForgotPassword)}
            onPasswordLogin={onPasswordLogin}
            loginHint={[hint, setHint]}
            isV2={isV2}
          />
        </Tab>
        <Tab label={Display.Registration}>
          <RegistrationForm
            onBack={() => setActiveDisplay(defaultDisplay)}
            formRef={formRef}
            email={email}
            socialAccount={socialAccount}
            onClose={onClose}
            isV2={isV2}
            onSignup={onRegister}
            hints={registrationHints}
            token={
              registration && getNodeValue('csrf_token', registration.ui.nodes)
            }
          />
        </Tab>
        <Tab label={Display.SignBack}>
          <AuthSignBack>
            <LoginForm
              onPasswordLogin={onPasswordLogin}
              onForgotPassword={() => setActiveDisplay(Display.ForgotPassword)}
            />
          </AuthSignBack>
        </Tab>
        <Tab label={Display.ForgotPassword}>
          <ForgotPasswordForm
            initialEmail={email}
            onClose={onClose}
            onBack={() => setActiveDisplay(defaultDisplay)}
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

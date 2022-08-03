import classNames from 'classnames';
import React, {
  MutableRefObject,
  ReactElement,
  useContext,
  useState,
} from 'react';
import AuthContext, { getQueryParams } from '../../contexts/AuthContext';
import FeaturesContext from '../../contexts/FeaturesContext';
import { AuthVersion } from '../../lib/featureValues';
import { CloseModalFunc } from '../modals/common';
import TabContainer, { Tab } from '../tabs/TabContainer';
import AuthDefault from './AuthDefault';
import { AuthSignBack } from './AuthSignBack';
import ForgotPasswordForm from './ForgotPasswordForm';
import LoginForm from './LoginForm';
import {
  RegistrationForm,
  RegistrationFormValues,
  SocialProviderAccount,
} from './RegistrationForm';
import {
  getNodeByKey,
  getNodeValue,
  getRegistrationFlow,
  RegistrationParameters,
} from '../../lib/auth';
import useWindowEvents from '../../hooks/useWindowEvents';
import useRegistration from '../../hooks/useRegistration';
import EmailVerificationSent from './EmailVerificationSent';
import AuthModalHeader from './AuthModalHeader';

export enum Display {
  Default = 'default',
  Registration = 'registration',
  SignBack = 'sign_back',
  ForgotPassword = 'forgot_password',
  EmailSent = 'email_sent',
}

const hasLoggedOut = () => {
  const params = getQueryParams();

  return params?.logged_out !== undefined;
};

interface AuthOptionsProps {
  onClose?: CloseModalFunc;
  onSelectedProvider: (account: SocialProviderAccount) => void;
  formRef: MutableRefObject<HTMLFormElement>;
  socialAccount?: SocialProviderAccount;
  className?: string;
  defaultDisplay?: Display;
}

function AuthOptions({
  onClose,
  onSelectedProvider,
  formRef,
  socialAccount,
  className,
  defaultDisplay = Display.Default,
}: AuthOptionsProps): ReactElement {
  const { authVersion } = useContext(FeaturesContext);
  const isV2 = authVersion === AuthVersion.V2;
  const [email, setEmail] = useState('');
  const [activeDisplay, setActiveDisplay] = useState(
    hasLoggedOut() ? Display.SignBack : defaultDisplay,
  );
  const { onUpdateSession } = useContext(AuthContext);
  const { validateRegistration, registration } = useRegistration({
    key: 'registration_form',
    onValidRegistration: (data) => {
      onUpdateSession(data);
      setActiveDisplay(Display.EmailSent);
    },
    onRedirect: (redirect) => window.open(redirect),
  });

  useWindowEvents('message', async (e) => {
    if (e.data?.flow) {
      const flow = await getRegistrationFlow(e.data.flow);
      const { nodes, action } = flow.ui;
      onSelectedProvider({
        action,
        provider: getNodeValue('provider', nodes),
        csrf_token: getNodeValue('csrf_token', nodes),
        email: getNodeValue('traits.email', nodes),
        name: getNodeValue('traits.fullname', nodes),
        username: getNodeValue('traits.username', nodes),
        image: getNodeValue('traits.image', nodes),
      });
      setActiveDisplay(Display.Registration);
    }
  });

  const onProviderClick = async (provider: string) => {
    const csrf = getNodeByKey('csrf_token', registration.ui.nodes);
    const postData: RegistrationParameters = {
      csrf_token: csrf.attributes.value,
      method: 'oidc',
      provider,
      'traits.email': '',
      'traits.username': '',
      'traits.image': '',
    };

    validateRegistration(postData);
  };

  const onStartSignup = async (emailAd: string) => {
    // before displaying registration, ensure the email doesn't exists
    setActiveDisplay(Display.Registration);
    setEmail(emailAd);
  };

  const onRegister = (params: RegistrationFormValues) => {
    validateRegistration({
      ...params,
      provider: socialAccount?.provider,
      method: socialAccount ? 'oidc' : 'password',
    });
  };

  return (
    <TabContainer<Display>
      className={classNames(
        'flex overflow-y-auto z-1 flex-col w-full rounded-16 bg-theme-bg-tertiary',
        !isV2 && 'max-w-[25.75rem]',
        className,
      )}
      onActiveChange={(active) => setActiveDisplay(active)}
      controlledActive={activeDisplay}
      showHeader={false}
    >
      <Tab label={Display.Default}>
        <AuthDefault
          onClose={onClose}
          onSignup={onStartSignup}
          onProviderClick={onProviderClick}
          onForgotPassword={() => setActiveDisplay(Display.ForgotPassword)}
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
        />
      </Tab>
      <Tab label={Display.SignBack}>
        <AuthSignBack>
          <LoginForm
            onSuccessfulLogin={(e) => onClose(e)}
            onForgotPassword={() => setActiveDisplay(Display.ForgotPassword)}
          />
        </AuthSignBack>
      </Tab>
      <Tab label={Display.ForgotPassword}>
        <ForgotPasswordForm
          email={email}
          onClose={onClose}
          onBack={() => setActiveDisplay(defaultDisplay)}
        />
      </Tab>
      <Tab label={Display.EmailSent}>
        <AuthModalHeader title="Verify your email address" onClose={onClose} />
        <EmailVerificationSent email={email} />
      </Tab>
    </TabContainer>
  );
}

export default AuthOptions;

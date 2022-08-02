import classNames from 'classnames';
import React, {
  MutableRefObject,
  ReactElement,
  useContext,
  useState,
} from 'react';
import { useQuery } from 'react-query';
import { getQueryParams } from '../../contexts/AuthContext';
import FeaturesContext from '../../contexts/FeaturesContext';
import { AuthVersion } from '../../lib/featureValues';
import { CloseModalFunc } from '../modals/common';
import TabContainer, { Tab } from '../tabs/TabContainer';
import AuthDefault from './AuthDefault';
import { AuthSignBack } from './AuthSignBack';
import ForgotPasswordForm from './ForgotPasswordForm';
import LoginForm from './LoginForm';
import { RegistrationForm, SocialProviderAccount } from './RegistrationForm';
import {
  getRegistrationFlow,
  initializeRegistration,
  RegistrationParameters,
  socialRegistration,
} from '../../lib/auth';
import { disabledRefetch } from '../../lib/func';
import useWindowEvents from '../../hooks/useWindowEvents';

export enum Display {
  Default = 'default',
  Registration = 'registration',
  SignBack = 'sign_back',
  ForgotPassword = 'forgot_password',
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

  const { data: registration } = useQuery(
    'registration',
    initializeRegistration,
    { ...disabledRefetch },
  );

  useWindowEvents<MessageEvent>('message', async (e) => {
    if (e.data?.flow) {
      const flow = await getRegistrationFlow(e.data.flow);
      onSelectedProvider({
        provider: flow.ui.nodes[5].attributes.value,
        action: flow.ui.action,
        csrf_token: flow.ui.nodes[0].attributes.value,
        email: flow.ui.nodes[1].attributes.value,
        name: flow.ui.nodes[2].attributes.value,
        username: flow.ui.nodes[3].attributes.value,
        image: flow.ui.nodes[4].attributes.value,
      });
      setActiveDisplay(Display.Registration);
    }
  });

  const onProviderClick = async (provider: string) => {
    const postData: RegistrationParameters = {
      csrf_token: registration.ui.nodes[0].attributes.value,
      method: 'oidc',
      provider,
      'traits.email': '',
      'traits.username': '',
      'traits.image': '',
    };

    const { redirect } = await socialRegistration(
      registration.ui.action,
      postData,
    );
    if (redirect) {
      window.open(redirect);
    }
  };

  const onSignup = async (emailAd: string) => {
    // before displaying registration, ensure the email doesn't exists
    setActiveDisplay(Display.Registration);
    setEmail(emailAd);
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
          onSignup={onSignup}
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
    </TabContainer>
  );
}

export default AuthOptions;

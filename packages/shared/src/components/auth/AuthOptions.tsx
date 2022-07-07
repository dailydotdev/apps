import classNames from 'classnames';
import React, { MutableRefObject, ReactElement, useState } from 'react';
import { getQueryParams } from '../../contexts/AuthContext';
import { fallbackImages } from '../../lib/config';
import { CloseModalFunc } from '../modals/common';
import TabContainer, { Tab } from '../tabs/TabContainer';
import { AuthDefault } from './AuthDefault';
import { AuthSignBack } from './AuthSignBack';
import ForgotPasswordForm from './ForgotPasswordForm';
import LoginForm from './LoginForm';
import { RegistrationForm, SocialProviderAccount } from './RegistrationForm';

enum Display {
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
}

function AuthOptions({
  onClose,
  onSelectedProvider,
  formRef,
  socialAccount,
  className,
}: AuthOptionsProps): ReactElement {
  const [email, setEmail] = useState('');
  const [activeDisplay, setActiveDisplay] = useState(
    hasLoggedOut() ? Display.SignBack : Display.Default,
  );

  const onLogin = () => {};

  const onProviderClick = (provider: string) => {
    onSelectedProvider({
      provider,
      name: 'Test account',
      image: fallbackImages.avatar,
    });
    setActiveDisplay(Display.Registration);
  };

  const onSignup = (emailAd: string) => {
    setActiveDisplay(Display.Registration);
    setEmail(emailAd);
  };

  return (
    <TabContainer<Display>
      className={classNames(
        'flex overflow-y-auto z-1 flex-col w-full rounded-16 max-w-[25.75rem] bg-theme-bg-tertiary',
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
        />
      </Tab>
      <Tab label={Display.Registration}>
        <RegistrationForm
          onBack={() => setActiveDisplay(Display.Default)}
          formRef={formRef}
          email={email}
          socialAccount={socialAccount}
          onClose={onClose}
        />
      </Tab>
      <Tab label={Display.SignBack}>
        <AuthSignBack>
          <LoginForm
            onSubmit={onLogin}
            onForgotPassword={() => setActiveDisplay(Display.ForgotPassword)}
          />
        </AuthSignBack>
      </Tab>
      <Tab label={Display.ForgotPassword}>
        <ForgotPasswordForm
          email={email}
          onClose={onClose}
          onBack={() => setActiveDisplay(Display.Default)}
        />
      </Tab>
    </TabContainer>
  );
}

export default AuthOptions;

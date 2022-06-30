import React, { ReactElement, useRef, useState } from 'react';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
import { StyledModal, ModalProps } from '../modals/StyledModal';
import Circles from '../../../icons/circles_bg.svg';
import styles from './AuthModal.module.css';
import { AuthDefault } from './AuthDefault';
import {
  RegistrationForm,
  RegistrationFormValues,
  SocialProviderAccount,
} from './RegistrationForm';
import LoginForm from './LoginForm';
import { getQueryParams } from '../../contexts/AuthContext';
import { AuthSignBack } from './AuthSignBack';
import { fallbackImages } from '../../lib/config';
import { formToJson } from '../../lib/form';
import ForgotPasswordForm from './ForgotPassword';
import TabContainer, { Tab } from '../tabs/TabContainer';

export type AuthModalProps = ModalProps;

const DiscardActionModal = dynamic(
  () => import('../modals/DiscardActionModal'),
);
const hasLoggedOut = () => {
  const params = getQueryParams();

  return params?.logged_out !== undefined;
};

enum Display {
  Default = 'default',
  Registration = 'registration',
  SignBack = 'sign_back',
  ForgotPassword = 'forgot_password',
}

export default function AuthModal({
  className,
  onRequestClose,
  children,
  ...props
}: AuthModalProps): ReactElement {
  const [container, setContainer] = useState<HTMLDivElement>();
  const registrationFormRef = useRef<HTMLFormElement>();
  const [isDiscardOpen, setIsDiscardOpen] = useState(false);
  const [socialAccount, setSocialAccount] = useState<SocialProviderAccount>();
  const [email, setEmail] = useState('');
  const [activeDisplay, setActiveDisplay] = useState(
    hasLoggedOut() ? Display.SignBack : Display.Default,
  );

  const onLogin = () => {};

  const onProviderClick = (provider: string) => {
    setSocialAccount({
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

  const onClose: typeof onRequestClose = (e) => {
    if (!registrationFormRef?.current) {
      return onRequestClose(e);
    }

    if (socialAccount) {
      return onRequestClose(e);
    }

    const { email: emailAd, ...rest } = formToJson<RegistrationFormValues>(
      registrationFormRef.current,
      {},
    );
    const values = Object.values(rest);

    if (values.some((value) => !!value)) {
      return setIsDiscardOpen(true);
    }

    return onRequestClose(e);
  };

  return (
    <StyledModal
      {...props}
      overlayRef={setContainer}
      onRequestClose={onClose}
      className={classNames(styles.authModal, className)}
    >
      <Circles className="absolute z-0 w-3/5 h-3/5" />
      <TabContainer<Display>
        className="flex overflow-y-auto z-1 flex-col ml-auto w-full h-full rounded-16 max-w-[25.75rem] bg-theme-bg-tertiary"
        onActiveChange={(active) => setActiveDisplay(active)}
        controlledActive={activeDisplay}
        showHeader={false}
      >
        <Tab label={Display.Default}>
          <AuthDefault
            onClose={onClose}
            onSignup={onSignup}
            onProviderClick={onProviderClick}
          />
        </Tab>
        <Tab label={Display.Registration}>
          <RegistrationForm
            formRef={registrationFormRef}
            email={email}
            socialAccount={socialAccount}
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
          <ForgotPasswordForm />
        </Tab>
      </TabContainer>
      {isDiscardOpen && (
        <DiscardActionModal
          isOpen={isDiscardOpen}
          onDiscard={onRequestClose}
          parentSelector={() => container}
          onRequestClose={() => setIsDiscardOpen(false)}
          title="Discard changes?"
          description="If you leave your changes will not be saved"
          leftButtonText="Leave"
          rightButtonText="Stay"
        />
      )}
    </StyledModal>
  );
}

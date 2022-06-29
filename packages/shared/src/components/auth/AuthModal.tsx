import React, { ReactElement, useRef, useState } from 'react';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
import { StyledModal, ModalProps } from '../modals/StyledModal';
import Circles from '../../../icons/circles_bg.svg';
import styles from './AuthModal.module.css';
import { AuthDefault } from './AuthDefault';
import { Button } from '../buttons/Button';
import CloseIcon from '../icons/Close';
import {
  RegistrationForm,
  RegistrationFormValues,
  SocialProviderAccount,
} from './RegistrationForm';
import { ClickableText } from '../buttons/ClickableText';
import LoginForm from './LoginForm';
import EmailSignupForm from './EmailSignupForm';
import OrDivider from './OrDivider';
import { getQueryParams } from '../../contexts/AuthContext';
import { AuthSignBack } from './AuthSignBack';
import { fallbackImages } from '../../lib/config';
import { formToJson } from '../../lib/form';
import ForgotPassword from './ForgotPassword';

export type AuthModalProps = ModalProps;

const DiscardActionModal = dynamic(
  () => import('../modals/DiscardActionModal'),
);
const hasLoggedOut = () => {
  const params = getQueryParams();

  return params?.logged_out !== undefined;
};

export default function AuthModal({
  className,
  onRequestClose,
  children,
  ...props
}: AuthModalProps): ReactElement {
  const [container, setContainer] = useState<HTMLDivElement>();
  const registrationFormRef = useRef<HTMLFormElement>();
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [isDiscardOpen, setIsDiscardOpen] = useState(false);
  const [socialAccount, setSocialAccount] = useState<SocialProviderAccount>();
  const [email, setEmail] = useState('');
  const [shouldLogin, setShouldLogin] = useState(false);

  const onLogin = () => {};

  const onProviderClick = (provider: string) => {
    setSocialAccount({
      provider,
      name: 'Test account',
      image: fallbackImages.avatar,
    });
    setShowRegistrationForm(true);
  };

  const onEmailCheck = () => {
    setShowRegistrationForm(true);
  };

  const onEmailSignup = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const input = Array.from(form.elements).find(
      (el) => el.getAttribute('name') === 'email',
    ) as HTMLInputElement;

    if (!input?.value?.trim()) {
      return null;
    }

    setEmail(input.value.trim());
    return onEmailCheck();
  };

  const getContent = () => {
    const loggedOut = hasLoggedOut();

    if (loggedOut) {
      return (
        <AuthSignBack>
          <LoginForm
            onSubmit={onLogin}
            onForgotPassword={() => setShowForgotPassword(true)}
          />
        </AuthSignBack>
      );
    }

    return (
      <AuthDefault onProviderClick={onProviderClick}>
        <OrDivider className="mt-3" />
        {shouldLogin ? (
          <LoginForm onSubmit={onLogin} />
        ) : (
          <EmailSignupForm onSubmit={onEmailSignup} />
        )}
      </AuthDefault>
    );
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

  const getPage = () => {
    if (showForgotPassword) {
      return <ForgotPassword />;
    }

    if (showRegistrationForm) {
      return (
        <RegistrationForm
          formRef={registrationFormRef}
          email={email}
          socialAccount={socialAccount}
        />
      );
    }

    return getContent();
  };

  return (
    <StyledModal
      {...props}
      overlayRef={setContainer}
      onRequestClose={onClose}
      className={classNames(styles.authModal, className)}
    >
      <Circles className="absolute z-0 w-3/5 h-3/5" />
      <div className="flex overflow-y-auto z-1 flex-col ml-auto w-full h-full rounded-16 max-w-[25.75rem] bg-theme-bg-tertiary">
        <header className="flex flex-row justify-between items-center py-4 px-6 border-b border-theme-divider-tertiary">
          <h3>Sign up to daily.dev</h3>
          <Button icon={<CloseIcon />} buttonSize="small" onClick={onClose} />
        </header>
        {getPage()}
        {!showRegistrationForm && (
          <div className="flex justify-center py-3 mt-auto border-t border-theme-divider-tertiary typo-callout text-theme-label-tertiary">
            {shouldLogin ? 'Not yet a member?' : 'Already a member?'}
            <ClickableText
              className="ml-1 text-theme-label-primary"
              onClick={() => setShouldLogin(!shouldLogin)}
            >
              {shouldLogin ? 'Register' : 'Login'}
            </ClickableText>
          </div>
        )}
      </div>
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

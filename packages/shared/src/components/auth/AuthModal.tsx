import React, { ReactElement, useState } from 'react';
import classNames from 'classnames';
import { StyledModal, ModalProps } from '../modals/StyledModal';
import styles from '../modals/LoginModal.module.css';
import { AuthDefault } from './AuthDefault';
import { Button } from '../buttons/Button';
import CloseIcon from '../icons/Close';
import { RegistrationForm } from './RegistrationForm';
import { ClickableText } from '../buttons/ClickableText';
import LoginForm from './LoginForm';
import EmailSignupForm from './EmailSignupForm';
import OrDivider from './OrDivider';
import { getQueryParams } from '../../contexts/AuthContext';
import { AuthSignBack } from './AuthSignBack';

export type AuthModalProps = ModalProps;

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
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [email, setEmail] = useState('');
  const [shouldLogin, setShouldLogin] = useState(false);

  const onLogin = () => {};

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
          <LoginForm onSubmit={onLogin} />
        </AuthSignBack>
      );
    }

    return (
      <AuthDefault>
        <OrDivider className="mt-3" />
        {shouldLogin ? (
          <LoginForm onSubmit={onLogin} />
        ) : (
          <EmailSignupForm onSubmit={onEmailSignup} />
        )}
      </AuthDefault>
    );
  };

  return (
    <StyledModal
      {...props}
      onRequestClose={onRequestClose}
      className={classNames(styles.loginModal, className)}
      style={{
        content: {
          padding: 0,
          maxHeight: '40rem',
          height: '100%',
          width: '100%',
          maxWidth: '1020px',
          alignItems: 'flex-end',
          backgroundImage: `url('./auth_bg.png')`,
          objectFit: 'cover',
          overflow: 'hidden',
        },
      }}
    >
      <div className="flex overflow-y-auto flex-col w-full h-full rounded-16 max-w-[25.75rem] bg-theme-bg-tertiary">
        <header className="flex flex-row justify-between items-center py-4 px-6 border-b border-theme-divider-tertiary">
          <h3>Sign up to daily.dev</h3>
          <Button icon={<CloseIcon />} buttonSize="small" />
        </header>
        {showRegistrationForm ? (
          <RegistrationForm email={email} />
        ) : (
          getContent()
        )}
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
    </StyledModal>
  );
}

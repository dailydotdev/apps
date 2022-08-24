import React, { ReactElement, ReactNode, useState } from 'react';
import { storageWrapper as storage } from '../../lib/storageWrapper';
import { CloseModalFunc } from '../modals/common';
import AuthModalFooter from './AuthModalFooter';
import AuthModalHeader from './AuthModalHeader';
import AuthModalHeading from './AuthModalHeading';
import { SIGNIN_METHOD_KEY } from './AuthSignBack';
import { ColumnContainer, Provider } from './common';
import EmailSignupForm from './EmailSignupForm';
import LoginForm, { LoginFormParams } from './LoginForm';
import OrDivider from './OrDivider';
import ProviderButton from './ProviderButton';

interface AuthDefaultProps {
  children?: ReactNode;
  loginHint?: ReturnType<typeof useState>;
  onClose?: CloseModalFunc;
  onPasswordLogin: (params: LoginFormParams) => void;
  onSignup?: (email: string) => unknown;
  onProviderClick?: (provider: string) => unknown;
  onForgotPassword?: () => unknown;
  isV2?: boolean;
  title?: string;
  providers: Provider[];
  disableRegistration?: boolean;
  disablePassword?: boolean;
}

const AuthDefault = ({
  loginHint,
  onClose,
  onSignup,
  onProviderClick,
  onForgotPassword,
  onPasswordLogin,
  isV2,
  providers,
  disableRegistration,
  disablePassword,
  title = 'Sign up to daily.dev',
}: AuthDefaultProps): ReactElement => {
  const [shouldLogin, setShouldLogin] = useState(isV2);
  // const { mutateAsync: checkEmail } = useMutation((emailParam: string) =>
  //   checkKratosEmail(emailParam),
  // );

  const onEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const input = Array.from(form.elements).find(
      (el) => el.getAttribute('name') === 'email',
    ) as HTMLInputElement;
    const email = input?.value?.trim();

    if (!email) {
      return null;
    }

    // const res = await checkEmail(email);

    // if (res?.result) {
    //   return setShouldLogin(true);
    // }

    return onSignup(input.value.trim());
  };

  const onSocialClick = (provider: string) => {
    storage.setItem(SIGNIN_METHOD_KEY, provider);
    onProviderClick?.(provider);
  };

  const getForm = () => {
    if (disablePassword && disableRegistration) {
      return null;
    }

    if (shouldLogin || disableRegistration) {
      return (
        <LoginForm
          loginHint={loginHint}
          onPasswordLogin={onPasswordLogin}
          onForgotPassword={onForgotPassword}
        />
      );
    }

    return <EmailSignupForm onSubmit={onEmailSignup} isV2={isV2} />;
  };

  const getOrDivider = () => {
    if (isV2 || !providers.length || disablePassword) {
      return null;
    }

    return <OrDivider />;
  };

  return (
    <>
      <AuthModalHeader title={title} onClose={onClose} />
      <ColumnContainer className={disableRegistration && 'mb-6'}>
        {isV2 && (
          <AuthModalHeading
            tag="h2"
            className="mb-14 text-center typo-large-title"
          >
            Unlock the full power of daily.dev!
          </AuthModalHeading>
        )}
        {!isV2 &&
          providers.map(({ provider, ...props }) => (
            <ProviderButton
              key={provider}
              provider={provider}
              label="Connect with"
              onClick={() => onSocialClick(provider.toLowerCase())}
              {...props}
            />
          ))}
        {getOrDivider()}
        {getForm()}
        {isV2 && (
          <div className="flex flex-row gap-5 mt-10">
            {providers.map(({ provider, ...props }) => (
              <ProviderButton
                key={provider}
                provider={provider}
                onClick={() => onProviderClick(provider)}
                buttonSize="large"
                {...props}
              />
            ))}
          </div>
        )}
      </ColumnContainer>
      <div className="flex flex-1" />
      {!disableRegistration && (
        <AuthModalFooter
          className="mt-4"
          isLogin={shouldLogin}
          onIsLogin={setShouldLogin}
        />
      )}
    </>
  );
};

export default AuthDefault;

import React, { ReactElement, ReactNode, useState } from 'react';
import { storageWrapper as storage } from '../../lib/storageWrapper';
import { CloseModalFunc } from '../modals/common';
import AuthModalFooter from './AuthModalFooter';
import AuthModalHeader from './AuthModalHeader';
import AuthModalHeading from './AuthModalHeading';
import { SIGNIN_METHOD_KEY } from './AuthSignBack';
import { ColumnContainer, providers } from './common';
import EmailSignupForm from './EmailSignupForm';
import LoginForm from './LoginForm';
import OrDivider from './OrDivider';
import ProviderButton from './ProviderButton';

interface AuthDefaultProps {
  children?: ReactNode;
  onClose?: CloseModalFunc;
  onSignup?: (email: string) => unknown;
  onProviderClick?: (provider: string) => unknown;
  onForgotPassword?: () => unknown;
  isV2?: boolean;
}

const AuthDefault = ({
  onClose,
  onSignup,
  onProviderClick,
  onForgotPassword,
  isV2,
}: AuthDefaultProps): ReactElement => {
  const [shouldLogin, setShouldLogin] = useState(isV2);
  // const { mutateAsync: checkEmail } = useMutation((emailParam: string) =>
  //   request(`${apiUrl}/graphql`, QUERY_USER_BY_EMAIL, { email: emailParam }),
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

    // if (res?.user) {
    //   return setShouldLogin(true);
    // }

    return onSignup(input.value.trim());
  };

  const onSocialClick = (provider: string) => {
    storage.setItem(SIGNIN_METHOD_KEY, provider);
    onProviderClick(provider);
  };

  return (
    <>
      <AuthModalHeader title="Sign up to daily.dev" onClose={onClose} />
      <ColumnContainer>
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
        {!isV2 && <OrDivider />}
        {shouldLogin ? (
          <LoginForm
            onSuccessfulLogin={onClose}
            onForgotPassword={onForgotPassword}
          />
        ) : (
          <EmailSignupForm onSubmit={onEmailSignup} isV2={isV2} />
        )}
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
      <AuthModalFooter
        className="mt-4"
        isLogin={shouldLogin}
        onIsLogin={setShouldLogin}
      />
    </>
  );
};

export default AuthDefault;

import React, { ReactElement, ReactNode, useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { CloseModalFunc } from '../modals/common';
import AuthModalFooter from './AuthModalFooter';
import AuthModalHeader from './AuthModalHeader';
import AuthModalHeading from './AuthModalHeading';
import { ColumnContainer, providers } from './common';
import EmailSignupForm from './EmailSignupForm';
import LoginForm from './LoginForm';
import OrDivider from './OrDivider';
import ProviderButton from './ProviderButton';
import { checkKratosEmail } from '../../lib/kratos';

interface AuthDefaultProps {
  children?: ReactNode;
  token: string;
  onClose?: CloseModalFunc;
  onSignup?: (email: string) => unknown;
  onProviderClick?: (provider: string) => unknown;
  onForgotPassword?: () => unknown;
  isV2?: boolean;
}

const AuthDefault = ({
  token,
  onClose,
  onSignup,
  onProviderClick,
  onForgotPassword,
  isV2,
}: AuthDefaultProps): ReactElement => {
  const [shouldLogin, setShouldLogin] = useState(isV2);
  const [hint, setHint] = useState<string>(null);
  const { mutateAsync: checkEmail } = useMutation((emailParam: string) =>
    checkKratosEmail(emailParam, { csrf_token: token }),
  );

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

    const res = await checkEmail(email);

    if (res?.error) {
      return setHint(res.error?.message);
    }

    if (res?.result) {
      return setShouldLogin(true);
    }

    return onSignup(input.value.trim());
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
              onClick={() => onProviderClick(provider.toLowerCase())}
              {...props}
            />
          ))}
        {!isV2 && <OrDivider />}
        {shouldLogin ? (
          <LoginForm
            onSuccessfulLogin={(e) => onClose(e)}
            onForgotPassword={onForgotPassword}
          />
        ) : (
          <EmailSignupForm onSubmit={onEmailSignup} isV2={isV2} hint={hint} />
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

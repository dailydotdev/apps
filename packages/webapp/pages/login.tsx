import AuthModalHeading from '@dailydotdev/shared/src/components/auth/AuthModalHeading';
import AuthOptions from '@dailydotdev/shared/src/components/auth/AuthOptions';
import Logo from '@dailydotdev/shared/src/components/Logo';
import useAuthForms from '@dailydotdev/shared/src/hooks/useAuthForms';
import React, { ReactElement, useContext } from 'react';
import classNames from 'classnames';
import FeaturesContext from '@dailydotdev/shared/src/contexts/FeaturesContext';

function Login(): ReactElement {
  const { onSocialProviderChange, formRef, socialAccount } = useAuthForms();
  const { authVersion } = useContext(FeaturesContext);
  const isV4 = authVersion === 'v4';

  return (
    <div className="flex relative flex-col py-7 px-10 h-screen">
      <header>
        <Logo showGreeting={false} />
      </header>
      <main
        className={classNames(
          'flex flex-row flex-1 items-center mx-0 h-full',
          isV4 ? 'justify-center' : 'tablet:mx-8 laptopL:mx-32',
        )}
      >
        <div className="flex flex-row">
          <AuthOptions
            className="h-full max-h-[40rem] min-h-[40rem]"
            onSelectedProvider={onSocialProviderChange}
            formRef={formRef}
            socialAccount={socialAccount}
          />
          {!isV4 && (
            <AuthModalHeading className="z-1 ml-32 typo-mega1">
              Where developer
              <br />
              grow together.
            </AuthModalHeading>
          )}
        </div>
        {!isV4 && (
          <img
            src="/login.png"
            alt=""
            className="absolute right-0 z-0 max-h-[52.875rem]"
          />
        )}
      </main>
    </div>
  );
}

export default Login;

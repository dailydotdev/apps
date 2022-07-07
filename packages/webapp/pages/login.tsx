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
          'flex flex-row flex-1 mx-0 h-full',
          isV4 ? 'justify-center' : 'tablet:mx-8 laptopL:mx-32',
        )}
      >
        <AuthOptions
          className="my-auto h-full max-h-[40rem]"
          onSelectedProvider={onSocialProviderChange}
          formRef={formRef}
          socialAccount={socialAccount}
        />
        {!isV4 && (
          <AuthModalHeading className="z-1 mt-24 ml-24 typo-mega1">
            Where developer
            <br />
            grow together.
          </AuthModalHeading>
        )}
      </main>
      {!isV4 && (
        <img
          src="/login.png"
          alt=""
          className="absolute right-0 z-0 max-h-[52.875rem]"
        />
      )}
    </div>
  );
}

export default Login;

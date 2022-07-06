import AuthModalHeading from '@dailydotdev/shared/src/components/auth/AuthModalHeading';
import AuthOptions from '@dailydotdev/shared/src/components/auth/AuthOptions';
import Logo from '@dailydotdev/shared/src/components/Logo';
import useAuthForms from '@dailydotdev/shared/src/hooks/useAuthForms';
import React, { ReactElement } from 'react';

function Login(): ReactElement {
  const { onSocialProviderChange, formRef, socialAccount } = useAuthForms();

  return (
    <div className="flex relative flex-col py-7 px-10 h-screen">
      <header>
        <Logo showGreeting={false} />
      </header>
      <main className="flex flex-row flex-1 mx-0 tablet:mx-8 laptopL:mx-32 h-full">
        <AuthOptions
          className="my-auto h-full max-h-[40rem]"
          onSelectedProvider={onSocialProviderChange}
          formRef={formRef}
          socialAccount={socialAccount}
        />
        <AuthModalHeading className="z-1 mt-24 ml-24 typo-mega1">
          Where developer
          <br />
          grow together.
        </AuthModalHeading>
      </main>
      <img
        src="/login.png"
        alt=""
        className="absolute right-0 z-0 max-h-[52.875rem]"
      />
    </div>
  );
}

export default Login;

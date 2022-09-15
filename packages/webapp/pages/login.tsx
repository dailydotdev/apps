import AuthModalHeading from '@dailydotdev/shared/src/components/auth/AuthModalHeading';
import AuthOptions from '@dailydotdev/shared/src/components/auth/AuthOptions';
import Logo from '@dailydotdev/shared/src/components/Logo';
import useAuthForms from '@dailydotdev/shared/src/hooks/useAuthForms';
import React, { ReactElement } from 'react';

function Login(): ReactElement {
  const { formRef } = useAuthForms();

  return (
    <div className="flex relative flex-col py-7 px-10 h-screen">
      <header>
        <Logo showGreeting={false} />
      </header>
      <main className="flex flex-row flex-1 items-center mx-0 tablet:mx-8 laptopL:mx-32 h-full">
        <div className=" flex flex-row max-w-full">
          <AuthOptions
            className="h-full max-h-[40rem] min-h-[40rem]"
            formRef={formRef}
          />

          <AuthModalHeading className="hidden laptop:block z-1 ml-32 typo-mega1">
            Where developer
            <br />
            grow together.
          </AuthModalHeading>
        </div>

        <picture className="flex object-contain absolute right-0 z-0 items-center h-full max-h-[calc(100vh-1.5rem)] laptopXL:max-h-[52.875rem]">
          <source media="(min-width: 1020px)" srcSet="/login.png" />
          <img
            src="/login_small.png"
            alt="daily.dev where developers grow together"
          />
        </picture>
      </main>
    </div>
  );
}

export default Login;

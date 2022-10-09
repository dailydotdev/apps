import AuthModalHeading from '@dailydotdev/shared/src/components/auth/AuthModalHeading';
import AuthOptions from '@dailydotdev/shared/src/components/auth/AuthOptions';
import Logo from '@dailydotdev/shared/src/components/Logo';
import useAuthForms from '@dailydotdev/shared/src/hooks/useAuthForms';
import React, { ReactElement } from 'react';
import { postWindowMessage } from '@dailydotdev/shared/src/lib/func';
import { AuthEvent } from '@dailydotdev/shared/src/lib/kratos';
import { useRouter } from 'next/router';

function Signup(): ReactElement {
  const { formRef } = useAuthForms();
  const router = useRouter();

  const onClose = () => {
    const closeWindow = router.query.close === 'true';
    if (closeWindow) {
      postWindowMessage(AuthEvent.Login, { login: 'true' });
      window.close();
    }
  };

  return (
    <div className="flex relative flex-col py-7 px-10 h-screen">
      <header className="flex justify-center laptop:justify-start">
        <Logo showGreeting={false} />
      </header>
      <main className="flex flex-col tablet:flex-row flex-1 justify-center tablet:justify-start items-center laptop:items-center mx-0 tablet:mx-8 laptopL:mx-32 h-full">
        <div className=" flex flex-col-reverse laptop:flex-row max-w-full">
          <AuthOptions
            className="h-full max-h-[40rem] min-h-[40rem]"
            formRef={formRef}
            trigger="login page"
            onClose={onClose}
            onSuccessfulLogin={onClose}
          />

          <AuthModalHeading className="hidden tablet:block z-1 mb-10 laptop:mb-0 laptop:ml-32 typo-title1 laptop:typo-mega1">
            Where developers
            <br />
            grow together.
          </AuthModalHeading>
        </div>

        <picture className="flex object-contain absolute right-0 z-0 items-end laptop:items-center h-full max-h-[calc(100vh-1.5rem)] laptopXL:max-h-[52.875rem]">
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

export default Signup;

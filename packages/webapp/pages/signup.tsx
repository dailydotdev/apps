import AuthModalHeading from '@dailydotdev/shared/src/components/auth/AuthModalHeading';
import AuthOptions from '@dailydotdev/shared/src/components/auth/AuthOptions';
import Logo from '@dailydotdev/shared/src/components/Logo';
import useAuthForms from '@dailydotdev/shared/src/hooks/useAuthForms';
import React, { ReactElement } from 'react';
import { postWindowMessage } from '@dailydotdev/shared/src/lib/func';
import { AuthEvent } from '@dailydotdev/shared/src/lib/kratos';
import { useRouter } from 'next/router';
import { cloudinary } from '@dailydotdev/shared/src/lib/image';
import { AuthTriggers } from '@dailydotdev/shared/src/lib/auth';

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
    <div className="relative flex h-screen flex-col px-10 py-7">
      <header className="flex justify-center laptop:justify-start">
        <Logo showGreeting={false} />
      </header>
      <main className="mx-0 flex h-full flex-1 flex-col items-center justify-center tablet:mx-8 tablet:flex-row tablet:justify-start laptop:items-center laptopL:mx-32">
        <div className=" flex max-w-full flex-col-reverse laptop:flex-row">
          <AuthOptions
            className={{ container: 'h-full max-h-[40rem] min-h-[40rem]' }}
            formRef={formRef}
            trigger={AuthTriggers.LoginPage}
            onClose={onClose}
            onSuccessfulLogin={onClose}
          />

          <AuthModalHeading className="z-1 mb-10 hidden typo-title1 tablet:block laptop:mb-0 laptop:ml-32 laptop:typo-mega1">
            Where developers
            <br />
            grow together.
          </AuthModalHeading>
        </div>

        <picture className="absolute right-0 z-0 flex h-full max-h-[calc(100vh-1.5rem)] items-end object-contain laptop:items-center laptopXL:max-h-[52.875rem]">
          <source
            media="(min-width: 1020px)"
            srcSet={cloudinary.auth.login.default}
          />
          <img
            src={cloudinary.auth.login.small}
            alt="daily.dev where developers grow together"
          />
        </picture>
      </main>
    </div>
  );
}

export default Signup;

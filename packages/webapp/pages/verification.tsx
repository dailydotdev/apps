import type { ReactElement } from 'react';
import React from 'react';
import EmailCodeVerification from '@dailydotdev/shared/src/components/auth/EmailCodeVerification';
import { useRouter } from 'next/router';
import AuthHeader from '@dailydotdev/shared/src/components/auth/AuthHeader';
import HeaderLogo from '@dailydotdev/shared/src/components/layout/HeaderLogo';
import { AuthDataProvider } from '@dailydotdev/shared/src/contexts/AuthDataContext';

const Verification = (): ReactElement => {
  const router = useRouter();

  if (!router.isReady) {
    return null;
  }

  return (
    <AuthDataProvider initialEmail={router?.query?.email as string}>
      <div className="w-full p-4">
        <HeaderLogo onLogoClick={() => router.push('/')} />
        <AuthHeader title="Verify your email" simplified />
        <EmailCodeVerification
          flowId={router?.query?.flow as string}
          code={router?.query?.code as string}
          className="mx-auto max-w-[30rem]"
        />
      </div>
    </AuthDataProvider>
  );
};

export default Verification;

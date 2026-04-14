import type { ReactElement } from 'react';
import React from 'react';
import EmailCodeVerification from '@dailydotdev/shared/src/components/auth/EmailCodeVerification';
import { useRouter } from 'next/router';
import AuthHeader from '@dailydotdev/shared/src/components/auth/AuthHeader';
import HeaderLogo from '@dailydotdev/shared/src/components/layout/HeaderLogo';
import { AuthDataProvider } from '@dailydotdev/shared/src/contexts/AuthDataContext';
import { AuthModalText } from '@dailydotdev/shared/src/components/auth/common';
import {
  betterAuthSendVerificationOTP,
  betterAuthVerifyEmailOTP,
} from '@dailydotdev/shared/src/lib/betterAuth';
import {
  Button,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';

const Verification = (): ReactElement | null => {
  const router = useRouter();

  if (!router.isReady) {
    return null;
  }

  const email =
    typeof router.query.email === 'string' ? router.query.email : '';
  const code = typeof router.query.code === 'string' ? router.query.code : '';

  if (!email) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center px-4 py-10">
        <HeaderLogo onLogoClick={() => router.push('/')} />
        <div className="mt-10 flex max-w-[30rem] flex-col items-center">
          <AuthModalText className="text-center">
            Invalid verification link. Please request a new verification email.
          </AuthModalText>
          <Button
            className="mt-6"
            variant={ButtonVariant.Primary}
            onClick={() => router.push('/')}
          >
            Go to homepage
          </Button>
        </div>
      </div>
    );
  }

  return (
    <AuthDataProvider initialEmail={email}>
      <div className="flex min-h-screen w-full flex-col items-center px-4 py-10">
        <HeaderLogo onLogoClick={() => router.push('/')} />
        <div className="mt-10 w-full max-w-[30rem]">
          <AuthHeader title="Verify your email" simplified />
          <EmailCodeVerification
            code={code}
            className="mx-auto max-w-[30rem]"
            onSubmit={() => router.push('/')}
            onVerifyCode={async (verificationCode) => {
              const res = await betterAuthVerifyEmailOTP(
                email,
                verificationCode,
              );
              if (res.error) {
                throw new Error(res.error);
              }
            }}
            onResendCode={async () => {
              const res = await betterAuthSendVerificationOTP(email);
              if (res.error) {
                throw new Error(res.error);
              }
            }}
          />
        </div>
      </div>
    </AuthDataProvider>
  );
};

export default Verification;

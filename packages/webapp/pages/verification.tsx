import type { NextSeoProps } from 'next-seo';
import type { ReactElement } from 'react';
import React from 'react';
import EmailCodeVerification from '@dailydotdev/shared/src/components/auth/EmailCodeVerification';
import { useRouter } from 'next/router';
import AuthHeader from '@dailydotdev/shared/src/components/auth/AuthHeader';
import HeaderLogo from '@dailydotdev/shared/src/components/layout/HeaderLogo';
import { LogoPosition } from '@dailydotdev/shared/src/components/Logo';
import { AuthDataProvider } from '@dailydotdev/shared/src/contexts/AuthDataContext';
import { AuthModalText } from '@dailydotdev/shared/src/components/auth/common';
import {
  betterAuthSendVerificationOTP,
  betterAuthVerifyEmailOTP,
} from '@dailydotdev/shared/src/lib/betterAuth';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { noindexSeoProps } from '../next-seo';

const seo: NextSeoProps = { ...noindexSeoProps };

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
      <div className="flex min-h-screen w-full flex-col items-center pb-10">
        <div className="w-full max-w-[30rem] px-4">
          {/* The padding keeps the header clear of the status bar (native
              shell) and the collapsed browser chrome; EmailCodeVerification
              undoes the keyboard reveal scroll so it stays in view. */}
          <div className="flex flex-col gap-6 pb-2 pt-[max(var(--safe-area-top,0px),3rem)]">
            <div className="flex w-full items-center justify-between">
              <HeaderLogo
                position={LogoPosition.Relative}
                onLogoClick={() => router.push('/')}
              />
              <Button
                type="button"
                variant={ButtonVariant.Tertiary}
                size={ButtonSize.Small}
                onClick={() => router.push('/')}
              >
                Start over
              </Button>
            </div>
            <AuthHeader
              title="Verify your email"
              simplified
              onboardingHeadline
            />
          </div>
          <EmailCodeVerification
            code={code}
            isOnboardingFunnel
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

Verification.layoutProps = { seo };

export default Verification;

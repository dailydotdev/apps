import type { ReactElement } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import HeaderLogo from '@dailydotdev/shared/src/components/layout/HeaderLogo';
import ChangePasswordForm from '@dailydotdev/shared/src/components/auth/ChangePasswordForm';
import { AuthModalText } from '@dailydotdev/shared/src/components/auth/common';
import {
  Button,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';

const ResetPassword = (): ReactElement | null => {
  const router = useRouter();

  if (!router.isReady) {
    return null;
  }

  const token = router.query.token as string;
  const error = router.query.error as string;

  if (error || !token) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center px-4 py-10">
        <HeaderLogo onLogoClick={() => router.push('/')} />
        <div className="mt-10 flex max-w-[30rem] flex-col items-center">
          <AuthModalText className="text-center">
            {error === 'INVALID_TOKEN'
              ? 'This password reset link has expired or is invalid. Please request a new one.'
              : 'Invalid password reset link. Please request a new one.'}
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
    <div className="flex min-h-screen w-full flex-col items-center px-4 py-10">
      <HeaderLogo onLogoClick={() => router.push('/')} />
      <div className="mt-10 w-full max-w-[30rem]">
        <ChangePasswordForm
          token={token}
          onSubmit={() => router.push('/')}
          simplified
        />
      </div>
    </div>
  );
};

export default ResetPassword;

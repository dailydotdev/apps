import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { useOnboardingActions } from '../../hooks/auth';
import { useAuthContext } from '../../contexts/AuthContext';
import { useViewSize, ViewSize } from '../../hooks';
import LoginButton from '../LoginButton';
import { authGradientBg } from '../marketing/banners';
import {
  isPostOnboardingPreviewEnabled,
  markPostSignupActivation,
  POST_ONBOARDING_PREVIEW_QUERY,
} from '../../lib/postSignupActivation';
import { isDevelopment } from '../../lib/constants';

const CustomAuthBanner = (): ReactElement | null => {
  const { shouldShowAuthBanner } = useOnboardingActions();
  const { shouldShowLogin } = useAuthContext();
  const router = useRouter();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const isTablet = useViewSize(ViewSize.Tablet);
  const isActivationPreview =
    router.pathname === '/posts/[id]' &&
    (isDevelopment ||
      isPostOnboardingPreviewEnabled(
        router.query?.[POST_ONBOARDING_PREVIEW_QUERY],
      ));
  const isValid =
    !isActivationPreview &&
    shouldShowAuthBanner &&
    !isLaptop &&
    (isTablet || !shouldShowLogin);

  if (!isValid) {
    return null;
  }

  return (
    <LoginButton
      onRegistrationSuccess={markPostSignupActivation}
      className={{
        container: classNames(
          authGradientBg,
          'sticky left-0 top-0 z-max w-full justify-center gap-2 border-b border-accent-cabbage-default px-4 py-2',
        ),
        button: 'flex-1 tablet:max-w-[9rem]',
      }}
    />
  );
};

export default CustomAuthBanner;

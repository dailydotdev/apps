import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { useOnboardingActions } from '../../hooks/auth';
import { useAuthContext } from '../../contexts/AuthContext';
import { useViewSize, ViewSize } from '../../hooks';
import LoginButton from '../LoginButton';
import { authGradientBg } from '../marketing/banners';
import { useMobileAppHeader } from '../../features/getApp/hooks/useMobileAppHeader';

const CustomAuthBanner = (): ReactElement | null => {
  const { shouldShowAuthBanner } = useOnboardingActions();
  const { shouldShowLogin } = useAuthContext();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const isTablet = useViewSize(ViewSize.Tablet);
  const isMobileAppHeader = useMobileAppHeader();
  const isValid =
    shouldShowAuthBanner &&
    !isLaptop &&
    !isMobileAppHeader &&
    (isTablet || !shouldShowLogin);

  if (!isValid) {
    return null;
  }

  return (
    <LoginButton
      className={{
        container: classNames(
          authGradientBg,
          // Under PhoneTopAdStrip when it renders, at the top otherwise.
          'left-0 top-[var(--phone-top-ad-height,0px)] w-full justify-center gap-2 border-b border-accent-cabbage-default px-4 py-2 tablet:sticky tablet:z-max',
        ),
        button: 'flex-1 tablet:max-w-[9rem]',
      }}
    />
  );
};

export default CustomAuthBanner;

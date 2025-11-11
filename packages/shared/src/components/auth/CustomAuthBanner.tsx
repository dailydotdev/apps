import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { useOnboardingActions } from '../../hooks/auth';
import { useAuthContext } from '../../contexts/AuthContext';
import { useViewSize, ViewSize } from '../../hooks';
import LoginButton from '../LoginButton';
import { authGradientBg } from '../banners';

const CustomAuthBanner = (): ReactElement => {
  const { shouldShowAuthBanner } = useOnboardingActions();
  const { shouldShowLogin } = useAuthContext();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const isTablet = useViewSize(ViewSize.Tablet);
  const isValid =
    shouldShowAuthBanner && !isLaptop && (isTablet || !shouldShowLogin);

  if (!isValid) {
    return null;
  }

  return (
    <LoginButton
      className={{
        container: classNames(
          authGradientBg,
          'z-max border-accent-cabbage-default sticky left-0 top-0 w-full justify-center gap-2 border-b px-4 py-2',
        ),
        button: 'tablet:max-w-[9rem] flex-1',
      }}
    />
  );
};

export default CustomAuthBanner;

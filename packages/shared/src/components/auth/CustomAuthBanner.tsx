import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { useOnboarding } from '../../hooks/auth';
import { useAuthContext } from '../../contexts/AuthContext';
import { useViewSize, ViewSize } from '../../hooks';
import LoginButton from '../LoginButton';
import { authGradientBg } from './AuthenticationBanner';

const CustomAuthBanner = (): ReactElement => {
  const { shouldShowAuthBanner } = useOnboarding();
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
          'sticky left-0 top-0 z-max w-full justify-center gap-2 border-b border-accent-cabbage-default px-4 py-2',
        ),
        button: 'flex-1 tablet:max-w-[9rem]',
      }}
    />
  );
};

export default CustomAuthBanner;

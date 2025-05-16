import classNames from 'classnames';
import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import { useSetAtom } from 'jotai/react';
import Logo, { LogoPosition } from '../Logo';
import { wrapperMaxWidth } from './common';
import { authAtom } from '../../features/onboarding/store/onboarding.store';

type OnboardingHeaderProps = {
  isLanding?: boolean;
};

export const OnboardingHeader = ({
  isLanding = false,
}: OnboardingHeaderProps): ReactElement => {
  const setAuth = useSetAtom(authAtom);
  const returnToLanding = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      setAuth((prev) => ({ ...prev, isAuthenticating: false }));
    },
    [setAuth],
  );

  if (!isLanding) {
    return (
      <Logo
        className="w-auto px-10 py-8 laptop:w-full"
        onLogoClick={returnToLanding}
        position={LogoPosition.Relative}
      />
    );
  }

  return (
    <header
      className={classNames(
        'flew-row mt-6 flex h-full w-full justify-between px-6 tablet:mt-16 laptop:mt-20',
        wrapperMaxWidth,
      )}
    >
      <Logo
        className="w-auto"
        linkDisabled
        logoClassName={{ container: 'h-6 tablet:h-8' }}
        position={LogoPosition.Relative}
      />
    </header>
  );
};

import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import HeaderLogo from '../../../components/layout/HeaderLogo';
import { LogoPosition } from '../../../components/Logo';
import { useMobileAppHeader } from '../hooks/useMobileAppHeader';
import { useHideOnScrollDown } from '../hooks/useHideOnScrollDown';
import { MobileAppActions } from './MobileAppActions';

// Published on <html> so the page's own sticky bars (search, tabs) sit under
// the header while it shows and take the top once it slides away.
export const MOBILE_APP_HEADER_OFFSET_VAR = '--mobile-app-header-offset';

// For pages that have no top bar of their own on phones.
export function MobileAppHeader(): ReactElement | null {
  const router = useRouter();
  const isEnabled = useMobileAppHeader();
  const isHidden = useHideOnScrollDown(isEnabled);

  useEffect(() => {
    if (!isEnabled) {
      return undefined;
    }

    const root = document.documentElement;
    root.style.setProperty(
      MOBILE_APP_HEADER_OFFSET_VAR,
      isHidden ? '0px' : '3.5rem',
    );
    return () => {
      root.style.removeProperty(MOBILE_APP_HEADER_OFFSET_VAR);
    };
  }, [isEnabled, isHidden]);

  if (!isEnabled) {
    return null;
  }

  return (
    <header
      className={classNames(
        'sticky left-0 top-[var(--phone-top-ad-height,0px)] z-max flex h-14 flex-row items-center justify-between border-b border-border-subtlest-tertiary bg-background-default px-4 transition-transform duration-200 ease-out tablet:hidden',
        isHidden && '-translate-y-full',
      )}
    >
      <HeaderLogo
        position={LogoPosition.Relative}
        onLogoClick={() => router.push('/')}
      />
      <MobileAppActions />
    </header>
  );
}

import type { ReactElement } from 'react';
import React, { useEffect, useSyncExternalStore } from 'react';
import { useRouter } from 'next/router';
import HeaderLogo from '../../../components/layout/HeaderLogo';
import { LogoPosition } from '../../../components/Logo';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useMobileAppHeader } from '../hooks/useMobileAppHeader';
import { useHideOnScrollDown } from '../hooks/useHideOnScrollDown';
import { MobileAppActions } from './MobileAppActions';
import { MOBILE_APP_HEADER_HIDDEN_CLASS } from '../mobileAppHeaderHint';

// Published on <html> so the page's own sticky bars (search, tabs) sit under
// the header while it shows and take the top once it slides away. The header
// and those bars all move through `top` on the same transition, so a fast
// scroll can't open a gap between them.
export const MOBILE_APP_HEADER_OFFSET_VAR = '--mobile-app-header-offset';

const noopSubscribe = () => () => undefined;

// True only while React hydrates the server markup; any later mount, such as
// client-side navigation, reads false, so a member never gets a frame of the
// row after the first page.
const useIsHydrating = (): boolean =>
  useSyncExternalStore(
    noopSubscribe,
    () => false,
    () => true,
  );

// For pages that have no top bar of their own on phones.
export function MobileAppHeader(): ReactElement | null {
  const router = useRouter();
  const { isAuthReady } = useAuthContext();
  const isEnabled = useMobileAppHeader();
  const isHydrating = useIsHydrating();
  // Rendered from the server on so logged-out readers get no layout shift;
  // dropped once auth says this reader should not see it.
  const isShown = isEnabled || !isAuthReady || isHydrating;
  const isHidden = useHideOnScrollDown(isEnabled);

  useEffect(() => {
    if (isEnabled) {
      document.documentElement.classList.remove(MOBILE_APP_HEADER_HIDDEN_CLASS);
    }
  }, [isEnabled]);

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

  if (!isShown) {
    return null;
  }

  return (
    <header className="mobile-app-header sticky left-0 top-[calc(var(--phone-top-ad-height,0px)+var(--mobile-app-header-offset,3.5rem)-3.5rem)] z-max flex h-14 flex-row items-center justify-between border-b border-border-subtlest-tertiary bg-background-default px-4 transition-[top] duration-200 ease-out tablet:hidden">
      <HeaderLogo
        position={LogoPosition.Relative}
        onLogoClick={() => router.push('/')}
      />
      <MobileAppActions />
    </header>
  );
}

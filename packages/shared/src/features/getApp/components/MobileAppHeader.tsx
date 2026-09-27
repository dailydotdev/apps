import type { ReactElement } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import HeaderLogo from '../../../components/layout/HeaderLogo';
import { LogoPosition } from '../../../components/Logo';
import { useMobileAppHeader } from '../hooks/useMobileAppHeader';
import { MobileAppActions } from './MobileAppActions';

// For pages that have no top bar of their own on phones.
export function MobileAppHeader(): ReactElement | null {
  const router = useRouter();
  const isEnabled = useMobileAppHeader();

  if (!isEnabled) {
    return null;
  }

  return (
    <header className="flex h-14 flex-row items-center justify-between border-b border-border-subtlest-tertiary bg-background-default px-4 tablet:hidden">
      <HeaderLogo
        position={LogoPosition.Relative}
        onLogoClick={() => router.push('/')}
      />
      <MobileAppActions />
    </header>
  );
}

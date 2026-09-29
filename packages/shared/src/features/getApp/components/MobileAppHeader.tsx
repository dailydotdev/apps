import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import HeaderLogo from '../../../components/layout/HeaderLogo';
import { LogoPosition } from '../../../components/Logo';
import { useMobileAppHeader } from '../hooks/useMobileAppHeader';
import { MobileAppActions } from './MobileAppActions';

interface MobileAppHeaderProps {
  // Where it stands in for the sticky Log in / Sign up strip, it sticks the
  // same way, so Log in stays on screen.
  sticky?: boolean;
}

// For pages that have no top bar of their own on phones.
export function MobileAppHeader({
  sticky,
}: MobileAppHeaderProps): ReactElement | null {
  const router = useRouter();
  const isEnabled = useMobileAppHeader();

  if (!isEnabled) {
    return null;
  }

  return (
    <header
      className={classNames(
        'flex h-14 flex-row items-center justify-between border-b border-border-subtlest-tertiary bg-background-default px-4 tablet:hidden',
        sticky && 'sticky left-0 top-[var(--phone-top-ad-height,0px)] z-max',
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

import type { ReactElement, ReactNode } from 'react';
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import { useLfgEnabled } from '@dailydotdev/shared/src/features/lfg/hooks/useLfgEnabled';
import { getLayout as getFooterNavBarLayout } from '../layouts/FooterNavBarLayout';
import { getLayout } from '../layouts/MainLayout';
import ProtectedPage from '../ProtectedPage';

// Every Looking for group page: signed in and inside the flag.
export const LfgGate = ({
  children,
}: {
  children: ReactNode;
}): ReactElement | null => {
  const router = useRouter();
  const { isEnabled, isGatedOut } = useLfgEnabled();

  useEffect(() => {
    if (isGatedOut) {
      router.replace(webappUrl);
    }
  }, [isGatedOut, router]);

  if (isGatedOut || !router.isReady) {
    return null;
  }

  return <ProtectedPage>{isEnabled && children}</ProtectedPage>;
};

export const getLfgLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

import type { ReactElement, ReactNode } from 'react';
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import { useLfgEnabled } from '@dailydotdev/shared/src/features/lfg/hooks/useLfgEnabled';
import { getLayout as getFooterNavBarLayout } from '../layouts/FooterNavBarLayout';
import { getLayout } from '../layouts/MainLayout';
import ProtectedPage from '../ProtectedPage';

// Every Looking for group page: signed in, inside the flag, and knowing
// whether connections are open before anything paints.
export const LfgGate = ({
  children,
}: {
  children: (props: { isLaunched: boolean }) => ReactNode;
}): ReactElement | null => {
  const router = useRouter();
  const { isEnabled, isGatedOut, isLaunched, isLaunchKnown } = useLfgEnabled();

  useEffect(() => {
    if (isGatedOut) {
      router.replace(webappUrl);
    }
  }, [isGatedOut, router]);

  if (isGatedOut || !router.isReady) {
    return null;
  }

  return (
    <ProtectedPage>
      {isEnabled && isLaunchKnown && children({ isLaunched })}
    </ProtectedPage>
  );
};

export const getLfgLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

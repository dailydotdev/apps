import React, { ReactElement, ReactNode, useContext } from 'react';
import dynamic from 'next/dynamic';
import ProgressiveEnhancementContext from '@dailydotdev/shared/src/contexts/ProgressiveEnhancementContext';
import useShowSidebar from '@dailydotdev/shared/src/hooks/useShowSidebar';

const FooterNavBar = dynamic(
  () => import(/* webpackChunkName: "Sidebar" */ '../FooterNavBar'),
);

type FooterNavBarLayoutProps = { children?: ReactNode };

export default function FooterNavBarLayout({
  children,
}: FooterNavBarLayoutProps): ReactElement {
  const { windowLoaded } = useContext(ProgressiveEnhancementContext);
  const { showSidebar } = useShowSidebar();

  return (
    <>
      {!showSidebar && windowLoaded && <FooterNavBar />}
      {children}
    </>
  );
}

export const getLayout = (page: ReactNode): ReactNode => (
  <FooterNavBarLayout>{page}</FooterNavBarLayout>
);

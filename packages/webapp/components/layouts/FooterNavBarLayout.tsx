import React, { ReactElement, ReactNode, useContext } from 'react';
import dynamic from 'next/dynamic';
import ProgressiveEnhancementContext from '@dailydotdev/shared/src/contexts/ProgressiveEnhancementContext';
import useSidebarRendered from '@dailydotdev/shared/src/hooks/useSidebarRendered';

const FooterNavBar = dynamic(
  () => import(/* webpackChunkName: "Sidebar" */ '../FooterNavBar'),
);

type FooterNavBarLayoutProps = { children?: ReactNode };

export default function FooterNavBarLayout({
  children,
}: FooterNavBarLayoutProps): ReactElement {
  const { windowLoaded } = useContext(ProgressiveEnhancementContext);
  const { sidebarRendered } = useSidebarRendered();

  return (
    <>
      {sidebarRendered === false && windowLoaded && <FooterNavBar />}
      {children}
    </>
  );
}

export const getLayout = (page: ReactNode): ReactNode => (
  <FooterNavBarLayout>{page}</FooterNavBarLayout>
);

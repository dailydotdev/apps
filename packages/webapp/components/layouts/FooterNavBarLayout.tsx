import React, { ReactElement, ReactNode, useContext } from 'react';
import { laptop } from '../../styles/media';
import useMedia from '@dailydotdev/shared/src/hooks/useMedia';
import dynamic from 'next/dynamic';
import ProgressiveEnhancementContext from '@dailydotdev/shared/src/contexts/ProgressiveEnhancementContext';

export const footerNavBarBreakpoint = laptop;

const Sidebar = dynamic(
  () =>
    import(
      /* webpackChunkName: "Sidebar" */ '@dailydotdev/shared/src/components/Sidebar'
    ),
);

const FooterNavBar = dynamic(
  () => import(/* webpackChunkName: "Sidebar" */ '../FooterNavBar'),
);

type FooterNavBarLayoutProps = { children?: ReactNode };

export default function FooterNavBarLayout({
  children,
}: FooterNavBarLayoutProps): ReactElement {
  const { windowLoaded } = useContext(ProgressiveEnhancementContext);
  const showSidebar = useMedia(
    [footerNavBarBreakpoint.replace('@media ', '')],
    [true],
    false,
  );

  return (
    <>
      {showSidebar && windowLoaded && <Sidebar />}
      {!showSidebar && windowLoaded && <FooterNavBar />}
      {children}
    </>
  );
}

export const getLayout = (page: ReactNode): ReactNode => (
  <FooterNavBarLayout>{page}</FooterNavBarLayout>
);

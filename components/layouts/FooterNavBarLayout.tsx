import React, { ReactElement, ReactNode, useContext } from 'react';
import { css, Global } from '@emotion/react';
import { laptop } from '../../styles/media';
import useMedia from '../../hooks/useMedia';
import dynamic from 'next/dynamic';
import ProgressiveEnhancementContext from '../../contexts/ProgressiveEnhancementContext';
import { navBarHeight } from '../FooterNavBar';

export const footerNavBarBreakpoint = laptop;

const Sidebar = dynamic(
  () => import(/* webpackChunkName: "Sidebar" */ '../Sidebar'),
);

const FooterNavBar = dynamic(
  () => import(/* webpackChunkName: "Sidebar" */ '../FooterNavBar'),
);

type FooterNavBarLayoutProps = { children?: ReactNode };

const globalStyle = css`
  main {
    margin-bottom: ${navBarHeight};
  }

  ${footerNavBarBreakpoint} {
    main {
      margin-bottom: 0;
    }
  }
`;

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
      <Global styles={globalStyle} />
      {showSidebar && windowLoaded && <Sidebar />}
      {!showSidebar && windowLoaded && <FooterNavBar />}
      {children}
    </>
  );
}

export const getLayout = (page: ReactNode): ReactNode => (
  <FooterNavBarLayout>{page}</FooterNavBarLayout>
);

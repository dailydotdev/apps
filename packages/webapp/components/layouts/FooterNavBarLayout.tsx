import React, { ReactElement, ReactNode, useContext, useMemo } from 'react';
import dynamic from 'next/dynamic';
import ProgressiveEnhancementContext from '@dailydotdev/shared/src/contexts/ProgressiveEnhancementContext';
import useSidebarRendered from '@dailydotdev/shared/src/hooks/useSidebarRendered';
import { useViewSize, ViewSize } from '@dailydotdev/shared/src/hooks';
import { useMobileUxExperiment } from '@dailydotdev/shared/src/hooks/useMobileUxExperiment';
import { Post } from '@dailydotdev/shared/src/graphql/posts';

const FooterNavBar = dynamic(
  () => import(/* webpackChunkName: "footerNavBar" */ '../FooterNavBar'),
);

interface FooterNavBarLayoutProps {
  children?: ReactNode;
  post?: Post;
}

export default function FooterNavBarLayout({
  children,
  post,
}: FooterNavBarLayoutProps): ReactElement {
  const { windowLoaded } = useContext(ProgressiveEnhancementContext);
  const { sidebarRendered } = useSidebarRendered();
  const { isNewMobileLayout } = useMobileUxExperiment();
  const isTablet = useViewSize(ViewSize.Tablet);

  const showNav = useMemo(() => {
    if (!windowLoaded) {
      return false;
    }

    if (isNewMobileLayout) {
      return !isTablet;
    }

    return sidebarRendered === false;
  }, [isNewMobileLayout, windowLoaded, isTablet, sidebarRendered]);

  return (
    <>
      <FooterNavBar
        showNav={sidebarRendered === false && windowLoaded}
        post={post}
      />
      <FooterNavBar showNav={showNav} />
      {children}
    </>
  );
}

export const getLayout = (page: ReactNode): ReactNode => (
  <FooterNavBarLayout>{page}</FooterNavBarLayout>
);

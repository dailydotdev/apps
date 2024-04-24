import React, { ReactElement, ReactNode, useContext, useMemo } from 'react';
import dynamic from 'next/dynamic';
import ProgressiveEnhancementContext from '@dailydotdev/shared/src/contexts/ProgressiveEnhancementContext';
import useSidebarRendered from '@dailydotdev/shared/src/hooks/useSidebarRendered';
import { useViewSize, ViewSize } from '@dailydotdev/shared/src/hooks';
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
  const isTablet = useViewSize(ViewSize.Tablet);
  const isLaptop = useViewSize(ViewSize.Laptop);

  const showNav = useMemo(() => {
    if (!windowLoaded) {
      return false;
    }

    if (!isLaptop) {
      return !isTablet;
    }

    return sidebarRendered === false;
  }, [isLaptop, windowLoaded, isTablet, sidebarRendered]);

  return (
    <>
      {children}
      <div className={post ? 'h-40' : 'h-28'} />
      <FooterNavBar showNav={showNav} post={post} />
    </>
  );
}

export const getLayout = (page: ReactNode): ReactNode => (
  <FooterNavBarLayout>{page}</FooterNavBarLayout>
);

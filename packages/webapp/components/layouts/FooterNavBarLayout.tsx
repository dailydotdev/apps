import React, { ReactElement, ReactNode, useContext } from 'react';
import dynamic from 'next/dynamic';
import ProgressiveEnhancementContext from '@dailydotdev/shared/src/contexts/ProgressiveEnhancementContext';
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
  const isMobile = useViewSize(ViewSize.MobileL);

  const showNav = windowLoaded && isMobile;

  return (
    <>
      {children}
      {showNav && <div className={post ? 'h-40' : 'h-28'} />}
      <FooterNavBar showNav={showNav} post={post} />
    </>
  );
}

export const getLayout = (page: ReactNode): ReactNode => (
  <FooterNavBarLayout>{page}</FooterNavBarLayout>
);

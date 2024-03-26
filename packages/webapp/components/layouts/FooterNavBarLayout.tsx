import React, { ReactElement, ReactNode, useContext } from 'react';
import dynamic from 'next/dynamic';
import ProgressiveEnhancementContext from '@dailydotdev/shared/src/contexts/ProgressiveEnhancementContext';
import useSidebarRendered from '@dailydotdev/shared/src/hooks/useSidebarRendered';
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

  return (
    <>
      <FooterNavBar
        showNav={sidebarRendered === false && windowLoaded}
        post={post}
      />
      {children}
    </>
  );
}

export const getLayout = (page: ReactNode): ReactNode => (
  <FooterNavBarLayout>{page}</FooterNavBarLayout>
);

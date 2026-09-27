import type { ReactElement, ReactNode } from 'react';
import React, { useContext } from 'react';
import dynamic from 'next/dynamic';
import ProgressiveEnhancementContext from '@dailydotdev/shared/src/contexts/ProgressiveEnhancementContext';
import { useViewSize, ViewSize } from '@dailydotdev/shared/src/hooks';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { MobileAppFooterProvider } from '@dailydotdev/shared/src/features/getApp/contexts/MobileAppFooterContext';

const FooterWrapper = dynamic(
  () =>
    import(/* webpackChunkName: "footerWrapper" */ '../footer/FooterWrapper'),
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
    <MobileAppFooterProvider>
      {children}
      {showNav && <div className={post ? 'h-40' : 'h-16'} />}
      <FooterWrapper showNav={showNav} post={post} />
    </MobileAppFooterProvider>
  );
}

export const getLayout = (page: ReactNode): ReactNode => (
  <FooterNavBarLayout>{page}</FooterNavBarLayout>
);

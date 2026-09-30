import type { ReactElement, ReactNode } from 'react';
import React, { useContext } from 'react';
import dynamic from 'next/dynamic';
import ProgressiveEnhancementContext from '@dailydotdev/shared/src/contexts/ProgressiveEnhancementContext';
import { useViewSize, ViewSize } from '@dailydotdev/shared/src/hooks';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import {
  MobileAppFooterProvider,
  useMobileAppFooterContext,
} from '@dailydotdev/shared/src/features/getApp/contexts/MobileAppFooterContext';
import { mobileAppFooterHeight } from '@dailydotdev/shared/src/features/getApp/mobileAppFooter';

const FooterWrapper = dynamic(
  () =>
    import(/* webpackChunkName: "footerWrapper" */ '../footer/FooterWrapper'),
);

interface FooterNavBarLayoutProps {
  children?: ReactNode;
  post?: Post;
}

function FooterSpacer({
  post,
}: Pick<FooterNavBarLayoutProps, 'post'>): ReactElement {
  const { isRevealed: showAppFooter } = useMobileAppFooterContext();

  if (showAppFooter) {
    return <div className={mobileAppFooterHeight} />;
  }

  return <div className={post ? 'h-40' : 'h-16'} />;
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
      {showNav && <FooterSpacer post={post} />}
      <FooterWrapper showNav={showNav} post={post} />
    </MobileAppFooterProvider>
  );
}

export const getLayout = (page: ReactNode): ReactNode => (
  <FooterNavBarLayout>{page}</FooterNavBarLayout>
);

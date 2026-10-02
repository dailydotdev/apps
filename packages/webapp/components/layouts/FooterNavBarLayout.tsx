import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useViewSize, ViewSize } from '@dailydotdev/shared/src/hooks';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import {
  MobileAppFooterProvider,
  useMobileAppFooterContext,
} from '@dailydotdev/shared/src/features/getApp/contexts/MobileAppFooterContext';
import { mobileAppFooterHeight } from '@dailydotdev/shared/src/features/getApp/mobileAppFooter';
import { ShellCluster } from '@dailydotdev/shared/src/components/shell/ShellCluster';
import { hidesCluster } from '@dailydotdev/shared/src/components/shell/shellNav';
import { useRouter } from 'next/router';

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
}: Pick<FooterNavBarLayoutProps, 'post'>): ReactElement | null {
  const { isRevealed: showAppFooter } = useMobileAppFooterContext();
  const router = useRouter();

  if (showAppFooter) {
    return <div className={mobileAppFooterHeight} />;
  }

  if (hidesCluster(router?.pathname)) {
    return null;
  }

  // The bar's own height comes from the cluster (--shell-bottom); a post
  // page adds its floating action bar on top of it.
  return (
    <div
      className={post ? 'h-44 tablet:hidden' : 'tablet:hidden'}
      style={post ? undefined : { height: 'var(--shell-bottom, 5rem)' }}
    />
  );
}

function ClusterSlot(): ReactElement | null {
  const { isRevealed: showAppFooter } = useMobileAppFooterContext();

  if (showAppFooter) {
    return null;
  }

  return <ShellCluster />;
}

export default function FooterNavBarLayout({
  children,
  post,
}: FooterNavBarLayoutProps): ReactElement {
  const isMobile = useViewSize(ViewSize.MobileL);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  return (
    <MobileAppFooterProvider>
      {children}
      <FooterSpacer post={post} />
      <FooterWrapper showNav={hasHydrated && isMobile} post={post} />
      <ClusterSlot />
    </MobileAppFooterProvider>
  );
}

export const getLayout = (page: ReactNode): ReactNode => (
  <FooterNavBarLayout>{page}</FooterNavBarLayout>
);

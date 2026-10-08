import type { ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import dynamic from 'next/dynamic';
import ScrollToTopButton from '@dailydotdev/shared/src/components/ScrollToTopButton';
import {
  PostCapsule,
  useHasPostCapsule,
} from '@dailydotdev/shared/src/components/post/PostCapsule';
import { useActivePostContext } from '@dailydotdev/shared/src/contexts/ActivePostContext';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useMobileAppFooterContext } from '@dailydotdev/shared/src/features/getApp/contexts/MobileAppFooterContext';

const MobileAppFooter = dynamic(() =>
  import(
    /* webpackChunkName: "mobileAppFooter" */ '@dailydotdev/shared/src/features/getApp/components/MobileAppFooter'
  ).then((mod) => mod.MobileAppFooter),
);

const MobileAppSheet = dynamic(() =>
  import(
    /* webpackChunkName: "mobileAppSheet" */ '@dailydotdev/shared/src/features/getApp/components/MobileAppSheet'
  ).then((mod) => mod.MobileAppSheet),
);

interface FooterNavBarProps {
  showNav?: boolean;
  post?: Post;
}

export default function FooterWrapper({
  showNav = false,
  post,
}: FooterNavBarProps): ReactElement {
  const { requestOpenComment } = useActivePostContext();
  const { isLoggedIn } = useAuthContext();
  const { title: appFooterTitle } = useMobileAppFooterContext();
  const showAppFooter = !!appFooterTitle;
  const showCapsule = useHasPostCapsule(post);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const ownerRef = useRef<HTMLDivElement>(null);

  // The app footer takes the bottom over from the cluster; toasts read its
  // top edge to sit above it. The capsule registers as the shell's
  // accessory, so --shell-bottom already reaches its top.
  useEffect(() => {
    const wrapper = wrapperRef.current;
    const owner = ownerRef.current;
    if (!wrapper || !owner || typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    const root = document.documentElement;
    const observer = new ResizeObserver(() => {
      root.style.setProperty(
        '--shell-bottom-owner',
        `${wrapper.offsetHeight - owner.offsetTop}px`,
      );
    });
    observer.observe(wrapper, { box: 'border-box' });

    return () => {
      observer.disconnect();
      root.style.removeProperty('--shell-bottom-owner');
    };
  }, [showAppFooter]);

  return (
    <>
      <div
        ref={wrapperRef}
        className="pointer-events-none fixed !bottom-0 left-0 z-3 w-full"
      >
        <div className="hidden tablet:block">
          <ScrollToTopButton />
        </div>
        {showAppFooter && (
          <div ref={ownerRef} className="pointer-events-auto">
            <MobileAppFooter title={appFooterTitle} />
          </div>
        )}
        {showNav && isLoggedIn && <MobileAppSheet />}
      </div>
      {showCapsule && post && (
        <PostCapsule
          post={post}
          onCommentClick={(origin) => requestOpenComment?.(origin)}
        />
      )}
    </>
  );
}

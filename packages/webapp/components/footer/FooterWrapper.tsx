import type { ReactElement } from 'react';
import React from 'react';
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

  return (
    <>
      <div className="pointer-events-none fixed !bottom-0 left-0 z-3 w-full">
        <div className="hidden tablet:block">
          <ScrollToTopButton />
        </div>
        {showAppFooter && (
          <div className="pointer-events-auto">
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

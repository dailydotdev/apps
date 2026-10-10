import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { PostType } from '@dailydotdev/shared/src/graphql/posts';
import dynamic from 'next/dynamic';
import ScrollToTopButton from '@dailydotdev/shared/src/components/ScrollToTopButton';
import { MobilePostFloatingBar } from '@dailydotdev/shared/src/components/post/MobilePostFloatingBar';
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

  return (
    <div
      className={classNames(
        'pointer-events-none fixed !bottom-0 left-0 z-3 w-full',
        post &&
          !showAppFooter &&
          'pb-[calc(var(--shell-bottom,calc(4.5rem_+_env(safe-area-inset-bottom,0px)))-0.5rem)] tablet:pb-0',
      )}
    >
      <div className="pointer-events-auto hidden tablet:block">
        <ScrollToTopButton />
      </div>
      {showAppFooter && (
        <div className="pointer-events-auto">
          <MobileAppFooter title={appFooterTitle} />
        </div>
      )}
      {post && post.type !== PostType.Brief && !showAppFooter && (
        <div className="pointer-events-auto my-2 w-full px-2 tablet:hidden">
          <MobilePostFloatingBar
            post={post}
            onCommentClick={(origin) => requestOpenComment?.(origin)}
          />
        </div>
      )}
      {showNav && isLoggedIn && <MobileAppSheet />}
    </div>
  );
}

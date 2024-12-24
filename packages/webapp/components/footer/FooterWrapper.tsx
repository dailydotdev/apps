import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import dynamic from 'next/dynamic';
import { blurClasses } from './common';

const NewComment = dynamic(() =>
  import(
    /* webpackChunkName: "newComment" */ '@dailydotdev/shared/src/components/post/NewComment'
  ).then((mod) => mod.NewComment),
);

const ScrollToTopButton = dynamic(
  () =>
    import(
      /* webpackChunkName: "scrollToTopButton" */ '@dailydotdev/shared/src/components/ScrollToTopButton'
    ),
);

const MobileFooterNavbar = dynamic(
  () =>
    import(/* webpackChunkName: "mobileFooterNavbar" */ './MobileFooterNavbar'),
);

interface FooterNavBarProps {
  showNav?: boolean;
  post?: Post;
}

export default function FooterWrapper({
  showNav = false,
  post,
}: FooterNavBarProps): ReactElement {
  return (
    <div
      className={classNames(
        'fixed !bottom-0 left-0 z-3 w-full',
        showNav &&
          'footer-navbar bg-gradient-to-t from-background-subtle from-70% to-transparent px-2 pt-2',
      )}
    >
      {post ? (
        <div className="my-2 w-full px-2 tablet:hidden">
          <NewComment
            post={post}
            className={{
              container: classNames(
                blurClasses,
                'h-12 shadow-[0_0.25rem_1.5rem_0_var(--theme-shadow-shadow1)]',
              ),
            }}
          />
        </div>
      ) : (
        <ScrollToTopButton />
      )}
      {showNav && <MobileFooterNavbar isPostPage={!!post} />}
    </div>
  );
}

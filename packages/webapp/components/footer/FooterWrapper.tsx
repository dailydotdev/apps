import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { PostType } from '@dailydotdev/shared/src/graphql/posts';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import ScrollToTopButton from '@dailydotdev/shared/src/components/ScrollToTopButton';

const NewComment = dynamic(() =>
  import(
    /* webpackChunkName: "newComment" */ '@dailydotdev/shared/src/components/post/NewComment'
  ).then((mod) => mod.NewComment),
);

const MobilePostFloatingBar = dynamic(() =>
  import(
    /* webpackChunkName: "mobilePostFloatingBar" */ '@dailydotdev/shared/src/components/post/MobilePostFloatingBar'
  ).then((mod) => mod.MobilePostFloatingBar),
);

const FooterPlusButton = dynamic(() =>
  import(/* webpackChunkName: "footerPlusButton" */ './FooterPlusButton').then(
    (mod) => mod.FooterPlusButton,
  ),
);

const MobileFooterNavbar = dynamic(
  () =>
    import(/* webpackChunkName: "mobileFooterNavbar" */ './MobileFooterNavbar'),
);

const CommentInputOrModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "commentInputOrModal" */ '@dailydotdev/shared/src/components/comments/CommentInputOrModal'
    ),
);

interface FooterNavBarProps {
  showNav?: boolean;
  post?: Post;
  /** Lifts the bar above the /read template's floating ad — see that page. */
  offsetByAnchorAd?: boolean;
}

export default function FooterWrapper({
  showNav = false,
  post,
  offsetByAnchorAd = false,
}: FooterNavBarProps): ReactElement {
  const router = useRouter();

  const showPlusButton =
    !router?.pathname?.startsWith('/settings') &&
    !router?.pathname?.startsWith('/posts/') &&
    !router?.pathname?.startsWith('/giveback');

  return (
    <div
      className={classNames(
        'fixed left-0 z-3 w-full',
        // Only the /read template opts in, and only below laptop. There the
        // floating leaderboard spans the width and the nav bar would sit on
        // top of it, so the bar rides above the ad's measured height. From
        // laptop up the ad is confined to the article column while this
        // wrapper's only occupant is the scroll-to-top button over on the
        // right — they never overlap, and lifting it there just parks the
        // button in mid-air.
        offsetByAnchorAd
          ? '!bottom-[var(--arbitrage-anchor-height,0px)] laptop:!bottom-0'
          : '!bottom-0',
        showNav &&
          'bg-gradient-to-t from-background-subtle from-70% to-transparent px-2 pt-2',
      )}
    >
      <div className="hidden tablet:block">
        <ScrollToTopButton />
      </div>
      {post && post.type !== PostType.Brief && (
        <div className="my-2 w-full px-2 tablet:hidden">
          <NewComment
            post={post}
            shouldHandleCommentQuery
            CommentInputOrModal={CommentInputOrModal}
            renderTrigger={({ onCommentClick }) => (
              <MobilePostFloatingBar
                post={post}
                onCommentClick={onCommentClick}
              />
            )}
          />
        </div>
      )}
      {showNav && (
        <div className="relative">
          {showPlusButton && (
            <FooterPlusButton className="absolute bottom-full right-2 z-1 mb-2" />
          )}
          <MobileFooterNavbar />
        </div>
      )}
    </div>
  );
}

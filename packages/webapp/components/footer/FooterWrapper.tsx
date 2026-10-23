import type { ReactElement } from 'react';
import classNames from 'classnames';
import React from 'react';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import dynamic from 'next/dynamic';
import ScrollToTopButton from '@dailydotdev/shared/src/components/ScrollToTopButton';
import {
  PostCapsule,
  useHasPostCapsule,
} from '@dailydotdev/shared/src/components/post/PostCapsule';
import { useActivePostContext } from '@dailydotdev/shared/src/contexts/ActivePostContext';
import { useMobileAppFooterContext } from '@dailydotdev/shared/src/features/getApp/contexts/MobileAppFooterContext';
import { useCommentsTeaser } from '@dailydotdev/shared/src/features/commentsTeaser/useCommentsTeaser';
import { useRevealOnEngagement } from '@dailydotdev/shared/src/features/commentsTeaser/useRevealOnEngagement';
import { getCommentsTeaserTitle } from '@dailydotdev/shared/src/features/commentsTeaser/commentsTeaser';

const MobileAppFooter = dynamic(() =>
  import(
    /* webpackChunkName: "mobileAppFooter" */ '@dailydotdev/shared/src/features/getApp/components/MobileAppFooter'
  ).then((mod) => mod.MobileAppFooter),
);

interface FooterNavBarProps {
  post?: Post;
}

export default function FooterWrapper({
  post,
}: FooterNavBarProps): ReactElement {
  const { requestOpenComment } = useActivePostContext();
  const { title: appFooterTitle } = useMobileAppFooterContext();
  const showAppFooter = !!appFooterTitle;
  // The comment teaser speaks through the same footer on a post page, and
  // brings it in on X's timing instead of on load.
  const isCommentsTeaser = useCommentsTeaser();
  const teaserTitle =
    isCommentsTeaser && post
      ? getCommentsTeaserTitle(post.numComments)
      : undefined;
  const isTeaserFooter = showAppFooter && !!teaserTitle;
  const isTeaserFooterRevealed = useRevealOnEngagement(isTeaserFooter);
  const showCapsule = useHasPostCapsule(post);

  return (
    <>
      <div className="pointer-events-none fixed !bottom-0 left-0 z-3 w-full">
        <div className="pointer-events-auto hidden tablet:block">
          <ScrollToTopButton />
        </div>
        {showAppFooter && (!isTeaserFooter || isTeaserFooterRevealed) && (
          <div
            className={classNames(
              'pointer-events-auto',
              isTeaserFooter && 'animate-teaser-fade',
            )}
          >
            <MobileAppFooter title={teaserTitle ?? appFooterTitle} />
          </div>
        )}
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

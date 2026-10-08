import dynamic from 'next/dynamic';
import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import PostEngagements from './PostEngagements';
import type { BasePostContentProps } from './common';
import { PostHeaderActions } from './PostHeaderActions';
import { PostAnsweredQuestions } from './PostAnsweredQuestions';
import { ButtonSize } from '../buttons/common';
import { PostSignupWidget } from './PostSignupWidget';
import {
  useMobileAppHeader,
  useMobileAppHeaderIconOnlyRead,
} from '../../features/getApp/hooks/useMobileAppHeader';
import { useIsPhone } from '../../hooks/useViewSize';
import { useHasPostCapsule } from './PostCapsule';

const Custom404 = dynamic(
  () => import(/* webpackChunkName: "custom404" */ '../Custom404'),
);

const GoBackHeaderMobile = dynamic(
  () =>
    import(/* webpackChunkName: "goBackHeaderMobile" */ './GoBackHeaderMobile'),
  {
    ssr: false,
    loading: () => (
      <div className="-mx-4 hidden h-12 border-b border-border-subtlest-tertiary tablet:block laptop:hidden" />
    ),
  },
);

export function BasePostContent({
  post,
  isFallback,
  origin,
  children,
  className = {},
  navigationProps,
  engagementProps,
  shouldOnboardAuthor,
  aboveComments,
  commentAds,
  isPostPage,
}: BasePostContentProps): ReactElement {
  const { id } = post ?? {};
  const { onCopyPostLink } = engagementProps ?? {};
  const postPageNavigationProps = isPostPage ? navigationProps : undefined;
  const onReadArticle = postPageNavigationProps?.onReadArticle;
  const isMobileAppHeader = useMobileAppHeader();
  const isPhone = useIsPhone();
  const isIconOnlyRead = useMobileAppHeaderIconOnlyRead();
  const hasCapsule = useHasPostCapsule(isPostPage ? post : undefined);

  if (!id && !isFallback) {
    return <Custom404 />;
  }

  if (isPostPage && !postPageNavigationProps) {
    throw new Error('BasePostContent requires navigationProps on post pages');
  }

  return (
    <>
      {isPostPage && (
        <GoBackHeaderMobile
          className={classNames(className.header, '-mx-4 bg-background-subtle')}
        >
          <PostHeaderActions
            post={post}
            className={isMobileAppHeader ? undefined : 'ml-auto'}
            contextMenuId="post-page-header-actions"
            onReadArticle={onReadArticle}
            buttonSize={ButtonSize.Small}
            inBlock={isPhone}
            hideOptions={isMobileAppHeader}
            inlineActions={isIconOnlyRead}
            hideSubscribeAction={isMobileAppHeader}
          />
        </GoBackHeaderMobile>
      )}
      {children}
      {!!post?.id && <PostSignupWidget post={post} inline className="my-6" />}
      {isPostPage && <PostAnsweredQuestions post={post} className="mt-6" />}
      {aboveComments}
      {!!engagementProps && (
        <PostEngagements
          post={post}
          onCopyLinkClick={onCopyPostLink}
          logOrigin={origin}
          shouldOnboardAuthor={shouldOnboardAuthor}
          hideInternalAd={!!commentAds}
          interleaveEvery={commentAds?.interleaveEvery}
          renderInterleaved={commentAds?.renderInterleaved}
          actionsClassName={hasCapsule ? 'hidden tablet:flex' : undefined}
        />
      )}
    </>
  );
}

import classNames from 'classnames';
import type { ReactElement } from 'react';
import React, { Fragment, useEffect } from 'react';
import { ToastSubject, useToastNotification } from '../../../hooks';
import PostContentContainer from '../PostContentContainer';
import { BasePostContent } from '../BasePostContent';
import { TimeFormatType } from '../../../lib/dateFormat';
import Markdown from '../../Markdown';
import type { PostContentProps, PostNavigationProps } from '../common';
import { PostContainer } from '../common';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useViewPost } from '../../../hooks/post/useViewPost';
import { DateFormat } from '../../utilities';
import { withPostById } from '../withPostById';
import { BriefPostHeaderActions } from './BriefPostHeaderActions';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { Pill } from '../../Pill';
import { TimerIcon } from '../../icons';
import { CollectionPillSources } from '../collection/CollectionPillSources';
import { ProfileImageSize } from '../../ProfilePicture';

const BriefPostContentRaw = ({
  post,
  className = {},
  shouldOnboardAuthor,
  origin,
  position,
  inlineActions,
  onPreviousPost,
  onNextPost,
  onClose,
  postPosition,
  isFallback,
  customNavigation,
  onRemovePost,
  backToSquad,
  isBannerVisible,
  isPostPage,
}: PostContentProps): ReactElement => {
  const { user } = useAuthContext();
  const { subject } = useToastNotification();
  const { updatedAt, createdAt, contentHtml } = post;
  // TODO feat-brief: load posts and sources count from post
  const postsCount = 8888;
  const sourcesCount = 8888;

  const hasNavigation = !!onPreviousPost || !!onNextPost;
  const containerClass = classNames(
    'laptop:flex-row laptop:pb-0',
    className?.container,
  );

  const navigationProps: PostNavigationProps = {
    postPosition,
    onPreviousPost,
    onNextPost,
    post,
    onClose,
    inlineActions,
    onRemovePost,
  };

  const onSendViewPost = useViewPost();

  useEffect(() => {
    if (!post?.id || !user?.id) {
      return;
    }

    onSendViewPost(post.id);
  }, [post?.id, onSendViewPost, user?.id]);

  return (
    <PostContentContainer
      hasNavigation={hasNavigation}
      className={containerClass}
      aria-live={subject === ToastSubject.PostContent ? 'polite' : 'off'}
      navigationProps={
        position === 'fixed'
          ? {
              ...navigationProps,
              isBannerVisible,
              className: className?.fixedNavigation,
            }
          : null
      }
    >
      <PostContainer
        className={classNames('relative', className?.content)}
        data-testid="postContainer"
      >
        <BasePostContent
          className={{
            ...className,
            onboarding: classNames(
              className?.onboarding,
              backToSquad && 'mb-6',
            ),
            navigation: {
              actions: className?.navigation?.actions,
              container: classNames('pt-6', className?.navigation?.container),
            },
          }}
          isPostPage={isPostPage}
          isFallback={isFallback}
          customNavigation={customNavigation}
          shouldOnboardAuthor={shouldOnboardAuthor}
          navigationProps={navigationProps}
          origin={origin}
          post={post}
        >
          <div
            className={classNames(
              'mb-6 flex flex-col gap-6',
              hasNavigation || customNavigation ? 'mt-6' : 'mt-6 laptop:mt-0',
            )}
          >
            <div className="absolute -top-2 right-8">
              <BriefPostHeaderActions
                post={post}
                onClose={onClose}
                className="hidden pt-6 laptop:flex"
                contextMenuId="post-widgets-context"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Typography
                type={TypographyType.LargeTitle}
                bold
                className="break-words"
                data-testid="post-modal-title"
              >
                {post.title}
              </Typography>
              <Typography type={TypographyType.Title3}>
                <DateFormat
                  date={updatedAt || createdAt}
                  type={TimeFormatType.Post}
                />
              </Typography>
              <Typography
                type={TypographyType.Callout}
                color={TypographyColor.Tertiary}
              >
                Brief completed in 38m · Save 3.5h of reading
              </Typography>
            </div>
            <div className="flex items-center gap-3">
              <Pill
                className="rounded-20 border border-border-subtlest-tertiary px-2.5 py-2"
                label={
                  <div className="flex items-center gap-1">
                    <TimerIcon />
                    <Typography type={TypographyType.Footnote}>
                      {post.readTime}m read
                    </Typography>
                  </div>
                }
              />
              <div className="flex items-center gap-1">
                <CollectionPillSources
                  alwaysShowSources
                  className={{
                    main: classNames('m-2'),
                  }}
                  // TODO feat-brief load multiple sources same as collections
                  sources={[post.source]}
                  totalSources={1}
                  size={ProfileImageSize.Size16}
                />
                <Typography
                  className="flex flex-row gap-2"
                  type={TypographyType.Subhead}
                  color={TypographyColor.Tertiary}
                >
                  {[
                    postsCount && `${postsCount} posts`,
                    sourcesCount && `${sourcesCount} sources`,
                  ]
                    .filter(Boolean)
                    .map((item, index) => {
                      return (
                        // eslint-disable-next-line react/no-array-index-key
                        <Fragment key={index}>
                          {index > 0 ? ' • ' : undefined}
                          {item}
                        </Fragment>
                      );
                    })}
                </Typography>
              </div>
            </div>
            <Markdown content={contentHtml} />
          </div>
        </BasePostContent>
      </PostContainer>
    </PostContentContainer>
  );
};

export const BriefPostContent = withPostById(BriefPostContentRaw);

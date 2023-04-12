import React, {
  ReactElement,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useMutation } from 'react-query';
import classNames from 'classnames';
import { PostNavigationProps } from './PostNavigation';
import { postDateFormat } from '../../lib/dateFormat';
import PostContentContainer from './PostContentContainer';
import usePostContent from '../../hooks/usePostContent';
import FixedPostNavigation from './FixedPostNavigation';
import PostSummary from '../cards/PostSummary';
import { LazyImage } from '../LazyImage';
import { ReadArticleButton } from '../cards/ReadArticleButton';
import ArrowIcon from '../icons/Arrow';
import PostSourceInfo from './PostSourceInfo';
import { PostContentProps } from './PostContent';
import { BasePostContent } from './BasePostContent';
import { cloudinary } from '../../lib/image';
import SettingsContext from '../../contexts/SettingsContext';
import { ProfilePicture } from '../ProfilePicture';
import { ProfileTooltip } from '../profile/ProfileTooltip';
import { sendViewPost } from '../../graphql/posts';
import SquadMemberBadge from '../squads/SquadMemberBadge';
import { useMemberRoleForSource } from '../../hooks/useMemberRoleForSource';

function SquadPostContent({
  post,
  isFallback,
  shouldOnboardAuthor,
  enableShowShareNewComment,
  origin,
  position,
  postPosition,
  inlineActions,
  className,
  customNavigation,
  onPreviousPost,
  onNextPost,
  onClose,
  onRemovePost,
}: PostContentProps): ReactElement {
  const { mutateAsync: onSendViewPost } = useMutation(sendViewPost);
  const { openNewTab } = useContext(SettingsContext);
  const hasNavigation = !!onPreviousPost || !!onNextPost;
  const [height, setHeight] = useState<number>(null);
  const [shouldShowSummary, setShouldShowSummary] = useState(true);
  const engagementActions = usePostContent({ origin, post });
  const { onReadArticle, onSharePost, onToggleBookmark } = engagementActions;
  const { role } = useMemberRoleForSource({
    source: post?.source,
    user: post?.author,
  });

  const navigationProps: PostNavigationProps = {
    post,
    onBookmark: onToggleBookmark,
    onPreviousPost,
    onNextPost,
    onShare: onSharePost,
    postPosition,
    onClose,
    inlineActions,
    onRemovePost,
  };

  const tldrHeight = useMemo(() => {
    if (height === null) return 'auto';

    return shouldShowSummary ? height : 0;
  }, [shouldShowSummary, height]);

  useEffect(() => {
    if (!post?.id) {
      return;
    }

    onSendViewPost(post.id);
  }, [post?.id]);

  return (
    <>
      {position === 'fixed' && (
        <FixedPostNavigation
          {...navigationProps}
          onReadArticle={onReadArticle}
          className={className?.fixedNavigation}
        />
      )}
      <PostContentContainer
        className={classNames(
          'relative py-8 px-6 post-content',
          className?.container,
        )}
        hasNavigation={hasNavigation}
      >
        <BasePostContent
          className={{
            ...className,
            onboarding: 'mb-6',
            navigation: { actions: 'ml-auto', container: 'mb-6' },
          }}
          isFallback={isFallback}
          customNavigation={customNavigation}
          enableShowShareNewComment={enableShowShareNewComment}
          shouldOnboardAuthor={shouldOnboardAuthor}
          navigationProps={navigationProps}
          engagementProps={engagementActions}
          origin={origin}
          post={post}
        >
          <PostSourceInfo
            date={postDateFormat(post.createdAt)}
            source={post.source}
            className="!typo-body"
          />
          <span className="flex flex-row items-center mt-3">
            <ProfileTooltip user={post.author}>
              <ProfilePicture
                user={post.author}
                size="xxlarge"
                nativeLazyLoading
              />
            </ProfileTooltip>
            <ProfileTooltip
              user={post.author}
              link={{ href: post.author.permalink }}
            >
              <a className="flex flex-col ml-4">
                <div className="flex items-center">
                  <span className="font-bold">{post.author.name}</span>
                  <SquadMemberBadge key="squadMemberRole" role={role} />
                </div>
                <span className="text-theme-label-tertiary">
                  @{post.author.username}
                </span>
              </a>
            </ProfileTooltip>
          </span>
          <p className="mt-6 typo-title3">{post.title}</p>
          <div className="flex flex-col mt-8 rounded-16 border border-theme-divider-tertiary hover:border-theme-divider-secondary">
            <a
              href={
                post.sharedPost.source.id === 'unknown'
                  ? post.sharedPost.permalink
                  : post.sharedPost.commentsPermalink
              }
              title="Go to post"
              target="_blank"
              rel="noopener"
              className="flex flex-col-reverse laptop:flex-row p-4 max-w-full"
              onClick={onReadArticle}
            >
              <div className="flex flex-col flex-1">
                <h2 className="flex flex-wrap mt-4 laptop:mt-0 mb-4 font-bold typo-body">
                  {post.sharedPost.title}
                </h2>
                <PostSourceInfo
                  date={
                    post.sharedPost.readTime
                      ? `${post.sharedPost.readTime}m read time`
                      : undefined
                  }
                  source={post.sharedPost.source}
                  size="small"
                />
                <ReadArticleButton
                  className="mt-5 btn-secondary w-fit"
                  href={post.sharedPost.permalink}
                  openNewTab={openNewTab}
                  onClick={onReadArticle}
                />
              </div>
              <div className="block overflow-hidden ml-2 w-70 rounded-2xl cursor-pointer h-fit">
                <LazyImage
                  imgSrc={post.sharedPost.image}
                  imgAlt="Post cover image"
                  ratio="52%"
                  eager
                  fallbackSrc={cloudinary.post.imageCoverPlaceholder}
                />
              </div>
            </a>
            {post.sharedPost.summary && (
              <>
                <PostSummary
                  ref={(el) => {
                    if (!el?.offsetHeight || height !== null) return;

                    setHeight(el.offsetHeight);
                  }}
                  style={{ height: tldrHeight }}
                  className={classNames(
                    'mx-4 transition-all duration-300 ease-in-out',
                    shouldShowSummary && 'mb-4',
                  )}
                  summary={post.sharedPost.summary}
                />
                <button
                  type="button"
                  className="flex flex-row justify-center py-2 w-full font-bold hover:underline border-t border-theme-divider-tertiary typo-callout"
                  onClick={() => setShouldShowSummary(!shouldShowSummary)}
                >
                  {shouldShowSummary ? 'Hide' : 'Show'} TLDR{' '}
                  <ArrowIcon
                    className={classNames(
                      'ml-2 transition-transform ease-in-out duration-300',
                      !shouldShowSummary && 'rotate-180',
                    )}
                  />
                </button>
              </>
            )}
          </div>
        </BasePostContent>
      </PostContentContainer>
    </>
  );
}

export default SquadPostContent;

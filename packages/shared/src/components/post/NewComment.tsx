import React, {
  forwardRef,
  MutableRefObject,
  ReactElement,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import {
  getProfilePictureClasses,
  ProfileImageSize,
  ProfilePicture,
} from '../ProfilePicture';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { Image } from '../image/Image';
import { fallbackImages } from '../../lib/config';
import { CommentMarkdownInputProps } from '../fields/MarkdownInput/CommentMarkdownInput';
import { useAuthContext } from '../../contexts/AuthContext';
import { useAnalyticsContext } from '../../contexts/AnalyticsContext';
import { postAnalyticsEvent } from '../../lib/feed';
import { AnalyticsEvent, Origin } from '../../lib/analytics';
import { PostType } from '../../graphql/posts';
import { AuthTriggers } from '../../lib/auth';
import CommentInputOrPage from '../comments/CommentInputOrPage';

interface NewCommentProps extends CommentMarkdownInputProps {
  size?: ProfileImageSize;
}

const buttonSize: Partial<Record<ProfileImageSize, ButtonSize>> = {
  large: ButtonSize.Medium,
  medium: ButtonSize.Small,
};

export interface NewCommentRef {
  onShowInput: (origin: Origin) => void;
}

function NewCommentComponent(
  { className, size = 'large', onCommented, post, ...props }: NewCommentProps,
  ref: MutableRefObject<NewCommentRef>,
): ReactElement {
  const router = useRouter();
  const { trackEvent } = useAnalyticsContext();
  const { user, showLogin } = useAuthContext();
  const [inputContent, setInputContent] = useState<string>(undefined);

  const onSuccess: typeof onCommented = (comment, isNew) => {
    setInputContent(undefined);
    onCommented(comment, isNew);
  };

  const onShowComment = useCallback(
    (origin: Origin, content = '') => {
      trackEvent(
        postAnalyticsEvent(AnalyticsEvent.OpenComment, post, {
          extra: { origin },
        }),
      );

      setInputContent(content);
    },
    [post, trackEvent, setInputContent],
  );

  const hasCommentQuery = typeof router.query.comment === 'string';

  useEffect(() => {
    if (!hasCommentQuery || post.type !== PostType.Welcome) {
      return;
    }

    const { comment, ...query } = router.query;

    onShowComment(Origin.SquadChecklist, comment);

    router.replace({ pathname: router.pathname, query }, undefined, {
      shallow: true,
    });
  }, [post, hasCommentQuery, onShowComment, router]);

  const onCommentClick = (origin: Origin) => {
    if (!user) {
      return showLogin({ trigger: AuthTriggers.NewComment });
    }

    return onShowComment(origin);
  };

  useImperativeHandle(ref, () => ({
    onShowInput: onCommentClick,
  }));

  if (typeof inputContent !== 'undefined') {
    return (
      <CommentInputOrPage
        {...props}
        post={post}
        className={{ input: { container: 'my-4', tab: className?.tab } }}
        onCommented={onSuccess}
        initialContent={inputContent}
        onClose={() => setInputContent(undefined)}
      />
    );
  }

  const pictureClasses = 'hidden tablet:flex';

  return (
    <button
      type="button"
      className={classNames(
        'flex w-full items-center gap-4 rounded-16 border-t border-theme-divider-tertiary bg-blur-highlight p-3 typo-callout hover:border-theme-divider-primary hover:bg-theme-hover tablet:border tablet:bg-theme-float',
        className?.container,
      )}
      onClick={() => onCommentClick(Origin.StartDiscussion)}
    >
      {user ? (
        <ProfilePicture
          user={user}
          size={size}
          nativeLazyLoading
          className={pictureClasses}
        />
      ) : (
        <Image
          src={fallbackImages.avatar}
          alt="Placeholder image for anonymous user"
          className={classNames(
            pictureClasses,
            getProfilePictureClasses('large'),
          )}
        />
      )}
      <span className="text-theme-label-tertiary">Share your thoughts</span>
      <Button
        size={buttonSize[size]}
        className="ml-auto hidden text-theme-label-primary tablet:flex"
        variant={ButtonVariant.Secondary}
        tag="a"
        disabled
      >
        Post
      </Button>
    </button>
  );
}

export const NewComment = forwardRef(NewCommentComponent);

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
import { useLogContext } from '../../contexts/LogContext';
import { postLogEvent } from '../../lib/feed';
import { LogEvent, Origin } from '../../lib/log';
import { PostType } from '../../graphql/posts';
import { AuthTriggers } from '../../lib/auth';
import CommentInputOrModal from '../comments/CommentInputOrModal';

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
  {
    className,
    size = ProfileImageSize.Large,
    onCommented,
    post,
    ...props
  }: NewCommentProps,
  ref: MutableRefObject<NewCommentRef>,
): ReactElement {
  const router = useRouter();
  const { logEvent } = useLogContext();
  const { user, showLogin } = useAuthContext();
  const [inputContent, setInputContent] = useState<string>(undefined);

  const onSuccess: typeof onCommented = (comment, isNew) => {
    setInputContent(undefined);
    onCommented?.(comment, isNew);
  };

  const onShowComment = useCallback(
    (origin: Origin, content = '') => {
      logEvent(
        postLogEvent(LogEvent.OpenComment, post, {
          extra: { origin },
        }),
      );

      setInputContent(content);
    },
    [post, logEvent, setInputContent],
  );

  const hasCommentQuery = typeof router.query.comment === 'string';

  useEffect(() => {
    if (!hasCommentQuery || post.type !== PostType.Welcome) {
      return;
    }

    const { comment, ...query } = router.query;

    onShowComment(Origin.SquadChecklist, comment as string);

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
      <CommentInputOrModal
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
        'flex w-full items-center gap-4 rounded-16 border-t border-border-subtlest-tertiary bg-blur-highlight p-3 typo-callout hover:border-border-subtlest-primary hover:bg-surface-hover tablet:border tablet:bg-surface-float',
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
            getProfilePictureClasses(ProfileImageSize.Large),
          )}
        />
      )}
      <span className="text-text-tertiary">Share your thoughts</span>
      <Button
        size={buttonSize[size]}
        className="ml-auto hidden text-text-primary tablet:flex"
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

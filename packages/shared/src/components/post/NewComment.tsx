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
import { Button, ButtonSize, ButtonVariant } from '../buttons/ButtonV2';
import { Image } from '../image/Image';
import { fallbackImages } from '../../lib/config';
import {
  CommentMarkdownInput,
  CommentMarkdownInputProps,
} from '../fields/MarkdownInput/CommentMarkdownInput';
import { useAuthContext } from '../../contexts/AuthContext';
import { useAnalyticsContext } from '../../contexts/AnalyticsContext';
import { postAnalyticsEvent } from '../../lib/feed';
import { AnalyticsEvent, Origin } from '../../lib/analytics';
import { PostType } from '../../graphql/posts';
import { AuthTriggers } from '../../lib/auth';

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

  const onShowComment = useCallback(
    (origin: Origin, content = '') => {
      trackEvent(
        postAnalyticsEvent(AnalyticsEvent.OpenComment, post, {
          extra: { origin },
        }),
      );

      return setInputContent(content);
    },
    [post, trackEvent],
  );

  const onSuccess: typeof onCommented = (comment, isNew) => {
    setInputContent(undefined);
    onCommented(comment, isNew);
  };

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
  }, [post, hasCommentQuery, setInputContent, onShowComment, router]);

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
      <CommentMarkdownInput
        {...props}
        post={post}
        className={{ container: 'my-4', tab: className?.tab }}
        onCommented={onSuccess}
        initialContent={inputContent}
      />
    );
  }

  return (
    <button
      type="button"
      className={classNames(
        'flex w-full items-center rounded-16 border border-theme-divider-tertiary bg-theme-float p-3 typo-callout hover:border-theme-divider-primary hover:bg-theme-hover',
        className?.container,
      )}
      onClick={() => onCommentClick(Origin.StartDiscussion)}
    >
      {user ? (
        <ProfilePicture user={user} size={size} nativeLazyLoading />
      ) : (
        <Image
          src={fallbackImages.avatar}
          alt="Placeholder image for anonymous user"
          className={getProfilePictureClasses('large')}
        />
      )}
      <span className="ml-4 text-theme-label-tertiary">
        Share your thoughts
      </span>
      <Button
        size={buttonSize[size]}
        className="ml-auto text-theme-label-primary"
        variant={ButtonVariant.Secondary}
        disabled
      >
        Post
      </Button>
    </button>
  );
}

export const NewComment = forwardRef(NewCommentComponent);

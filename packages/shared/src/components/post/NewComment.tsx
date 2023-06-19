import React, {
  forwardRef,
  MutableRefObject,
  ReactElement,
  useImperativeHandle,
  useState,
} from 'react';
import classNames from 'classnames';
import {
  getProfilePictureClasses,
  ProfileImageSize,
  ProfilePicture,
} from '../ProfilePicture';
import { Button, ButtonSize } from '../buttons/Button';
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
  { className, size = 'large', onCommented, ...props }: NewCommentProps,
  ref: MutableRefObject<NewCommentRef>,
): ReactElement {
  const { trackEvent } = useAnalyticsContext();
  const { user, showLogin } = useAuthContext();
  const [shouldShowInput, setShouldShowInput] = useState(false);

  const onSuccess: typeof onCommented = (comment, isNew) => {
    setShouldShowInput(false);
    onCommented(comment, isNew);
  };

  const onCommentClick = (origin: Origin) => {
    if (!user) {
      return showLogin('new comment');
    }

    trackEvent(
      postAnalyticsEvent(AnalyticsEvent.OpenComment, props.post, {
        extra: { origin },
      }),
    );

    return setShouldShowInput(true);
  };

  useImperativeHandle(ref, () => ({
    onShowInput: onCommentClick,
  }));

  if (shouldShowInput) {
    return (
      <CommentMarkdownInput
        {...props}
        className={{ container: 'my-4', tab: className?.tab }}
        onCommented={onSuccess}
      />
    );
  }

  return (
    <button
      type="button"
      className={classNames(
        'flex items-center p-3 w-full rounded-16 typo-callout border bg-theme-float hover:bg-theme-hover border-theme-divider-tertiary hover:border-theme-divider-primary',
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
        buttonSize={buttonSize[size]}
        className="ml-auto btn-secondary"
        readOnly
      >
        Post
      </Button>
    </button>
  );
}

export const NewComment = forwardRef(NewCommentComponent);

import React, { ReactElement, useState } from 'react';
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

interface NewCommentProps extends CommentMarkdownInputProps {
  className?: string;
  size?: ProfileImageSize;
}

const buttonSize: Partial<Record<ProfileImageSize, ButtonSize>> = {
  large: ButtonSize.Medium,
  medium: ButtonSize.Small,
};

export function NewComment({
  className,
  size = 'large',
  ...props
}: NewCommentProps): ReactElement {
  const { user } = useAuthContext();
  const [shouldShowInput, setShouldShowInput] = useState(false);

  if (shouldShowInput) {
    return (
      <CommentMarkdownInput
        {...props}
        className="mt-4"
        onCommented={() => setShouldShowInput(false)}
      />
    );
  }

  return (
    <button
      type="button"
      className={classNames(
        'flex items-center p-3 w-full rounded-16 typo-callout border bg-theme-float hover:bg-theme-hover border-theme-divider-tertiary hover:border-theme-divider-primary',
        className,
      )}
      onClick={() => setShouldShowInput(true)}
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

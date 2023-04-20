import React, { FormEvent, ReactElement, useState } from 'react';
import classNames from 'classnames';
import { useMutation } from 'react-query';
import { ProfilePicture } from '../ProfilePicture';
import { Button, ButtonSize } from '../buttons/Button';
import { useAuthContext } from '../../contexts/AuthContext';
import useSidebarRendered from '../../hooks/useSidebarRendered';
import { getExternalLinkPreview, getPostByUrl } from '../../graphql/posts';
import { ApiError, ApiErrorResult, hasApiError } from '../../graphql/common';
import { PostToSquadModalProps } from '../modals/PostToSquadModal';
import LockIcon from '../icons/Lock';
import { Card } from '../cards/Card';
import { IconSize } from '../Icon';
import { useToastNotification } from '../../hooks/useToastNotification';

export type NewSquadPostProps = Pick<
  PostToSquadModalProps,
  'privateLink' | 'post' | 'onSharedSuccessfully'
>;

interface SharePostBarProps {
  className?: string;
  onNewSquadPost?: (props?: NewSquadPostProps) => void;
  disabled?: boolean;
}

const allowedSubmissionErrors = [ApiError.NotFound, ApiError.Forbidden];

function SharePostBar({
  className,
  onNewSquadPost,
  disabled = false,
}: SharePostBarProps): ReactElement {
  const { displayToast } = useToastNotification();
  const [url, setUrl] = useState('');
  const onSharedSuccessfully = () => setUrl('');
  const { mutateAsync: getPrivateLink, isLoading: isLoadingPreview } =
    useMutation(getExternalLinkPreview, {
      onSuccess: (preview, link) => {
        const privateLink = { url: link, ...preview };
        onNewSquadPost({ privateLink, onSharedSuccessfully });
      },
      onError: (err: ApiErrorResult, link) => {
        const rateLimited = hasApiError(err, ApiError.RateLimited);
        if (rateLimited) {
          displayToast(rateLimited.message);
        }

        onNewSquadPost({ privateLink: { url: link }, onSharedSuccessfully });
      },
    });
  const { mutateAsync: getPost, isLoading: isCheckingUrl } = useMutation(
    getPostByUrl,
    {
      onSuccess: (post) => {
        onNewSquadPost({ post, onSharedSuccessfully });
      },
      onError: (err: ApiErrorResult, link) => {
        if (link === '') {
          onNewSquadPost({ privateLink: { url: link } });
          return;
        }

        if (allowedSubmissionErrors.some((code) => hasApiError(err, code))) {
          getPrivateLink(url);
        }
      },
    },
  );
  const { user } = useAuthContext();
  const { sidebarRendered } = useSidebarRendered();
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await getPost(url);
  };

  if (disabled) {
    return (
      <Card className="flex gap-1.5 items-center py-5 px-3 !flex-row hover:border-theme-divider-tertiary text-theme-label-quaternary">
        <LockIcon size={IconSize.Small} />
        <p className="typo-callout">Only admins and moderators can post</p>
      </Card>
    );
  }

  const isLoading = isLoadingPreview || isCheckingUrl;

  return (
    <form
      onSubmit={onSubmit}
      className={classNames(
        'flex flex-wrap items-center rounded-16 typo-callout border overflow-hidden',
        'bg-theme-float focus-within:border-theme-divider-primary border-theme-divider-tertiary hover:border-theme-divider-primary',
        className,
      )}
    >
      <ProfilePicture
        className="order-1 m-3"
        user={user}
        size="large"
        nativeLazyLoading
      />
      <input
        type="url"
        autoComplete="off"
        name="share-post-bar"
        className="flex-1 order-2 pl-1 w-24 mobileL:w-auto outline-none bg-theme-bg-transparent text-theme-label-primary focus:placeholder-theme-label-quaternary hover:placeholder-theme-label-primary typo-callout"
        placeholder="Enter link to share"
        onInput={(e) => setUrl(e.currentTarget.value)}
        value={url}
      />
      {!url && (
        <Button
          type="button"
          onClick={() => onNewSquadPost()}
          buttonSize={sidebarRendered ? ButtonSize.Small : ButtonSize.Medium}
          className={classNames(
            'btn-tertiary',
            'w-full tablet:w-auto order-4 tablet:order-3 border-t rounded-none tablet:rounded-12 border-theme-divider-tertiary border tablet:border-0',
          )}
        >
          {sidebarRendered ? 'Reading history' : 'Choose from reading history'}
        </Button>
      )}
      <Button
        type="submit"
        buttonSize={ButtonSize.Medium}
        className="order-3 tablet:order-4 mx-3 btn-primary-cabbage"
        disabled={isLoading}
        loading={isLoading}
      >
        Post
      </Button>
    </form>
  );
}

export default SharePostBar;

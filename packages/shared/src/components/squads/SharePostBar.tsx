import React, { FormEvent, ReactElement, useState } from 'react';
import classNames from 'classnames';
import { ProfilePicture } from '../ProfilePicture';
import { Button, ButtonSize } from '../buttons/Button';
import { useAuthContext } from '../../contexts/AuthContext';
import useSidebarRendered from '../../hooks/useSidebarRendered';
import { PostToSquadModalProps } from '../modals/PostToSquadModal';
import LockIcon from '../icons/Lock';
import { Card } from '../cards/Card';
import { IconSize } from '../Icon';
import { usePostToSquad } from '../../hooks/squads/usePostToSquad';

export type NewSquadPostProps = Pick<
  PostToSquadModalProps,
  'preview' | 'onSharedSuccessfully'
>;

export interface SharePostBarProps {
  className?: string;
  onNewSquadPost?: (props?: NewSquadPostProps) => Promise<null>;
  disabled?: boolean;
}

function SharePostBar({
  className,
  onNewSquadPost,
  disabled = false,
}: SharePostBarProps): ReactElement {
  const [url, setUrl] = useState('');
  const onSharedSuccessfully = () => setUrl('');
  const { getLinkPreview, isLoadingPreview } = usePostToSquad({
    onEmptyUrl: () => onNewSquadPost({ preview: { url: '' } }),
    callback: {
      onSuccess: (preview, link) =>
        onNewSquadPost({
          preview: { ...preview, url: link },
          onSharedSuccessfully,
        }),
    },
  });

  const { user } = useAuthContext();
  const { sidebarRendered } = useSidebarRendered();
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await getLinkPreview(url);
  };

  if (disabled) {
    return (
      <Card className="flex gap-1.5 items-center py-5 px-3 !flex-row hover:border-theme-divider-tertiary text-theme-label-quaternary">
        <LockIcon size={IconSize.Small} />
        <p className="typo-callout">Only admins and moderators can post</p>
      </Card>
    );
  }

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
        disabled={isLoadingPreview}
        loading={isLoadingPreview}
      >
        Post
      </Button>
    </form>
  );
}

export default SharePostBar;

import React, { FormEvent, ReactElement, useState } from 'react';
import classNames from 'classnames';
import { ProfilePicture } from '../ProfilePicture';
import { Button, ButtonSize } from '../buttons/Button';
import { useAuthContext } from '../../contexts/AuthContext';
import { PostToSquadModalProps } from '../modals/PostToSquadModal';
import LockIcon from '../icons/Lock';
import { Card } from '../cards/Card';
import { IconSize } from '../Icon';
import { usePostToSquad } from '../../hooks';
import { ClickableText } from '../buttons/ClickableText';
import useMedia from '../../hooks/useMedia';
import { mobileL } from '../../styles/media';

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
  const [url, setUrl] = useState<string>(undefined);
  const isMobile = !useMedia([mobileL.replace('@media ', '')], [true], false);
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
        'flex flex-col tablet:flex-row items-center rounded-16 typo-callout border overflow-hidden',
        'bg-theme-float focus-within:border-theme-divider-primary border-theme-divider-tertiary hover:border-theme-divider-primary',
        className,
      )}
    >
      <span className="flex relative flex-row items-center w-full">
        <ProfilePicture
          className="m-3"
          user={user}
          size="large"
          nativeLazyLoading
        />
        <input
          type="url"
          autoComplete="off"
          name="share-post-bar"
          placeholder={`Enter URL${isMobile ? '' : ' / Choose from'}`}
          className={classNames(
            'pl-1 w-24 mobileL:w-auto outline-none bg-theme-bg-transparent text-theme-label-primary focus:placeholder-theme-label-quaternary hover:placeholder-theme-label-primary typo-callout',
            url !== undefined && 'flex-1 pr-2',
          )}
          onInput={(e) => setUrl(e.currentTarget.value)}
          value={url}
          onBlur={() => !url?.length && setUrl(undefined)}
          onFocus={() => !url?.length && setUrl('')}
        />
        {url === undefined && (
          <ClickableText
            className="hidden tablet:flex ml-1 font-bold reading-history hover:text-theme-label-primary"
            inverseUnderline
            onClick={() => onNewSquadPost()}
          >
            reading history
          </ClickableText>
        )}
        <Button
          type="submit"
          buttonSize={ButtonSize.Medium}
          className="mx-3 ml-auto btn-primary-cabbage"
          disabled={isLoadingPreview || !url}
          loading={isLoadingPreview}
        >
          Post
        </Button>
      </span>
      <button
        className="flex tablet:hidden justify-center items-center py-5 w-full font-bold border-t text-theme-label-tertiary typo-callout border-theme-divider-tertiary"
        type="button"
        onClick={() => onNewSquadPost()}
      >
        Choose from reading history
      </button>
    </form>
  );
}

export default SharePostBar;

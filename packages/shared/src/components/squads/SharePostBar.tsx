import React, { FormEvent, ReactElement, useRef, useState } from 'react';
import classNames from 'classnames';
import { ProfilePicture } from '../ProfilePicture';
import { Button, ButtonSize } from '../buttons/Button';
import { useAuthContext } from '../../contexts/AuthContext';
import LockIcon from '../icons/Lock';
import { Card } from '../cards/Card';
import { IconSize } from '../Icon';
import { usePostToSquad, useViewSize, ViewSize } from '../../hooks';
import { ClickableText } from '../buttons/ClickableText';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import { Squad } from '../../graphql/sources';
import { ExternalLinkPreview } from '../../graphql/posts';

export interface SharePostBarProps {
  className?: string;
  disabled?: boolean;
  disabledText?: string;
  squad: Squad;
}

function SharePostBar({
  className,
  disabled = false,
  disabledText = 'Only admins and moderators can post',
  squad,
}: SharePostBarProps): ReactElement {
  const inputRef = useRef<HTMLInputElement>();
  const { user } = useAuthContext();
  const { openModal } = useLazyModal();
  const [url, setUrl] = useState<string>('');
  const isMobile = useViewSize(ViewSize.MobileL);
  const [urlFocused, toggleUrlFocus] = useState(false);
  const onSharedSuccessfully = () => {
    inputRef.current.value = '';
    setUrl('');
  };

  const shouldRenderReadingHistory = !urlFocused && url.length === 0;

  const onOpenCreatePost = (preview: ExternalLinkPreview, link?: string) =>
    openModal({
      type: LazyModal.CreateSharedPost,
      props: {
        preview: { ...preview, url: link },
        squad,
        onSharedSuccessfully,
      },
    });

  const onOpenHistory = () =>
    openModal({
      type: LazyModal.ReadingHistory,
      props: {
        onArticleSelected: ({ post }) => onOpenCreatePost(post, post.permalink),
        keepOpenAfterSelecting: true,
      },
    });

  const { getLinkPreview, isLoadingPreview } = usePostToSquad({
    callback: { onSuccess: onOpenCreatePost },
  });

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await getLinkPreview(url);
  };

  if (disabled) {
    return (
      <Card
        className={classNames(
          'flex gap-1.5 items-center py-5 px-3 !flex-row hover:border-theme-divider-tertiary text-theme-label-quaternary',
          className,
        )}
      >
        <LockIcon size={IconSize.Small} />
        <p className="typo-callout">{disabledText}</p>
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
          ref={inputRef}
          autoComplete="off"
          name="share-post-bar"
          placeholder={`Enter URL${isMobile ? '' : ' / Choose from'}`}
          className={classNames(
            'pl-1 tablet:min-w-[11rem] outline-none bg-theme-bg-transparent text-theme-label-primary focus:placeholder-theme-label-quaternary hover:placeholder-theme-label-primary typo-body flex-1 w-full tablet:flex-none tablet:w-auto',
            !shouldRenderReadingHistory && '!flex-1 pr-2',
          )}
          onInput={(e) => setUrl(e.currentTarget.value)}
          value={url}
          onBlur={() => toggleUrlFocus(false)}
          onFocus={() => toggleUrlFocus(true)}
        />
        {shouldRenderReadingHistory && (
          <ClickableText
            className="hidden tablet:flex ml-1.5 font-bold reading-history hover:text-theme-label-primary"
            inverseUnderline
            onClick={onOpenHistory}
            type="button"
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
        onClick={onOpenHistory}
      >
        Choose from reading history
      </button>
    </form>
  );
}

export default SharePostBar;

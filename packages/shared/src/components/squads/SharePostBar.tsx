import React, { FormEvent, ReactElement, useRef, useState } from 'react';
import classNames from 'classnames';
import { ProfilePicture } from '../ProfilePicture';
import { Button, ButtonColor, ButtonVariant } from '../buttons/ButtonV2';
import { useAuthContext } from '../../contexts/AuthContext';
import { LockIcon } from '../icons';
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
          'flex !flex-row items-center gap-1.5 px-3 py-5 text-theme-label-quaternary hover:border-theme-divider-tertiary',
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
        'flex flex-col items-center overflow-hidden rounded-16 border typo-callout tablet:flex-row',
        'border-theme-divider-tertiary bg-theme-float focus-within:border-theme-divider-primary hover:border-theme-divider-primary',
        className,
      )}
    >
      <span className="relative flex w-full flex-row items-center">
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
            'w-full flex-1 bg-theme-bg-transparent pl-1 text-theme-label-primary outline-none typo-body hover:placeholder-theme-label-primary focus:placeholder-theme-label-quaternary tablet:w-auto tablet:min-w-[11rem] tablet:flex-none',
            !shouldRenderReadingHistory && '!flex-1 pr-2',
          )}
          onInput={(e) => setUrl(e.currentTarget.value)}
          value={url}
          onBlur={() => toggleUrlFocus(false)}
          onFocus={() => toggleUrlFocus(true)}
        />
        {shouldRenderReadingHistory && (
          <ClickableText
            className="reading-history ml-1.5 hidden font-bold hover:text-theme-label-primary tablet:flex"
            inverseUnderline
            onClick={onOpenHistory}
            type="button"
          >
            reading history
          </ClickableText>
        )}
        <Button
          type="submit"
          variant={ButtonVariant.Primary}
          color={ButtonColor.Cabbage}
          className="mx-3 ml-auto"
          disabled={isLoadingPreview || !url}
          loading={isLoadingPreview}
        >
          Post
        </Button>
      </span>
      <button
        className="flex w-full items-center justify-center border-t border-theme-divider-tertiary py-5 font-bold text-theme-label-tertiary typo-callout tablet:hidden"
        type="button"
        onClick={onOpenHistory}
      >
        Choose from reading history
      </button>
    </form>
  );
}

export default SharePostBar;

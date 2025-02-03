import type { FormEvent, ReactElement } from 'react';
import React, { useRef, useState } from 'react';
import classNames from 'classnames';
import { ProfileImageSize, ProfilePicture } from '../ProfilePicture';
import { Button, ButtonColor, ButtonVariant } from '../buttons/Button';
import { useAuthContext } from '../../contexts/AuthContext';
import { LockIcon } from '../icons';
import { Card } from '../cards/common/Card';
import { IconSize } from '../Icon';
import { usePostToSquad, useViewSize, ViewSize } from '../../hooks';
import { ClickableText } from '../buttons/ClickableText';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import type { Squad } from '../../graphql/sources';
import type { ExternalLinkPreview } from '../../graphql/posts';
import { Divider } from '../utilities';

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
    onExternalLinkSuccess: onOpenCreatePost,
  });

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await getLinkPreview(url);
  };

  if (disabled) {
    return (
      <Card
        className={classNames(
          'flex !flex-row items-center gap-1.5 px-3 py-5 text-text-quaternary hover:border-border-subtlest-tertiary',
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
        'flex flex-col items-center overflow-hidden rounded-16 border p-3 pb-5 typo-callout tablet:flex-row tablet:pb-3',
        'border-border-subtlest-tertiary bg-surface-float focus-within:border-border-subtlest-primary hover:border-border-subtlest-primary',
        className,
      )}
    >
      <span className="relative flex w-full flex-row items-center">
        <div className="flex flex-1 gap-4">
          <ProfilePicture
            user={user}
            size={ProfileImageSize.Large}
            nativeLazyLoading
          />
          <div className="flex flex-1">
            <input
              type="url"
              ref={inputRef}
              autoComplete="off"
              name="share-post-bar"
              placeholder={`Enter URL${isMobile ? '' : ' / Choose from'}`}
              className={classNames(
                'bg-transparent text-text-primary outline-none typo-body hover:placeholder-text-primary focus:placeholder-text-quaternary',
                !shouldRenderReadingHistory && '!flex-1 pr-2',
                (!url || isMobile) && 'w-[12.5rem]',
              )}
              onInput={(e) => setUrl(e.currentTarget.value)}
              value={url}
              onBlur={() => toggleUrlFocus(false)}
              onFocus={() => toggleUrlFocus(true)}
            />
            {shouldRenderReadingHistory && (
              <ClickableText
                className="reading-history hidden font-bold hover:text-text-primary tablet:flex"
                inverseUnderline
                onClick={onOpenHistory}
                type="button"
              >
                reading history
              </ClickableText>
            )}
          </div>
        </div>
        <Button
          type="submit"
          variant={ButtonVariant.Primary}
          color={ButtonColor.Cabbage}
          className="ml-auto"
          disabled={isLoadingPreview || !url}
          loading={isLoadingPreview}
        >
          Post
        </Button>
      </span>
      {isMobile && (
        <Divider className="mb-5 mt-3 bg-border-subtlest-tertiary" />
      )}
      <button
        className="flex w-full items-center justify-center border-border-subtlest-tertiary font-bold text-text-tertiary typo-callout tablet:hidden"
        type="button"
        onClick={onOpenHistory}
      >
        Choose from reading history
      </button>
    </form>
  );
}

export default SharePostBar;

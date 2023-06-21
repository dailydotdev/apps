import React, { FormEvent, ReactElement, useRef, useState } from 'react';
import classNames from 'classnames';
import { ProfilePicture } from '../ProfilePicture';
import { Button, ButtonSize } from '../buttons/Button';
import { useAuthContext } from '../../contexts/AuthContext';
import LockIcon from '../icons/Lock';
import { Card } from '../cards/Card';
import { IconSize } from '../Icon';
import { usePostToSquad } from '../../hooks';
import { ClickableText } from '../buttons/ClickableText';
import useMedia from '../../hooks/useMedia';
import { mobileL } from '../../styles/media';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import { Squad } from '../../graphql/sources';
import { ExternalLinkPreview } from '../../graphql/posts';
import { TutorialKey, useTutorial } from '../../hooks/useTutorial';
import { CreateSharedPostModalProps } from '../modals/post/CreateSharedPostModal';

export type NewSquadPostProps = Pick<
  CreateSharedPostModalProps,
  'preview' | 'onSharedSuccessfully'
>;

export interface SharePostBarProps {
  className?: string;
  disabled?: boolean;
  squad: Squad;
}

function SharePostBar({
  className,
  disabled = false,
  squad,
}: SharePostBarProps): ReactElement {
  const inputRef = useRef<HTMLInputElement>();
  const { user } = useAuthContext();
  const { openModal } = useLazyModal();
  const [url, setUrl] = useState<string>(undefined);
  const isMobile = !useMedia([mobileL.replace('@media ', '')], [true], false);
  const onSharedSuccessfully = () => {
    inputRef.current.value = '';
    setUrl(undefined);
  };
  const sharePostTutorial = useTutorial({
    key: TutorialKey.ShareSquadPost,
  });

  const copyLinkTutorial = useTutorial({
    key: TutorialKey.CopySquadLink,
  });
  const onCompleteTutorials = () => {
    sharePostTutorial.complete();
    copyLinkTutorial.activate();
  };

  const onOpenCreatePost = (preview: ExternalLinkPreview, link?: string) =>
    openModal({
      type: LazyModal.CreateSharedPost,
      props: {
        preview: { ...preview, url: link },
        squad,
        onSharedSuccessfully,
        onAfterClose: onCompleteTutorials,
      },
    });

  const onOpenHistory = () =>
    openModal({
      type: LazyModal.ReadingHistory,
      props: {
        onArticleSelected: ({ post }) => onOpenCreatePost(post, post.permalink),
        keepOpenAfterSelecting: true,
        onAfterClose: onCompleteTutorials,
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
          ref={inputRef}
          autoComplete="off"
          name="share-post-bar"
          placeholder={`Enter URL${isMobile ? '' : ' / Choose from'}`}
          className={classNames(
            'pl-1 tablet:min-w-[11rem] w-full flex-1 outline-none bg-theme-bg-transparent text-theme-label-primary focus:placeholder-theme-label-quaternary hover:placeholder-theme-label-primary typo-body',
            url !== undefined && 'pr-2',
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

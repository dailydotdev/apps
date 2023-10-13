import React, { ReactElement } from 'react';
import { useMutation } from 'react-query';
import { BaseTooltipProps } from './BaseTooltip';
import { Button, ButtonSize } from '../buttons/Button';
import { ModalClose } from '../modals/common/ModalClose';
import { cloudinary } from '../../lib/image';
import { postDateFormat } from '../../lib/dateFormat';
import { Image } from '../image/Image';
import { useChangelog } from '../../hooks/useChangelog';
import { ExtensionMessageType } from '../../lib/extension';
import { useToastNotification } from '../../hooks/useToastNotification';
import { updateFirefoxExtensionLink } from '../../lib/constants';
import UpvoteIcon from '../icons/Upvote';
import CommentIcon from '../icons/Discuss';
import InteractionCounter from '../InteractionCounter';
import { checkIsExtension } from '../../lib/func';
import { UserPostVote } from '../../graphql/posts';
import InteractivePopup, { InteractivePopupPosition } from './InteractivePopup';

interface ChangelogTooltipProps<TRef> extends BaseTooltipProps {
  onRequestClose?: (e?: React.MouseEvent | React.KeyboardEvent) => void;
}

const toastMessageMap = {
  error: 'Something went wrong, try again later',
  throttled: 'There is no extension update available, try again later',
  no_update:
    "Your extension is already the latest and greatest. You're awesome 🎉",
  update_available: 'Browser extension updated 🎉',
};

function ChangelogTooltip<TRef extends HTMLElement>({
  onRequestClose,
  ...props
}: ChangelogTooltipProps<TRef>): ReactElement {
  const isExtension = checkIsExtension();
  const isFirefoxExtension = process.env.TARGET_BROWSER === 'firefox';
  const { latestPost: post, dismiss: dismissChangelog } = useChangelog();
  const toast = useToastNotification();

  const { mutateAsync: updateExtension, isLoading: isExtensionUpdating } =
    useMutation(
      async () => {
        if (isFirefoxExtension) {
          return;
        }

        if (!isExtension) {
          throw new Error(
            'updateExtension can only be used inside the extension runtime',
          );
        }

        const browser = await import('webextension-polyfill-ts').then(
          (mod) => mod.browser,
        );

        const updateResponse: { status: string } =
          await browser.runtime.sendMessage({
            type: ExtensionMessageType.RequestUpdate,
          });

        const toastMessage = toastMessageMap[updateResponse.status];

        if (toastMessage) {
          toast.displayToast(toastMessage);
        }
      },
      {
        onError: () => {
          toast.displayToast(toastMessageMap.error);
        },
      },
    );

  const onModalCloseClick = async (event) => {
    if (typeof onRequestClose === 'function') {
      onRequestClose(event);
    }

    await dismissChangelog();
  };

  const onExtensionUpdateClick = async () => {
    await updateExtension();
  };

  return (
    !!post && (
      <InteractivePopup
        {...props}
        position={InteractivePopupPosition.Unset}
        className="bottom-0 left-60 mb-6 ml-6 border shadow-2 focus:outline-none w-[24rem] max-w-[360px] max-h-[466px] changelog bg-theme-bg-tertiary border-theme-color-cabbage"
        data-testid="changelog"
      >
        <header className="flex flex-1 items-center py-3 px-4 border-b border-theme-divider-tertiary">
          <h3
            className="font-bold typo-title3 text-theme-label-primary"
            data-testid="changelogNewReleaseTag"
          >
            New release
          </h3>
          <ModalClose
            className="right-4"
            onClick={onModalCloseClick}
            data-testid="changelogModalClose"
            buttonSize={ButtonSize.XSmall}
          />
        </header>
        <section className="flex flex-col flex-1 p-5 h-full shrink max-h-full">
          <Image
            className="object-cover rounded-lg w-[207px] h-[108px]"
            alt="Post cover image"
            src={post.image}
            fallbackSrc={cloudinary.post.imageCoverPlaceholder}
            loading="lazy"
            data-testid="changelogImage"
          />
          <h3
            className="mt-3 font-normal text-theme-label-primary typo-title3"
            data-testid="changelogTitle"
          >
            {post.title}
          </h3>
          <time
            className="text-theme-label-quaternary typo-callout"
            dateTime={post.createdAt}
            data-testid="changelogDate"
          >
            {postDateFormat(post.createdAt)}
          </time>
          {!!post.summary && (
            <div
              className="mt-2 w text-theme-label-tertiary typo-callout"
              data-testid="changelogSummary"
            >
              {post.summary}
            </div>
          )}
          <div className="flex mt-4 font-bold w text-theme-color-salt typo-footnote">
            <Button
              id={`post-${post.id}-upvote-btn`}
              icon={
                <UpvoteIcon
                  secondary={post?.userState?.vote === UserPostVote.Up}
                />
              }
              pressed={post?.userState?.vote === UserPostVote.Up}
              // onClick={() => onUpvoteClick?.(post)}
              onClick={() => {}}
              buttonSize={ButtonSize.Small}
              className="btn-tertiary-avocado bg-theme-bg-tertiary"
            >
              <InteractionCounter
                value={post.numUpvotes > 0 && post.numUpvotes}
              />
            </Button>
            <Button
              id={`post-${post.id}-comment-btn`}
              icon={<CommentIcon secondary={post.commented} />}
              pressed={post.commented}
              // onClick={() => onCommentClick?.(post)}
              buttonSize={ButtonSize.Small}
              className="btn-tertiary-avocado bg-theme-bg-tertiary"
            >
              <InteractionCounter
                value={post.numComments > 0 && post.numComments}
              />
            </Button>
          </div>
        </section>
        <footer className="flex gap-3 justify-between items-center py-3 px-4 w-full h-16 border-t border-theme-divider-tertiary">
          <Button
            className="btn-tertiary"
            onClick={dismissChangelog}
            tag="a"
            href={post.commentsPermalink}
            data-testid="changelogReleaseNotesBtn"
          >
            Release notes
          </Button>
          {isExtension && (
            <Button
              tag={isFirefoxExtension ? 'a' : undefined}
              href={isFirefoxExtension ? updateFirefoxExtensionLink : undefined}
              className="bg-cabbage-40 btn-primary"
              data-testid="changelogExtensionBtn"
              loading={isExtensionUpdating}
              onClick={onExtensionUpdateClick}
            >
              Update extension
            </Button>
          )}
        </footer>
      </InteractivePopup>
    )
  );
}

export default ChangelogTooltip;

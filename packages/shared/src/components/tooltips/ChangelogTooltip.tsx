import React, { ReactElement } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button, ButtonColor, ButtonSize } from '../buttons/Button';
import { cloudinary } from '../../lib/image';
import { TimeFormatType } from '../../lib/dateFormat';
import { Image } from '../image/Image';
import { useChangelog } from '../../hooks/useChangelog';
import { ExtensionMessageType } from '../../lib/extension';
import { useToastNotification } from '../../hooks';
import { updateFirefoxExtensionLink } from '../../lib/constants';
import { DiscussIcon as CommentIcon, UpvoteIcon } from '../icons';
import InteractionCounter from '../InteractionCounter';
import { checkIsExtension } from '../../lib/func';
import { UserVote } from '../../graphql/posts';
import InteractivePopup, { InteractivePopupPosition } from './InteractivePopup';
import { Origin } from '../../lib/log';
import { QuaternaryButton } from '../buttons/QuaternaryButton';
import { ButtonVariant } from '../buttons/common';
import { DateFormat } from '../utilities';

const toastMessageMap = {
  error: 'Something went wrong, try again later',
  throttled: 'There is no extension update available, try again later',
  no_update:
    "Your extension is already the latest and greatest. You're awesome 🎉",
  update_available: 'Browser extension updated 🎉',
};

function ChangelogTooltip(): ReactElement {
  const isExtension = checkIsExtension();
  const isFirefoxExtension = process.env.TARGET_BROWSER === 'firefox';
  const {
    latestPost: post,
    dismiss: dismissChangelog,
    toggleUpvote,
  } = useChangelog();
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

        const browser = await import('webextension-polyfill').then(
          (mod) => mod.default,
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

  const onExtensionUpdateClick = async () => {
    await updateExtension();
    await dismissChangelog();
  };

  const onToggleUpvote = async () => {
    await toggleUpvote({ payload: post, origin: Origin.ChangelogPopup });
  };

  return (
    !!post && (
      <InteractivePopup
        position={InteractivePopupPosition.LeftEnd}
        className="ml-6 w-[24rem] max-w-[360px] border border-accent-cabbage-default bg-accent-pepper-subtlest shadow-2 focus:outline-none"
        data-testid="changelog"
        onClose={dismissChangelog}
        closeButton={{
          variant: ButtonVariant.Tertiary,
        }}
      >
        <header className="flex flex-1 items-center border-b border-border-subtlest-tertiary px-4 py-3">
          <h3
            className="font-bold text-text-primary typo-title3"
            data-testid="changelogNewReleaseTag"
          >
            New release
          </h3>
        </header>
        <section className="flex h-full max-h-full flex-1 shrink flex-col p-5">
          <Image
            className="h-[108px] w-[207px] rounded-8 object-cover"
            alt="Post cover image"
            src={post.image}
            fallbackSrc={cloudinary.post.imageCoverPlaceholder}
            loading="lazy"
            data-testid="changelogImage"
          />
          <h3
            className="mt-3 font-normal text-text-primary typo-title3"
            data-testid="changelogTitle"
          >
            {post.title}
          </h3>
          <DateFormat
            data-testid="changelogDate"
            date={post.createdAt}
            type={TimeFormatType.Post}
            className="text-text-quaternary typo-callout"
          />
          {!!post.summary && (
            <div
              className="w mt-2 text-text-tertiary typo-callout"
              data-testid="changelogSummary"
            >
              {post.summary}
            </div>
          )}
          <div className="mt-4 flex">
            <QuaternaryButton
              id={`post-${post.id}-upvote-btn`}
              icon={
                <UpvoteIcon secondary={post?.userState?.vote === UserVote.Up} />
              }
              pressed={post?.userState?.vote === UserVote.Up}
              onClick={onToggleUpvote}
              size={ButtonSize.Small}
              className="btn-tertiary-avocado"
              data-testid="changelogUpvotesButton"
            >
              <InteractionCounter
                value={post.numUpvotes > 0 && post.numUpvotes}
                data-testid="changelogUpvotesCounter"
              />
            </QuaternaryButton>
            <QuaternaryButton
              id={`post-${post.id}-comment-btn`}
              icon={<CommentIcon secondary={post.commented} />}
              pressed={post.commented}
              tag="a"
              href={post.commentsPermalink}
              onClick={dismissChangelog}
              size={ButtonSize.Small}
              className="btn-tertiary-blueCheese"
              data-testid="changelogCommentsButton"
            >
              <InteractionCounter
                value={post.numComments > 0 && post.numComments}
                data-testid="changelogCommentsCounter"
              />
            </QuaternaryButton>
          </div>
        </section>
        <footer className="flex h-16 w-full items-center justify-between border-t border-border-subtlest-tertiary p-3">
          <Button
            onClick={dismissChangelog}
            tag="a"
            href={post.commentsPermalink}
            data-testid="changelogReleaseNotesBtn"
            variant={ButtonVariant.Tertiary}
          >
            Release notes
          </Button>
          {isExtension && (
            <Button
              tag={isFirefoxExtension ? 'a' : undefined}
              href={isFirefoxExtension ? updateFirefoxExtensionLink : undefined}
              data-testid="changelogExtensionBtn"
              loading={isExtensionUpdating}
              onClick={onExtensionUpdateClick}
              variant={ButtonVariant.Primary}
              color={ButtonColor.Cabbage}
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

import React, { MutableRefObject, ReactElement } from 'react';
import { useMutation } from 'react-query';
import { BaseTooltip, BaseTooltipProps } from './BaseTooltip';
import { Button } from '../buttons/Button';
import { ModalClose } from '../modals/common/ModalClose';
import { cloudinary } from '../../lib/image';
import { postDateFormat } from '../../lib/dateFormat';
import { Image } from '../image/Image';
import { useChangelog } from '../../hooks/useChangelog';
import { ExtensionMessageType } from '../../lib/extension';
import { useToastNotification } from '../../hooks/useToastNotification';
import { updateFirefoxExtensionLink } from '../../lib/constants';

interface ChangelogTooltipProps<TRef> extends BaseTooltipProps {
  elementRef: MutableRefObject<TRef>;
  onRequestClose?: (e?: React.MouseEvent | React.KeyboardEvent) => void;
}

const tooltipArrowOffset: [number, number] = [6 * 16, 2.5 * 16];

const toastMessageMap = {
  error: 'Something went wrong, try again later',
  throttled: 'There is no update available, try again later',
  no_update: 'You are already on the latest available version',
  update_available: 'Browser extension updated',
};

function ChangelogTooltip<TRef extends HTMLElement>({
  elementRef,
  onRequestClose,
  ...props
}: ChangelogTooltipProps<TRef>): ReactElement {
  const isExtension = !!process.env.TARGET_BROWSER;
  const isFirefoxExtension = process.env.TARGET_BROWSER === 'firefox';
  const { latestPost: post, dismiss: dismissChangelog } = useChangelog();
  const toast = useToastNotification();

  const { mutateAsync: updateExtension, isLoading: isExtensionUpdating } =
    useMutation(async () => {
      if (isFirefoxExtension) {
        return;
      }

      if (!isExtension) {
        toast.displayToast(toastMessageMap.error);

        return;
      }

      const sendMessage = globalThis?.browser?.runtime?.sendMessage;

      if (typeof sendMessage !== 'function') {
        toast.displayToast(toastMessageMap.error);

        return;
      }

      const updateResponse: { status: string } = await sendMessage({
        type: ExtensionMessageType.RequestUpdate,
      });

      const toastMessage = toastMessageMap[updateResponse.status];

      if (toastMessage) {
        toast.displayToast(toastMessage);
      }
    });

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
    <BaseTooltip
      {...props}
      content={
        !!post && (
          <div
            className="flex flex-col w-96 whitespace-normal break-words rounded-16 border shadow-2 focus:outline-none changelog bg-theme-bg-tertiary border-theme-color-cabbage"
            data-testid="changelog"
          >
            <header className="flex flex-1 items-center py-3 px-4 border-b border-theme-divider-tertiary">
              <Button
                disabled
                className="text-white bg-theme-color-water btn-primary small"
                data-testid="changelogNewReleaseTag"
              >
                New release
              </Button>
              <ModalClose
                onClick={onModalCloseClick}
                data-testid="changelogModalClose"
              />
            </header>
            <section className="flex flex-col flex-1 p-5 h-full shrink max-h-full">
              <Image
                className="object-cover w-44 h-28 rounded-lg"
                alt="Post Cover image"
                src={post.image}
                fallbackSrc={cloudinary.post.imageCoverPlaceholder}
                loading="lazy"
                data-testid="changelogImage"
              />
              <h3
                className="mt-2 font-bold text-theme-label-primary typo-title3"
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
              <div className="mt-2 w text-theme-label-tertiary typo-callout">
                {post.summary}
              </div>
            </section>
            <footer className="flex gap-3 items-center py-3 px-4 w-full h-16 border-t border-theme-divider-tertiary">
              <Button
                className="btn-tertiary"
                onClick={dismissChangelog}
                tag="a"
                href={post.permalink}
                data-testid="changelogReleaseNotesBtn"
              >
                Release notes
              </Button>
              {isExtension && (
                <Button
                  tag={isFirefoxExtension ? 'a' : undefined}
                  href={
                    isFirefoxExtension ? updateFirefoxExtensionLink : undefined
                  }
                  className="bg-cabbage-40 btn-primary"
                  data-testid="changelogExtensionBtn"
                  loading={isExtensionUpdating}
                  onClick={onExtensionUpdateClick}
                >
                  Update extension
                </Button>
              )}
            </footer>
          </div>
        )
      }
      offset={tooltipArrowOffset}
      interactive
      container={{
        className: 'shadow',
        paddingClassName: 'p-0',
        roundedClassName: 'rounded-16',
        bgClassName: 'bg-cabbage-40',
        arrowClassName:
          'bg-cabbage-40 bottom-24 !left-0 !h-2.5 !w-0 flex items-center justify-end before:!w-10 before:!h-px before:!transform-none',
      }}
      reference={elementRef}
      arrow
      placement="right-end"
      visible={!!post}
      zIndex={9}
    />
  );
}

export default ChangelogTooltip;

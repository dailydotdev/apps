import React, {
  MutableRefObject,
  ReactElement,
  useContext,
  useMemo,
} from 'react';
import { useMutation } from 'react-query';
import classNames from 'classnames';
import { sticky } from 'tippy.js';
import { BaseTooltip, BaseTooltipProps } from './BaseTooltip';
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
import SettingsContext from '../../contexts/SettingsContext';
import { AlertColor, AlertDot } from '../AlertDot';

interface ChangelogTooltipProps<TRef> extends BaseTooltipProps {
  elementRef: MutableRefObject<TRef>;
  onRequestClose?: (e?: React.MouseEvent | React.KeyboardEvent) => void;
}

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
  const { sidebarExpanded } = useContext(SettingsContext);

  const tooltipArrowOffset: [number, number] = useMemo(() => {
    return [(sidebarExpanded ? 7.5 : 2.5) * 16, 2 * 16];
  }, [sidebarExpanded]);

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
            className="flex relative flex-col whitespace-normal break-words rounded-16 border shadow-2 focus:outline-none w-[24rem] changelog bg-theme-bg-tertiary border-theme-color-cabbage"
            data-testid="changelog"
          >
            <header className="flex flex-1 items-center py-3 px-4 border-b border-theme-divider-tertiary">
              <Button
                disabled
                className="font-normal text-white bg-theme-color-water btn-primary small"
                data-testid="changelogNewReleaseTag"
              >
                New release
              </Button>
              <ModalClose
                className="right-4"
                onClick={onModalCloseClick}
                data-testid="changelogModalClose"
                buttonSize={ButtonSize.XSmall}
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
              <div className="flex gap-4 py-2 px-3 mt-4 font-bold w text-theme-color-salt typo-footnote">
                <span
                  className="flex gap-2"
                  data-testid="changelogUpvotesCounter"
                >
                  <UpvoteIcon secondary />
                  <InteractionCounter value={post.numUpvotes} />
                </span>
                <span
                  className="flex gap-2"
                  data-testid="changelogCommentsCounter"
                >
                  <CommentIcon secondary />
                  <InteractionCounter value={post.numComments} />
                </span>
              </div>
            </section>
            <footer className="flex gap-3 justify-between items-center py-3 px-4 w-full h-16 border-t border-theme-divider-tertiary">
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
        ArrowComponent: ({ className, ...arrowProps }) => {
          return (
            <div
              {...arrowProps}
              className={classNames(
                'flex items-center h-2 -z-1',
                sidebarExpanded ? '-left-14' : '-left-[2.65rem]',
              )}
            >
              <div
                className={classNames(
                  sidebarExpanded ? 'w-16' : 'w-[4.65rem]',
                  'h-px bg-cabbage-40',
                )}
              />
              <AlertDot color={AlertColor.Cabbage} />
            </div>
          );
        },
      }}
      reference={elementRef}
      placement="right-end"
      visible={!!post}
      zIndex={9}
      sticky
      plugins={[sticky]}
    />
  );
}

export default ChangelogTooltip;

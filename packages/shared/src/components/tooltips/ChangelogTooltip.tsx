import React, { MutableRefObject, ReactElement } from 'react';
import { BaseTooltip } from './BaseTooltip';
import { Button } from '../buttons/Button';
import { ModalClose } from '../modals/common/ModalClose';
import styles from './ChangelogTooltip.module.css';
import { cloudinary } from '../../lib/image';
import { postDateFormat } from '../../lib/dateFormat';
import { Image } from '../image/Image';
import { useChangelog } from '../../hooks/useChangelog';
import { ExtensionMessageType } from '../../lib/extension';

interface ChangelogTooltipProps<TRef> {
  elementRef: MutableRefObject<TRef>;
  onRequestClose?: (e?: React.MouseEvent | React.KeyboardEvent) => void;
}

function ChangelogTooltip<TRef extends HTMLElement>({
  elementRef,
  onRequestClose,
  ...props
}: ChangelogTooltipProps<TRef>): ReactElement {
  // TODO WT-1045 check if current extension version is up to date
  const isExtension = !!process.env.TARGET_BROWSER;
  const { latestPost: post, dismiss: dismissChangelog } = useChangelog();

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
                onClick={(event) => {
                  if (typeof onRequestClose === 'function') {
                    onRequestClose(event);
                  }

                  dismissChangelog();
                }}
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
                  className="bg-cabbage-40 btn-primary"
                  data-testid="changelogExtensionBtn"
                  onClick={() => {
                    if (isExtension) {
                      const sendMessage =
                        globalThis?.browser?.runtime?.sendMessage;

                      if (typeof sendMessage === 'function') {
                        sendMessage({
                          type: ExtensionMessageType.RequestUpdate,
                        });
                      }
                    }
                  }}
                >
                  Update extension
                </Button>
              )}
            </footer>
          </div>
        )
      }
      offset={[6 * 16, 2.5 * 16]}
      interactive
      container={{
        className: 'shadow',
        paddingClassName: 'p-0',
        roundedClassName: 'rounded-16',
        bgClassName: 'bg-cabbage-40',
        arrowClassName: styles.changelogTooltipArrow,
      }}
      reference={elementRef}
      arrow
      placement="right-end"
      visible={!!post}
    />
  );
}

export default ChangelogTooltip;

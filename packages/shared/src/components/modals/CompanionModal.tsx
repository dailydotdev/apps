import React, { ReactElement, useMemo, useState } from 'react';

import classNames from 'classnames';
import { LazyModalCommonProps, Modal } from './common/Modal';
import { Button, ButtonSize } from '../buttons/Button';
import UnreadIcon from '../icons/Unread';
import CommentIcon from '../icons/Discuss';
import MiniCloseIcon from '../icons/MiniClose';
import BookmarkIcon from '../icons/Bookmark';
import { IconSize } from '../Icon';
import useMedia from '../../hooks/useMedia';
import { mobileL, tablet } from '../../styles/media';
import { cloudinary } from '../../lib/image';

type Props = LazyModalCommonProps & {
  url: string;
  onClose: () => void;
  onReadArticleClick: (any) => void;
  onActivateCompanion: (redirectUrl?: string) => void;
};

export default function CompanionModal({
  onReadArticleClick,
  onActivateCompanion,
  url,
  ...props
}: Props): ReactElement {
  const isTablet = !useMedia([tablet.replace('@media ', '')], [true], false);
  const isMobile = !useMedia([mobileL.replace('@media ', '')], [true], false);
  const [loaded, toggleLoaded] = useState(false);

  const size = useMemo(() => {
    if (isMobile) return Modal.Size.XSmall;
    if (isTablet) return Modal.Size.Small;

    return Modal.Size.XLarge;
  }, [isTablet, isMobile]);

  return (
    <Modal
      {...props}
      className="border-none"
      kind={Modal.Kind.FlexibleCenter}
      size={size}
    >
      {isTablet && (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <video
          className="tablet:hidden rounded-16 w-fit"
          poster={cloudinary.companion.videoThumbnailMobile}
          loop
          autoPlay
        >
          <source
            src={cloudinary.companion.backgroundVideoMobile}
            type="video/mp4"
          />
        </video>
      )}

      {!isTablet && (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <video
          className={classNames('hidden tablet:block rounded-16 w-fit', {
            'min-h-[40rem]': !loaded,
          })}
          poster={cloudinary.companion.videoThumbnailDesktop}
          loop
          autoPlay
          onLoadedData={() => toggleLoaded(true)}
        >
          <source
            src={cloudinary.companion.backgroundVideoDesktop}
            type="video/mp4"
          />
        </video>
      )}

      <div className="absolute top-3 right-3">
        <Button
          icon={<MiniCloseIcon />}
          className="btn-secondary"
          buttonSize={ButtonSize.XSmall}
          onClick={props.onClose}
        />
      </div>

      <div className="flex tablet:absolute top-auto tablet:top-0.5 right-0 tablet:right-auto bottom-0 tablet:bottom-0.5 left-0 tablet:left-0.5 flex-col items-center py-8 px-6 w-full tablet:w-2/5 rounded-16 bg-theme-bg-tertiary h-fill">
        <h2 className="pb-3 font-bold text-center typo-title1">
          Level up your reading experience
        </h2>

        <p className="pb-6 text-xl text-center text-theme-label-tertiary">
          AI generated summaries, upvoting, commenting, sharing, and more from
          anywhere on the web
        </p>

        <Button
          className="mb-4 w-full btn-primary"
          onClick={() => onActivateCompanion(url)}
        >
          Read and activate widget
        </Button>

        <Button
          className="mb-6 w-full btn-tertiaryFloat"
          onClick={onReadArticleClick}
          tag="a"
          target="_blank"
          href={url}
          rel="noopener"
        >
          Read post
        </Button>

        <div className="flex flex-col flex-1 justify-between">
          <div className="hidden tablet:flex flex-col items-center">
            <div className="flex items-center pb-4">
              <div className="inline-block p-2 mr-2 bg-theme-active rounded-16">
                <UnreadIcon
                  size={IconSize.Medium}
                  secondary
                  className="text-theme-color-cabbage"
                />
              </div>

              <span>Get a TLDR on the original post</span>
            </div>
            <div className="hidden tablet:flex items-center pb-4">
              <div className="inline-block p-2 mr-2 bg-theme-active rounded-16">
                <CommentIcon
                  size={IconSize.Medium}
                  secondary
                  className="text-theme-color-blueCheese"
                />
              </div>
              <span>Discuss from everywhere</span>
            </div>
            <div className="hidden tablet:flex items-center pb-4">
              <div className="inline-block p-2 mr-2 bg-theme-active rounded-16">
                <BookmarkIcon
                  secondary
                  size={IconSize.Medium}
                  className="text-theme-color-bun"
                />
              </div>
              <span>Bookmark with a single click</span>
            </div>
          </div>

          <span className="text-center text-theme-label-tertiary typo-footnote">
            Activating the widget requires extra permissions <br />
            (Give it a try, you can always disable it later)
          </span>
        </div>
      </div>
    </Modal>
  );
}

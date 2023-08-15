import React, { ReactElement } from 'react';

import { LazyModalCommonProps, Modal } from './common/Modal';
import { Button } from '../buttons/Button';
import UpvoteIcon from '../icons/Upvote';
import CommentIcon from '../icons/Discuss';
import LineIcon from '../icons/Line';
import { IconSize } from '../Icon';

type Props = LazyModalCommonProps & {
  url: string;
  onReadArticleClick: (any) => void;
  onActivateCompanion: () => void;
};

export default function CompanionModal({
  onReadArticleClick,
  onActivateCompanion,
  url,
  ...props
}: Props): ReactElement {
  return (
    <Modal
      {...props}
      className="border-none"
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.XLarge}
    >
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        className="tablet:hidden rounded-16 w-fit"
        poster="https://daily-now-res.cloudinary.com/image/upload/s--IqqAH4Rt--/f_auto/v1689497816/mobile-image_zb923g"
        loop
        autoPlay
      >
        <source
          src="https://daily-now-res.cloudinary.com/video/upload/s--XAM05C_P--/v1689497504/final_mobile_cm24ad.mp4"
          type="video/mp4"
        />
      </video>

      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        className="hidden tablet:block rounded-16 w-fit"
        poster="https://daily-now-res.cloudinary.com/image/upload/s--7w2Deabi--/f_auto/v1689497816/web-image_yomdsz"
        loop
        autoPlay
      >
        <source
          src="https://daily-now-res.cloudinary.com/video/upload/s--2N7_JImI--/v1689497504/final_web_rkupko.mp4"
          type="video/mp4"
        />
      </video>

      <div className="flex tablet:absolute top-auto tablet:top-0.5 right-0 tablet:right-auto bottom-0 tablet:bottom-0.5 left-0 tablet:left-0.5 flex-col items-center py-8 px-6 w-full tablet:w-2/5 rounded-16 bg-theme-bg-tertiary h-fill">
        <h2 className="pb-3 font-bold text-center typo-title1">
          Level up your reading experience
        </h2>

        <p className="pb-6 text-center text-theme-label-tertiary">
          AI generated summaries, upvoting, commenting, sharing, and more from
          anywhere on the web
        </p>

        <Button
          className="mb-4 w-full btn-primary"
          onClick={onActivateCompanion}
        >
          Read and activate widget
        </Button>

        <Button
          className="mb-6 w-full btn-tertiary"
          onClick={onReadArticleClick}
          tag="a"
          target="_blank"
          href={url}
        >
          Read post
        </Button>

        <div className="flex flex-col flex-1 justify-between">
          <div className="hidden tablet:flex flex-col items-center">
            <div className="flex items-center pb-4">
              <div className="inline-block p-2 mr-2 bg-theme-active rounded-16">
                <LineIcon
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
                <UpvoteIcon
                  secondary
                  size={IconSize.Medium}
                  className="text-theme-color-avocado"
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
